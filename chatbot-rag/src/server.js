/**
 * Server — HTTP endpoint Express untuk chatbot RAG.
 *
 * Endpoints:
 *  - GET  /api/health   → status server, provider/model LLM, jumlah chunks
 *  - GET  /api/sources  → daftar dokumen ter-index dengan jumlah chunks per file
 *  - POST /api/reindex  → rebuild vector store tanpa restart (untuk hot-update KB)
 *  - POST /api/chat     → streaming chat (SSE) atau non-streaming JSON response
 *
 * Static UI di-serve dari folder public/.
 *
 * Bootstrap flow:
 *  1. Build index dari src/docs (await — server tidak listen sebelum index siap)
 *  2. Listen di PORT
 *  3. Crash-on-bootstrap policy: kalau index gagal, exit(1) supaya tidak serve broken state
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIndex, getIndexMeta, getSourcesSummary } from './indexer.js';
import { retrieve, mergeRetrievalResults } from './retriever.js';
import {
  buildPrompt,
  generateStream,
  generate,
  rewriteQuery,
  checkLLMStatus,
  llmConfig,
  llmErrorPayload,
} from './llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const PORT = parseInt(process.env.PORT || '3000', 10);
const TOP_K = parseInt(process.env.TOP_K || '5', 10);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
const QUERY_REWRITE = (process.env.QUERY_REWRITE || 'true').toLowerCase() === 'true';

const app = express();

/** Lock supaya tidak ada dua reindex jalan paralel — embedding model bisa overwhelm. */
let indexing = false;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(PROJECT_ROOT, 'public')));

/**
 * GET /api/health
 * Cek status keseluruhan: provider LLM, model aktif, status koneksi LLM,
 * dan ringkasan index. Dipakai UI untuk indikator status di header.
 */
app.get('/api/health', async (_req, res) => {
  const meta = getIndexMeta();
  const llmStatus = await checkLLMStatus();
  res.json({
    status: 'ok',
    provider: llmConfig.provider,
    model: llmConfig.model,
    embedding_model: EMBEDDING_MODEL,
    documents_indexed: meta.documentsIndexed,
    chunks_indexed: meta.chunksIndexed,
    last_indexed_at: meta.lastIndexedAt,
    llm_status: llmStatus,
  });
});

/**
 * GET /api/sources
 * Detail per-file: list semua dokumen yang ter-index + jumlah chunks + ukuran.
 * Berguna untuk debug ("kenapa dokumen X tidak ke-retrieve?" — cek dulu apakah ke-index).
 */
app.get('/api/sources', (_req, res) => {
  res.json(getSourcesSummary());
});

/**
 * POST /api/reindex
 * Rebuild vector store dari nol. Dipanggil setelah user tambah/ubah dokumen di
 * src/docs/ dan tidak mau restart server.
 *
 * Concurrency: kalau sudah ada reindex jalan, return 429 daripada queue —
 * indexing operation sudah include "wipe + rebuild", running 2x paralel tidak masuk akal.
 */
app.post('/api/reindex', async (_req, res) => {
  if (indexing) {
    res.status(429).json({
      error: 'INDEXING_IN_PROGRESS',
      message: 'Reindex sedang berjalan, coba lagi sebentar',
    });
    return;
  }
  indexing = true;
  const startedAt = Date.now();
  try {
    await buildIndex();
    const meta = getIndexMeta();
    res.json({
      status: 'ok',
      documents_indexed: meta.documentsIndexed,
      chunks_indexed: meta.chunksIndexed,
      duration_ms: Date.now() - startedAt,
    });
  } catch (err) {
    console.error('[Reindex] Error:', err);
    res.status(500).json({ error: 'REINDEX_FAILED', message: err.message });
  } finally {
    indexing = false;
  }
});

/**
 * Helper untuk write Server-Sent Events ke response. Format wajib:
 * `data: <json>\n\n`. Caller bertanggung jawab set headers SSE sebelum panggil ini.
 *
 * @param {import('express').Response} res
 * @param {Object} payload Object yang akan di-serialize jadi JSON
 */
function sseWrite(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/**
 * Token tunggal yang dianggap "trivial" — sapaan, perintah pendek, atau
 * acknowledgment yang tidak butuh retrieval dokumen. Pesan yang match akan
 * skip retrieval + skip query rewriting, langsung kirim ke LLM dengan instruksi
 * "balas ramah" (lihat trivial.md).
 */
const TRIVIAL_TOKENS = new Set([
  'hi', 'hello', 'halo', 'hai', 'hey', 'helo', 'yo',
  'pagi', 'siang', 'sore', 'malam',
  'thanks', 'thx', 'makasih', 'terimakasih',
  'ok', 'oke', 'okay', 'sip', 'bagus', 'baik', 'mantap',
  'test', 'testing', 'coba', 'ping',
  'clear', 'reset', 'bersihkan',
]);

/** Frasa multi-kata yang juga dianggap trivial. */
const TRIVIAL_PHRASES = [
  'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
  'terima kasih', 'thank you',
];

/**
 * Cek apakah pesan user berupa sapaan / pesan singkat tanpa konten substantif.
 * Trim, lowercase, dan strip tanda baca akhir sebelum match.
 *
 * @param {string} msg Pesan dari user
 * @returns {boolean}
 */
function isTrivialMessage(msg) {
  const t = String(msg || '').trim().toLowerCase().replace(/[!.?,]+$/g, '');
  if (t.length === 0) return true;
  if (TRIVIAL_TOKENS.has(t)) return true;
  if (TRIVIAL_PHRASES.includes(t)) return true;
  return false;
}

/**
 * POST /api/chat
 * Endpoint utama chat. Flow:
 *  1. Validasi input
 *  2. Deteksi trivial — kalau ya, skip retrieval
 *  3. Kalau non-trivial:
 *     a. (Optional) rewriteQuery() pecah jadi sub-kueri (multi-intent)
 *     b. retrieve() paralel untuk tiap sub-kueri
 *     c. mergeRetrievalResults() dedup + sort
 *  4. buildPrompt() rakit payload {system, messages}
 *  5. Stream (SSE) atau JSON response
 *
 * Body request:
 *   - message  (string, wajib)
 *   - history  (array {role, content}, optional — riwayat percakapan)
 *   - stream   (boolean, default true — pakai SSE)
 *
 * Response SSE event types:
 *   - sources  → list chunks yang dipakai sebagai konteks (untuk UI "Sumber")
 *   - token    → text delta dari LLM (incremental)
 *   - error    → error mid-stream
 *   - done     → akhir stream
 */
app.post('/api/chat', async (req, res) => {
  const { message, history = [], stream = true } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({
      error: 'INVALID_REQUEST',
      message: 'Field "message" wajib diisi (string non-kosong)',
    });
    return;
  }

  const trivial = isTrivialMessage(message);

  let sources = [];
  if (!trivial) {
    let queries = [message];
    if (QUERY_REWRITE) {
      queries = await rewriteQuery(message, history);
      const rewritten = queries.length !== 1 || queries[0] !== message;
      if (rewritten) {
        console.log(`[Chat] Rewrote into ${queries.length} sub-quer${queries.length > 1 ? 'ies' : 'y'}:`, queries);
      }
    }

    try {
      const allResults = await Promise.all(queries.map((q) => retrieve(q, TOP_K)));
      sources = queries.length > 1 ? mergeRetrievalResults(allResults, TOP_K) : allResults[0];
    } catch (err) {
      console.error('[Chat] Retrieval error:', err);
      res.status(500).json({ error: 'RETRIEVAL_FAILED', message: err.message });
      return;
    }
  }

  // Sources payload yang dikirim ke client. Strip `content` (full text) — hanya
  // file + score + snippet untuk display di UI. Konten penuh tetap dipakai
  // server-side via `sources` untuk buildPrompt().
  const sourcesPayload = sources.map((s) => ({
    file: s.file,
    score: s.score,
    snippet: s.snippet,
  }));

  const prompt = buildPrompt(sources, history, message, { trivial });

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    // X-Accel-Buffering: no — penting saat behind nginx, supaya nginx tidak
    // buffer SSE chunks (default behavior-nya buffer = stream tidak terasa real-time)
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    sseWrite(res, { type: 'sources', sources: sourcesPayload });

    try {
      for await (const chunk of generateStream(prompt)) {
        if (chunk.content) {
          sseWrite(res, { type: 'token', content: chunk.content });
        }
        if (chunk.done) {
          sseWrite(res, { type: 'done' });
          res.end();
          return;
        }
      }
      sseWrite(res, { type: 'done' });
      res.end();
    } catch (err) {
      console.error('[Chat] Stream error:', err);
      const { body } = llmErrorPayload(err);
      sseWrite(res, { type: 'error', ...body });
      res.end();
    }
    return;
  }

  // Non-streaming path: kirim JSON sekali setelah LLM selesai.
  try {
    const reply = await generate(prompt);
    res.json({ reply, sources: sourcesPayload });
  } catch (err) {
    console.error('[Chat] Generate error:', err);
    const { status, body } = llmErrorPayload(err);
    res.status(status).json(body);
  }
});

/** Catch-all error handler — log + 500 generic, hindari leak stack trace ke client. */
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
});

/**
 * Bootstrap: build index dulu, baru listen. Kalau index gagal, server tidak
 * jalan — lebih baik fail-fast daripada serve dengan vector store kosong.
 */
(async function bootstrap() {
  try {
    console.log('[Server] Bootstrapping...');
    await buildIndex();
    app.listen(PORT, () => {
      console.log(`[Server] Listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Bootstrap failed:', err);
    process.exit(1);
  }
})();
