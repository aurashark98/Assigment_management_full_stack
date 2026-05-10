/**
 * Retriever — semantic search atas vector store yang dibuat indexer.
 *
 * Tugas utama:
 *  - Convert kueri user jadi embedding lalu cari chunk paling mirip via cosine similarity.
 *  - Gabung hasil dari banyak sub-kueri (untuk multi-intent / query rewriting) jadi satu list unik.
 *
 * Konsumer: src/server.js (endpoint /api/chat).
 */

import { vectorStore, embed } from './indexer.js';

const TOP_K_DEFAULT = parseInt(process.env.TOP_K || '3', 10);

/**
 * Hitung cosine similarity dua vektor numerik. Range: -1 sampai 1.
 * Lebih tinggi = lebih mirip secara semantik.
 *
 * @param {number[]} a Vektor pertama
 * @param {number[]} b Vektor kedua (panjangnya harus sama dengan `a`)
 * @returns {number} Skor similarity, atau 0 jika input tidak valid / vektor zero
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Buat snippet preview pendek dari konten chunk untuk ditampilkan di UI bagian "Sumber".
 * Whitespace berlebih di-collapse jadi 1 spasi supaya cuat di satu baris.
 *
 * @param {string} content Isi penuh chunk
 * @param {number} [maxLen=150] Panjang maksimum snippet (karakter)
 * @returns {string} Snippet, di-truncate dengan '...' jika perlu
 */
function makeSnippet(content, maxLen = 150) {
  if (!content) return '';
  const trimmed = content.replace(/\s+/g, ' ').trim();
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) + '...' : trimmed;
}

/**
 * @typedef {Object} RetrievalResult
 * @property {string} file       Nama file relatif (mis. "kebijakan-cuti.md")
 * @property {number} score      Cosine similarity, dibulatkan ke 4 desimal
 * @property {string} content    Isi penuh chunk
 * @property {string} snippet    Preview pendek untuk UI
 */

/**
 * Cari `k` chunk paling relevan terhadap kueri. Embed kueri, hitung similarity ke
 * semua chunk di vectorStore, sort descending, ambil top-k.
 *
 * Kalau vectorStore kosong (KB belum di-index) atau kueri invalid, return [].
 *
 * @param {string} query Kueri pengguna dalam bahasa natural
 * @param {number} [k=TOP_K_DEFAULT] Jumlah chunk yang dikembalikan
 * @returns {Promise<RetrievalResult[]>} Top-k chunk, sorted by score desc
 */
export async function retrieve(query, k = TOP_K_DEFAULT) {
  if (!query || typeof query !== 'string') return [];
  if (vectorStore.length === 0) return [];

  const queryVec = await embed(query);

  const scored = vectorStore.map((item) => ({
    file: item.file,
    content: item.content,
    score: cosineSimilarity(queryVec, item.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map((item) => ({
    file: item.file,
    score: Number(item.score.toFixed(4)),
    content: item.content,
    snippet: makeSnippet(item.content),
  }));
}

/**
 * Gabungkan hasil retrieval dari beberapa kueri jadi satu list unik.
 *
 * Dipakai saat query rewriting: 1 pertanyaan user dipecah jadi N sub-kueri,
 * masing-masing menghasilkan top-K. Kita merge: dedup by file+content, ambil score
 * tertinggi (kalau chunk sama muncul di beberapa sub-kueri), sort descending,
 * potong ke `k` chunk teratas.
 *
 * @param {RetrievalResult[][]} resultArrays Array dari array hasil retrieve()
 * @param {number} k Jumlah chunk maksimum yang dikembalikan
 * @returns {RetrievalResult[]} Chunk unik, sorted by score desc, max `k` item
 */
export function mergeRetrievalResults(resultArrays, k) {
  const seen = new Map();
  for (const arr of resultArrays || []) {
    for (const item of arr || []) {
      const key = `${item.file}::${item.content}`;
      const existing = seen.get(key);
      if (!existing || item.score > existing.score) {
        seen.set(key, item);
      }
    }
  }
  return Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
