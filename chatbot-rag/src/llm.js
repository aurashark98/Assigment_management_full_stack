/**
 * LLM — abstraksi multi-provider untuk Claude (Anthropic API) dan Ollama (lokal).
 *
 * Tanggung jawab modul ini:
 *  - Load 3 prompt dari folder PROMPTS_DIR (system / rewrite / trivial) saat startup
 *  - Bangun payload {system, messages} provider-agnostic via buildPrompt()
 *  - Route generate() / generateStream() ke backend yang dipilih lewat LLM_PROVIDER
 *  - Pecah pertanyaan multi-intent jadi sub-kueri (rewriteQuery)
 *  - Map error provider-spesifik jadi response HTTP yang konsisten
 *
 * Switch provider: ubah LLM_PROVIDER di .env, restart server. Kode kontraknya sama.
 *
 * Konsumer: src/server.js
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const LLM_PROVIDER = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
const ANTHROPIC_MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '2048', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const PROMPTS_DIR = path.resolve(PROJECT_ROOT, process.env.PROMPTS_DIR || './prompts');
const MAX_HISTORY_TURNS = 10;
const TEMPERATURE = 0.2;

/**
 * Load prompt markdown dari PROMPTS_DIR. Throw error helpful kalau file tidak ada
 * supaya developer langsung tahu apa yang harus diperbaiki saat startup.
 *
 * @param {string} filename Nama file di PROMPTS_DIR (mis. "system.md")
 * @returns {string} Isi file, sudah di-trim
 * @throws {Error} Kalau file tidak ada atau kosong
 */
function loadPromptFile(filename) {
  const filePath = path.join(PROMPTS_DIR, filename);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `Prompt file tidak ditemukan: ${filePath}. ` +
        `Cek PROMPTS_DIR di .env atau buat file di lokasi default ./prompts/${filename}.`
      );
    }
    throw err;
  }
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error(`Prompt file kosong: ${filePath}`);
  }
  return trimmed;
}

/** System prompt utama — atur persona bot, anti-halusinasi, citation, dst. */
export const SYSTEM_PROMPT = loadPromptFile('system.md');

/** System prompt untuk query rewriter (memecah pertanyaan multi-intent). */
const REWRITE_SYSTEM_PROMPT = loadPromptFile('rewrite.md');

/** Instruksi yang ditambahkan saat user kirim sapaan/pesan singkat. */
const TRIVIAL_USER_TEMPLATE = loadPromptFile('trivial.md');

let anthropicClient = null;

/**
 * Lazy-init Anthropic SDK client. Singleton — sekali dibuat, dipakai ulang.
 * Throw error dengan code 'NO_API_KEY' kalau key belum diset, supaya
 * llmErrorPayload() bisa map jadi 503 dengan pesan jelas.
 *
 * @returns {Anthropic} Anthropic client instance
 * @throws {Error & {code: 'NO_API_KEY'}} Kalau ANTHROPIC_API_KEY belum diset
 */
function getAnthropicClient() {
  if (!anthropicClient) {
    if (!ANTHROPIC_API_KEY) {
      const err = new Error('ANTHROPIC_API_KEY tidak diset di .env. Set key, atau ganti LLM_PROVIDER=ollama.');
      err.code = 'NO_API_KEY';
      throw err;
    }
    anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

/**
 * Filter & truncate history percakapan supaya tidak meledak konteks LLM.
 * Hanya keep entry valid (role user/assistant + content string), batasi ke
 * `MAX_HISTORY_TURNS` giliran terbaru.
 *
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, content: string}>} History yang sudah di-clean
 */
function clampHistory(history) {
  if (!Array.isArray(history)) return [];
  const valid = history.filter(
    (h) => h && typeof h === 'object' && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string'
  );
  if (valid.length <= MAX_HISTORY_TURNS * 2) return valid;
  return valid.slice(-MAX_HISTORY_TURNS * 2);
}

/**
 * @typedef {Object} Prompt
 * @property {string} system     System prompt (akan diteruskan ke field `system` Claude / system message Ollama)
 * @property {Array<{role: string, content: string}>} messages  Array messages user/assistant
 */

/**
 * Bangun payload {system, messages} provider-agnostic.
 *
 * Dua mode:
 *  - **Trivial**: pesan greeting (mis. "halo"). Tidak include konteks dokumen,
 *    cuma instruksi balas ramah dari trivial.md.
 *  - **Normal**: include retrieved chunks sebagai konteks. Kalau chunks kosong,
 *    LLM diberi tahu "tidak ada dokumen yang relevan" supaya jawab jujur.
 *
 * @param {Array<{file: string, content: string}>} contextChunks Chunks hasil retrieval
 * @param {Array<{role: string, content: string}>} history       Riwayat percakapan
 * @param {string} userMessage                                   Pesan pengguna saat ini
 * @param {Object} [options]
 * @param {boolean} [options.trivial=false] Skip retrieval, treat sebagai sapaan
 * @returns {Prompt}
 */
export function buildPrompt(contextChunks, history, userMessage, options = {}) {
  const { trivial = false } = options;

  let userPayload;
  if (trivial) {
    userPayload = `Pesan pengguna: "${userMessage}"\n\n${TRIVIAL_USER_TEMPLATE}`;
  } else {
    const contextBlock = (contextChunks || [])
      .map((c, i) => `[Dokumen ${i + 1} — ${c.file}]\n${c.content}`)
      .join('\n\n');

    userPayload = contextBlock
      ? `Berikut dokumen yang relevan dengan pertanyaan:\n\n${contextBlock}\n\nPertanyaan: ${userMessage}`
      : `Tidak ada dokumen yang relevan ditemukan.\n\nPertanyaan: ${userMessage}`;
  }

  return {
    system: SYSTEM_PROMPT,
    messages: [...clampHistory(history), { role: 'user', content: userPayload }],
  };
}

/**
 * Cek koneksi LLM untuk endpoint /api/health.
 *  - Anthropic: cek presence of API key (tidak burn token dengan API call)
 *  - Ollama: ping `/api/tags` di OLLAMA_URL
 *
 * @returns {Promise<'connected' | 'disconnected' | 'no_api_key'>}
 */
export async function checkLLMStatus() {
  if (LLM_PROVIDER === 'anthropic') {
    return ANTHROPIC_API_KEY ? 'connected' : 'no_api_key';
  }
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    return res.ok ? 'connected' : 'disconnected';
  } catch {
    return 'disconnected';
  }
}

/**
 * Internal: POST request ke Ollama `/api/chat`. Convert error HTTP jadi
 * Error object dengan `code` yang bisa di-map oleh llmErrorPayload().
 *
 * @param {Prompt} prompt
 * @param {boolean} stream Apakah stream response (NDJSON line-by-line)
 * @returns {Promise<Response>} fetch Response untuk dibaca caller
 * @throws {Error & {code: 'MODEL_NOT_FOUND' | 'LLM_ERROR'}}
 */
async function postOllama(prompt, stream) {
  const messages = [
    { role: 'system', content: prompt.system },
    ...prompt.messages,
  ];
  const body = {
    model: OLLAMA_MODEL,
    messages,
    stream,
    options: { temperature: TEMPERATURE },
  };

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const err = new Error(`Ollama error ${res.status}: ${errText || res.statusText}`);
    err.status = res.status;
    err.code = res.status === 404 ? 'MODEL_NOT_FOUND' : 'LLM_ERROR';
    throw err;
  }

  return res;
}

/**
 * Internal: stream Ollama response, parse NDJSON line-by-line, yield chunk text
 * dalam shape `{content, done}` yang sama dengan Anthropic stream — supaya
 * caller (server.js) tidak perlu tahu provider mana yang aktif.
 *
 * @param {Prompt} prompt
 * @yields {{content: string, done: boolean}}
 */
async function* generateOllamaStream(prompt) {
  const res = await postOllama(prompt, true);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let parsed;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }
      const content = parsed?.message?.content ?? '';
      const finished = parsed?.done === true;
      if (content) yield { content, done: false };
      if (finished) {
        yield { content: '', done: true };
        return;
      }
    }
  }

  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim());
      const content = parsed?.message?.content ?? '';
      if (content) yield { content, done: false };
    } catch {
      // ignore trailing partial
    }
  }
  yield { content: '', done: true };
}

/**
 * Internal: non-streaming generate dari Ollama. Return string penuh.
 * @param {Prompt} prompt
 * @returns {Promise<string>}
 */
async function generateOllama(prompt) {
  const res = await postOllama(prompt, false);
  const data = await res.json();
  return data?.message?.content ?? '';
}

/**
 * Internal: stream Anthropic response via SDK helper. Filter cuma text deltas
 * (skip thinking blocks, dst), yield dalam shape sama dengan Ollama version.
 *
 * @param {Prompt} prompt
 * @yields {{content: string, done: boolean}}
 */
async function* generateAnthropicStream(prompt) {
  const client = getAnthropicClient();
  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: ANTHROPIC_MAX_TOKENS,
    system: prompt.system,
    messages: prompt.messages,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield { content: event.delta.text, done: false };
    }
  }
  yield { content: '', done: true };
}

/**
 * Internal: non-streaming generate via Anthropic SDK. Return text dari blok
 * pertama bertipe 'text' (Claude bisa return banyak block kalau pakai tool use,
 * tapi di project ini tidak — jadi text block pertama sudah cukup).
 *
 * @param {Prompt} prompt
 * @returns {Promise<string>}
 */
async function generateAnthropic(prompt) {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: ANTHROPIC_MAX_TOKENS,
    system: prompt.system,
    messages: prompt.messages,
  });
  const textBlock = message.content.find((b) => b.type === 'text');
  return textBlock?.text ?? '';
}

/**
 * Public: streaming generate, route ke backend sesuai LLM_PROVIDER.
 * Dipakai oleh server.js untuk SSE response ke browser.
 *
 * @param {Prompt} prompt
 * @yields {{content: string, done: boolean}}
 */
export async function* generateStream(prompt) {
  if (LLM_PROVIDER === 'anthropic') {
    yield* generateAnthropicStream(prompt);
  } else {
    yield* generateOllamaStream(prompt);
  }
}

/**
 * Public: non-streaming generate, route ke backend sesuai LLM_PROVIDER.
 * Dipakai oleh rewriteQuery() (perlu full response sebelum parse) dan endpoint
 * /api/chat dengan stream=false.
 *
 * @param {Prompt} prompt
 * @returns {Promise<string>}
 */
export async function generate(prompt) {
  if (LLM_PROVIDER === 'anthropic') {
    return generateAnthropic(prompt);
  }
  return generateOllama(prompt);
}

/** Jumlah giliran terakhir (user+assistant pairs) yang dipakai sebagai konteks rewriter. */
const REWRITE_HISTORY_TURNS = 2;

/**
 * Pecah pertanyaan user jadi 1-3 sub-pertanyaan independen untuk retrieval
 * multi-intent, sekaligus resolusi referensi (mis. "beliau", "itu") menggunakan
 * riwayat percakapan. Pakai LLM yang sama (Anthropic atau Ollama) dengan prompt
 * khusus dari rewrite.md, parse output line-based dengan prefix "QUERY: ".
 *
 * Kalau gagal parse / LLM error, fallback ke kueri asli — supaya satu sub-query
 * yang error tidak bikin seluruh request gagal.
 *
 * Contoh tanpa history:
 *   "Sakit dan butuh reset password" → ["Bagaimana prosedur cuti sakit?", "Bagaimana cara reset password?"]
 *
 * Contoh dengan history (CEO disebut sebelumnya):
 *   "Apa email beliau?" → ["Apa email Bapak Rangga Wirasena (CEO Cendana Digital)?"]
 *
 * @param {string} userMessage Pertanyaan asli user
 * @param {Array<{role: string, content: string}>} [history] Riwayat percakapan untuk resolusi referensi
 * @returns {Promise<string[]>} Array 1-3 sub-pertanyaan
 */
export async function rewriteQuery(userMessage, history = []) {
  const recentHistory = clampHistory(history).slice(-REWRITE_HISTORY_TURNS * 2);

  let userPayload;
  if (recentHistory.length > 0) {
    const historyBlock = recentHistory
      .map((h) => `[${h.role}]: ${h.content}`)
      .join('\n');
    userPayload = `Riwayat percakapan terakhir:\n${historyBlock}\n\nPertanyaan baru: ${userMessage}`;
  } else {
    userPayload = `Pecah pertanyaan berikut:\n${userMessage}`;
  }

  const prompt = {
    system: REWRITE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPayload }],
  };

  try {
    const response = await generate(prompt);
    const queries = response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^QUERY:\s*/i.test(line))
      .map((line) => line.replace(/^QUERY:\s*/i, '').trim())
      .filter((q) => q.length > 0)
      .slice(0, 3);

    return queries.length > 0 ? queries : [userMessage];
  } catch (err) {
    console.error('[Rewrite] Failed, fallback to original query:', err.message);
    return [userMessage];
  }
}

/**
 * Cek apakah error ini berasal dari LLM yang tidak bisa diakses (bukan API key
 * salah, bukan rate limit). Dipakai untuk membedakan "service down" dengan
 * "request invalid".
 *
 * @param {Error} err
 * @returns {boolean}
 */
export function isLLMUnavailable(err) {
  if (!err) return false;
  if (err.code === 'NO_API_KEY') return true;
  if (LLM_PROVIDER === 'anthropic') {
    return err instanceof Anthropic.APIConnectionError;
  }
  const msg = String(err.message || err);
  return (
    err.cause?.code === 'ECONNREFUSED' ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('fetch failed')
  );
}

/**
 * Map error LLM (Anthropic typed exception atau Ollama error) jadi response
 * HTTP yang konsisten: `{status, body: {error, message}}`.
 *
 * Untuk Anthropic: pakai `instanceof` check dengan SDK exception classes
 * (RateLimitError, AuthenticationError, dll) — bukan string match.
 *
 * @param {Error} err
 * @returns {{status: number, body: {error: string, message: string}}}
 */
export function llmErrorPayload(err) {
  if (LLM_PROVIDER === 'anthropic') {
    if (err.code === 'NO_API_KEY') {
      return {
        status: 503,
        body: { error: 'NO_API_KEY', message: err.message },
      };
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return {
        status: 503,
        body: { error: 'INVALID_API_KEY', message: 'ANTHROPIC_API_KEY ditolak. Periksa kembali kunci API.' },
      };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return {
        status: 429,
        body: { error: 'RATE_LIMITED', message: 'Anthropic API rate limit tercapai. Coba lagi sebentar.' },
      };
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return {
        status: 503,
        body: { error: 'LLM_UNAVAILABLE', message: 'Tidak dapat terhubung ke Anthropic API.' },
      };
    }
    if (err instanceof Anthropic.APIError) {
      return {
        status: 500,
        body: { error: 'LLM_ERROR', message: `Anthropic API error ${err.status}: ${err.message}` },
      };
    }
    return {
      status: 500,
      body: { error: 'LLM_ERROR', message: err.message || 'Unknown LLM error' },
    };
  }

  if (isLLMUnavailable(err)) {
    return {
      status: 503,
      body: {
        error: 'LLM_UNAVAILABLE',
        message: `Ollama service tidak dapat diakses di ${OLLAMA_URL}. Pastikan Ollama berjalan: 'ollama serve'`,
      },
    };
  }
  if (err.code === 'MODEL_NOT_FOUND') {
    return {
      status: 503,
      body: {
        error: 'MODEL_NOT_FOUND',
        message: `Model '${OLLAMA_MODEL}' tidak ditemukan. Jalankan: ollama pull ${OLLAMA_MODEL}`,
      },
    };
  }
  return {
    status: 500,
    body: { error: 'LLM_ERROR', message: err.message || 'Unknown LLM error' },
  };
}

/**
 * Konfigurasi LLM yang dieksposeke server.js (untuk endpoint /api/health & UI).
 * Read-only snapshot — bukan source of truth, hanya untuk display.
 */
export const llmConfig = {
  provider: LLM_PROVIDER,
  model: LLM_PROVIDER === 'anthropic' ? ANTHROPIC_MODEL : OLLAMA_MODEL,
  url: LLM_PROVIDER === 'anthropic' ? 'https://api.anthropic.com' : OLLAMA_URL,
};
