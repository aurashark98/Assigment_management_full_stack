# Prompts Directory

Folder ini berisi prompt yang dipakai LLM. Setiap file di-load oleh `src/llm.js` saat startup.

## File

| File | Dipakai untuk |
|---|---|
| `system.md` | System prompt utama saat user bertanya — atur persona bot, aturan menjawab, kebijakan tidak halusinasi |
| `rewrite.md` | System prompt untuk query rewriter (memecah pertanyaan multi-intent jadi sub-queries) |
| `trivial.md` | Instruksi yang ditambahkan saat user kirim sapaan / pesan singkat (mis. "halo", "terima kasih") — bot membalas ramah tanpa retrieval |

## Override untuk Topik Berbeda

Pakai env var `PROMPTS_DIR` di `.env` untuk pakai folder prompt lain:

```env
PROMPTS_DIR=./prompts-cmms
```

Saat duplikasi project untuk topik baru (mis. CMMS), copy folder `prompts/` jadi `prompts-cmms/` lalu sesuaikan ketiga file dengan domain barunya.

## Tips Edit Prompt

- Setelah edit file di sini, **restart server** supaya prompt baru ke-load (tidak hot-reload)
- Format markdown bebas — sistem cuma `trim()` whitespace di awal/akhir
- Untuk `rewrite.md`, **jangan ubah format output** `QUERY: ...` — parser di `llm.js` mengandalkan prefix ini
- `trivial.md` di-append setelah `Pesan pengguna: "..."` di kode, jadi tulis sebagai instruksi untuk LLM, bukan sapaan
- Ganti referensi domain spesifik (mis. "kebijakan cuti, FAQ karyawan") sesuai topik chatbot Anda
