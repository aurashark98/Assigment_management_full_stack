/**
 * Indexer — load semua dokumen markdown dari DOCS_DIR, potong jadi chunk,
 * konversi tiap chunk jadi vektor embedding, simpan di in-memory vectorStore.
 *
 * Pipeline:
 *  1. walkDocs(): recursive read semua *.md
 *  2. chunkText(): potong tiap dokumen jadi chunk ~CHUNK_SIZE karakter dengan overlap
 *  3. embed(): konversi tiap chunk jadi vektor via @xenova/transformers (run lokal, no API)
 *  4. simpan ke vectorStore
 *
 * vectorStore di-export sebagai mutable binding karena retriever.js perlu akses
 * langsung ke array. State juga di-rebuild saat reindex (lewat /api/reindex).
 *
 * Konsumer: src/server.js (bootstrap + endpoint reindex), src/retriever.js (search).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@xenova/transformers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const DOCS_DIR = path.resolve(PROJECT_ROOT, process.env.DOCS_DIR || './src/docs');
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '900', 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '150', 10);

/**
 * @typedef {Object} VectorStoreEntry
 * @property {string}   file      Path relatif file sumber (POSIX-style)
 * @property {number}   index     Urutan chunk dalam file (0-based)
 * @property {string}   content   Isi chunk
 * @property {number[]} embedding Vektor hasil model embedding
 */

/** @type {VectorStoreEntry[]} In-memory vector store. Di-rebuild tiap kali buildIndex(). */
export let vectorStore = [];

let indexMeta = {
  documentsIndexed: 0,
  chunksIndexed: 0,
  lastIndexedAt: null,
  perFileStats: {},
};

let embedder = null;
let embedderInitPromise = null;

/**
 * Lazy-init embedding model. First run akan download ~25MB ke local cache
 * (`~/.cache/huggingface/...`). Singleton — promise di-cache supaya call concurrent
 * tidak trigger download paralel.
 *
 * @returns {Promise<Function>} Fungsi embedder dari @xenova/transformers
 */
async function initEmbedder() {
  if (embedder) return embedder;
  if (embedderInitPromise) return embedderInitPromise;

  embedderInitPromise = (async () => {
    console.log(`[Indexer] Loading embedding model: ${EMBEDDING_MODEL}`);
    console.log('[Indexer] First run will download ~25MB to local cache, please wait...');
    embedder = await pipeline('feature-extraction', EMBEDDING_MODEL);
    console.log('[Indexer] Embedding model ready');
    return embedder;
  })();

  return embedderInitPromise;
}

/**
 * Recursive walk: kumpulkan semua file *.md di `dir` dan sub-foldernya.
 * Kalau `dir` tidak ada, return [] (dengan warning), bukan throw — supaya server
 * tetap bisa bootstrap walaupun KB belum disiapkan.
 *
 * @param {string} dir Path absolut folder yang akan dijelajahi
 * @returns {Promise<string[]>} Array path absolut file *.md
 */
async function walkDocs(dir) {
  const result = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[Indexer] Docs directory tidak ditemukan: ${dir}`);
      return result;
    }
    throw err;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await walkDocs(fullPath);
      result.push(...subFiles);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      result.push(fullPath);
    }
  }
  return result;
}

/**
 * Potong teks panjang jadi chunks dengan sliding window. Tiap chunk berukuran
 * `size` karakter, dengan `overlap` karakter overlap dengan chunk sebelumnya.
 *
 * Overlap penting: tanpa overlap, kalimat penting bisa terpotong tepat di batas
 * chunk dan dua chunk yang berdekatan kehilangan konteks bersama.
 *
 * @param {string} text Teks yang akan dipotong
 * @param {number} [size=CHUNK_SIZE] Ukuran chunk (karakter)
 * @param {number} [overlap=CHUNK_OVERLAP] Overlap antar chunk (karakter)
 * @returns {string[]} Array chunk, sudah di-trim
 */
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  if (!text || text.length === 0) return [];
  if (text.length <= size) return [text.trim()].filter(Boolean);

  const chunks = [];
  const step = Math.max(1, size - overlap);
  for (let start = 0; start < text.length; start += step) {
    const slice = text.slice(start, start + size).trim();
    if (slice.length > 0) chunks.push(slice);
    if (start + size >= text.length) break;
  }
  return chunks;
}

/**
 * Konversi 1 string teks jadi vektor embedding. Pakai mean pooling + L2 normalize
 * supaya cocok dipakai dengan cosine similarity di retriever.
 *
 * @param {string} text Teks yang akan di-embed
 * @returns {Promise<number[]>} Vektor (dimensi tergantung model, default 384)
 */
export async function embed(text) {
  const e = await initEmbedder();
  const output = await e(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Convert path absolut jadi POSIX-style relatif terhadap DOCS_DIR.
 * Contoh: `C:\workspace\...\src\docs\sub\file.md` -> `sub/file.md`.
 * Berguna supaya nama file di citation konsisten cross-platform.
 *
 * @param {string} absPath Path absolut
 * @returns {string} Path relatif POSIX-style
 */
function toPosixRelative(absPath) {
  return path.relative(DOCS_DIR, absPath).split(path.sep).join('/');
}

/**
 * Build (atau rebuild) seluruh index dari nol:
 *  - Scan DOCS_DIR untuk semua *.md
 *  - Potong tiap file jadi chunks
 *  - Embed tiap chunk
 *  - Replace vectorStore dengan hasil baru
 *  - Update indexMeta dengan statistik
 *
 * Dipanggil saat bootstrap server, dan saat user POST /api/reindex.
 * Kalau folder kosong, vectorStore di-clear dan return meta dengan 0 docs.
 *
 * @returns {Promise<Object>} Index meta + duration_ms
 */
export async function buildIndex() {
  const startedAt = Date.now();
  console.log(`[Indexer] Reading markdown files from: ${DOCS_DIR}`);

  const files = await walkDocs(DOCS_DIR);
  console.log(`[Indexer] Found ${files.length} markdown files`);

  if (files.length === 0) {
    vectorStore = [];
    indexMeta = {
      documentsIndexed: 0,
      chunksIndexed: 0,
      lastIndexedAt: new Date().toISOString(),
      perFileStats: {},
    };
    console.warn('[Indexer] Knowledge base kosong. Tambahkan file .md ke ' + DOCS_DIR);
    return indexMeta;
  }

  await initEmbedder();

  const newStore = [];
  const perFileStats = {};

  for (const filePath of files) {
    const relFile = toPosixRelative(filePath);
    const raw = await fs.readFile(filePath, 'utf-8');
    const chunks = chunkText(raw);
    perFileStats[relFile] = { chunks: chunks.length, size_bytes: Buffer.byteLength(raw, 'utf-8') };

    console.log(`[Indexer] Processing ${relFile} (${chunks.length} chunks)`);

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      const vector = await embed(content);
      newStore.push({
        file: relFile,
        index: i,
        content,
        embedding: vector,
      });
    }
  }

  vectorStore = newStore;
  indexMeta = {
    documentsIndexed: files.length,
    chunksIndexed: newStore.length,
    lastIndexedAt: new Date().toISOString(),
    perFileStats,
  };

  const durationMs = Date.now() - startedAt;
  console.log(`[Indexer] Done. ${indexMeta.documentsIndexed} docs, ${indexMeta.chunksIndexed} chunks in ${durationMs}ms`);

  return { ...indexMeta, duration_ms: durationMs };
}

/**
 * Ringkasan index untuk endpoint /api/health.
 * Tidak include perFileStats supaya payload kecil.
 *
 * @returns {{ documentsIndexed: number, chunksIndexed: number, lastIndexedAt: string|null }}
 */
export function getIndexMeta() {
  return {
    documentsIndexed: indexMeta.documentsIndexed,
    chunksIndexed: indexMeta.chunksIndexed,
    lastIndexedAt: indexMeta.lastIndexedAt,
  };
}

/**
 * Detail per-file untuk endpoint /api/sources. Berguna untuk debugging:
 * lihat dokumen apa yang ter-index + jumlah chunk-nya.
 *
 * @returns {{ documents: Array<{file: string, chunks: number, size_bytes: number}>, total_chunks: number }}
 */
export function getSourcesSummary() {
  const documents = Object.entries(indexMeta.perFileStats).map(([file, stats]) => ({
    file,
    chunks: stats.chunks,
    size_bytes: stats.size_bytes,
  }));
  return {
    documents,
    total_chunks: indexMeta.chunksIndexed,
  };
}
