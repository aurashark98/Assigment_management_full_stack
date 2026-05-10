# 📋 Struktur Lengkap Chatbot Assignment Management

## ✅ Status Migrasi & Setup

```
✓ Folder chatbot-rag sudah dipindahkan ke assignment management full stack
✓ File ASSIGNMENT_MANAGEMENT_SETUP.md dibuat (petunjuk lengkap)
✓ File COPILOT_ASSIGNMENT_PROMPT.md dibuat (untuk Copilot menulis dokumentasi)
✓ Struktur knowledge base sudah siap
```

---

## 📂 Struktur Akhir

```
C:\Users\Toshiba\Downloads\assigment management full stack\
│
├── backend/                          # Backend assignment management
├── frontend/                         # Frontend assignment management
├── Chabot/                           # Frontend UI chatbot (pakai ini)
├── docs/                             # Docs assignment management
│
├── chatbot-rag/                      # ← CHATBOT RAG (dipindahkan)
│   │
│   ├── src/
│   │   ├── server.js                # Express server (port 8000)
│   │   ├── indexer.js               # Embedding & indexing
│   │   ├── retriever.js             # Semantic search
│   │   ├── llm.js                   # LLM abstraction
│   │   └── docs/                    # Knowledge base
│   │       ├── tutorial-work-order.md          # ← TODO: Buat
│   │       ├── penanganan-darurat.md           # ← TODO: Buat
│   │       ├── troubleshooting.md              # ← TODO: Buat
│   │       ├── workflow-status.md              # ← TODO: Buat
│   │       ├── panduan-umum.md                 # ← TODO: Buat
│   │       ├── company.md                      # Existing (bisa rename)
│   │       ├── faq-karyawan.md                 # Existing (bisa rename)
│   │       └── kebijakan-cuti.md               # Existing (bisa rename)
│   │
│   ├── docs/
│   │   ├── architecture/             # Dokumentasi teknis
│   │   ├── concept/                  # Blueprint & konsep
│   │   └── use-cases/                # Skenario pengujian
│   │
│   ├── prompts/
│   │   ├── system.md                 # System prompt (perlu update untuk assignment)
│   │   ├── rewrite.md                # Query rewriter
│   │   └── trivial.md                # Greeting responses
│   │
│   ├── public/
│   │   └── index.html                # Default UI (diganti ke UI assignment)
│   │
│   ├── docker/                       # Docker deployment
│   ├── windows/                      # Windows setup scripts
│   │
│   ├── package.json                  # Node.js dependencies
│   ├── .env.sample                   # Environment template
│   ├── .env                          # Konfigurasi (gitignored)
│   │
│   ├── ASSIGNMENT_MANAGEMENT_SETUP.md   # ← Petunjuk lengkap
│   ├── COPILOT_ASSIGNMENT_PROMPT.md     # ← Prompt untuk Copilot
│   ├── COPILOT_DOCS_PROMPT.md          # Generic documentation prompt
│   └── README.md                        # Original README
│
└── .prompt.md                        # Existing prompt file
```

---

## 🎯 File-file Penting yang Harus Dibuat/Update

### Priority 1: Knowledge Base (Harus Ada)

| File | Deskripsi | Status |
|------|-----------|--------|
| `tutorial-work-order.md` | Panduan membuat & mengelola work order | ❌ TODO |
| `penanganan-darurat.md` | Prosedur darurat & kontak emergency | ❌ TODO |
| `troubleshooting.md` | Masalah umum + solusi | ❌ TODO |
| `workflow-status.md` | Penjelasan status work order | ❌ TODO |
| `panduan-umum.md` | Info umum & navigasi | ❌ TODO |

### Priority 2: System Prompts (Perlu Update)

| File | Update Perlu | Notes |
|------|-------------|-------|
| `prompts/system.md` | ✓ Ganti ke context Assignment Management | Persona chatbot, instruction, anti-halusinasi |
| `prompts/rewrite.md` | ✓ Optional: context-specific | Bagus jika sudah, tapi generic pun OK |
| `prompts/trivial.md` | ✓ Optional: context-specific | Greeting responses untuk Assignment |

---

## 🚀 Step-by-Step Selanjutnya

### 1. Persiapan (5 menit)

```bash
cd C:\Users\Toshiba\Downloads\assigment management full stack\chatbot-rag

npm install
cp .env.sample .env
# Edit .env dengan ANTHROPIC_API_KEY atau setup Ollama
```

### 2. Test Server (2 menit)

```bash
npm start
# Cek: http://localhost:8000/api/health
```

### 3. Buat Knowledge Base (1-2 jam)

Gunakan **COPILOT_ASSIGNMENT_PROMPT.md** untuk instruksi:
- Buat 5 file markdown di `src/docs/`
- Tiap file berdasarkan outline yang sudah ada di prompt
- Copilot akan handle penulisan, kamu cek hasilnya

### 4. Update System Prompt (15 menit)

Edit `prompts/system.md` dengan context Assignment Management:
```markdown
Kamu adalah chatbot assistant untuk sistem manajemen tugas (work order).
Fokusmu: membantu pengguna membuat, mengelola, dan melacak work order.
Jangan keluar dari topik assignment management.
Selalu berbasis pada knowledge base yang sudah disiapkan.
```

### 5. Reindex & Test (5 menit)

```bash
curl -X POST http://localhost:8000/api/reindex
# Tunggu indexing selesai

# Test dengan pertanyaan real
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bagaimana cara membuat work order baru?", "stream": false}'
```

### 6. Integrasikan ke Frontend (Bergantung frontend)

Update Frontend UI (di `Chabot/` atau `frontend/`) untuk call:
- POST `/api/chat` ke `http://localhost:8000`
- Tampilkan streaming response (SSE)

---

## 📞 File Reference untuk Copilot

Jika ingin Copilot membuat dokumentasi, gunakan prompt file ini:

### ✅ Gunakan File Ini:
1. **COPILOT_ASSIGNMENT_PROMPT.md** — Main prompt untuk Assignment Management knowledge base
2. **ASSIGNMENT_MANAGEMENT_SETUP.md** — Referensi setup dan struktur

### ⚠️ Jangan Gunakan Sekarang (Generic):
- COPILOT_DOCS_PROMPT.md — Terlalu umum, pakai yang assignment-specific

---

## 🔗 Links Penting

| Lokasi | File/Folder | Fungsi |
|--------|-----------|--------|
| Root | `ASSIGNMENT_MANAGEMENT_SETUP.md` | Petunjuk setup & jalankan |
| Root | `COPILOT_ASSIGNMENT_PROMPT.md` | Prompt untuk Copilot menulis knowledge base |
| src/docs/ | Tutorial, troubleshooting, etc | Knowledge base (TODO: buat) |
| prompts/ | system.md | System prompt (TODO: update) |
| .env | ANTHROPIC_API_KEY | Konfigurasi LLM (TODO: set) |

---

## ✨ Timeline Perkiraan

| Task | Durasi | Who | Status |
|------|--------|-----|--------|
| Setup Node.js & .env | 10 min | Manual | ⭕ Pending |
| Test npm start | 5 min | Manual | ⭕ Pending |
| Buat knowledge base (5 files) | 1-2 h | Copilot | ⭕ Pending |
| Update system prompt | 15 min | Manual | ⭕ Pending |
| Reindex & test API | 5 min | Manual | ⭕ Pending |
| Integrasikan ke frontend | 30-60 min | Frontend dev | ⭕ Pending |

**Total**: ~3 jam (mostly waiting untuk Copilot menulis dokumentasi)

---

## 🎓 Quick Tips

1. **Copilot menulis dokumentasi**: Gunakan prompt di `COPILOT_ASSIGNMENT_PROMPT.md`
2. **Server tidak jalan**: Cek `.env` punya `ANTHROPIC_API_KEY` yang valid
3. **Jawaban tidak relevan**: Update knowledge base di `src/docs/`, terus reindex
4. **Port 8000 bentrok**: Ubah `PORT` di `.env`
5. **Need help**: Baca `ASSIGNMENT_MANAGEMENT_SETUP.md` di troubleshooting section

---

## 🔐 Folder Structure Confirmed

```bash
assigment management full stack/
  └── chatbot-rag/
      ├── src/docs/                    ← Knowledge base folder
      ├── prompts/system.md            ← System prompt
      ├── ASSIGNMENT_MANAGEMENT_SETUP.md
      ├── COPILOT_ASSIGNMENT_PROMPT.md
      └── ... (other files)
```

**Setup siap! Lanjut ke step berikutnya.** 🚀

