# Setup Native Windows untuk Chatbot RAG

Folder ini berisi script dan panduan untuk menjalankan chatbot RAG **secara native di Windows tanpa Docker**.

## Mengapa Native Windows?

- Performa LLM 2-3x lebih cepat dibanding Docker (tidak ada overhead WSL2)
- Akses langsung ke GPU jika tersedia (NVIDIA/AMD)
- Akses penuh ke RAM host (Docker Desktop biasanya hanya alokasi sebagian)
- Tidak perlu Docker Desktop berjalan

## Penting: Jangan Konflik dengan Docker

Setup native Windows menggunakan **port 8000** (berbeda dari Docker yang pakai port 8080), tetapi **port Ollama 11434 dipakai bersama**. Kedua mode tidak boleh berjalan bersamaan.

**Sebelum menjalankan setup native, pastikan Docker container chatbot-rag dimatikan:**

Dari folder root project `chatbot-rag`:

```powershell
cd docker
docker compose down
```

Atau matikan Docker Desktop sepenuhnya.

## Struktur File

| File | Fungsi |
|---|---|
| `setup-anthropic.bat` | Setup untuk mode Anthropic API: cek Node.js, validasi `.env`, install npm dependencies |
| `setup-ollama.bat` | Setup untuk mode Ollama lokal: cek Node.js & Ollama, install npm dependencies, pull model |
| `start.bat` | Menjalankan server di mode production (port 8000) |
| `stop.bat` | Menghentikan server (kill proses Node.js di port 8000) |
| `README.md` | Dokumen ini |

Pemilihan provider dilakukan via `LLM_PROVIDER` di file `.env` di root project. Jalankan script setup yang sesuai dengan provider yang dipilih.

## Prasyarat (Prerequisites)

Prasyarat berbeda tergantung provider LLM yang dipilih.

### Prasyarat Umum (Wajib untuk Kedua Provider)

#### Node.js 20+

Download dari [nodejs.org](https://nodejs.org), pilih versi LTS.

Verifikasi:
```powershell
node --version
npm --version
```

#### File `.env`

Copy file `.env.sample` di root project menjadi `.env`, lalu sesuaikan nilai `LLM_PROVIDER`:
- `LLM_PROVIDER=anthropic` untuk pakai Claude API
- `LLM_PROVIDER=ollama` untuk pakai model lokal

### Prasyarat Tambahan untuk Anthropic API

Hanya perlu API key dari Anthropic.

1. Daftar dan buat API key di [console.anthropic.com](https://console.anthropic.com)
2. Edit `.env` di root project, set:
   ```ini
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxx
   ANTHROPIC_MODEL=claude-haiku-4-5
   ```

Tidak perlu install software tambahan apapun.

### Prasyarat Tambahan untuk Ollama Lokal

#### Ollama untuk Windows

Download installer dari [ollama.com/download/windows](https://ollama.com/download/windows) atau gunakan installer yang sudah ada di:

```
C:\Users\<user>\Downloads\OllamaSetup.exe
```

Klik dua kali file installer untuk install. Ollama akan:
- Install ke `C:\Users\<user>\AppData\Local\Programs\Ollama`
- Auto-start sebagai background service di port 11434
- Auto-start setiap kali Windows boot

Verifikasi setelah install:
```powershell
ollama --version
curl http://localhost:11434/api/tags
```

Edit `.env` di root project, set:
```ini
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

## Cara Menjalankan

### Sekali Saja: Setup

Jalankan script setup yang sesuai dengan provider yang dipilih di `.env`.

#### Setup untuk Anthropic API

Dari folder root project `chatbot-rag`:

```powershell
cd windows
.\setup-anthropic.bat
```

Script akan otomatis:
1. Verifikasi Node.js & npm ter-install
2. Validasi keberadaan file `.env` dan `ANTHROPIC_API_KEY`
3. Install npm dependencies (`npm install`)

Durasi total: 1-3 menit (hanya `npm install`, tidak ada download model).

#### Setup untuk Ollama Lokal

Dari folder root project `chatbot-rag`:

```powershell
cd windows
.\setup-ollama.bat
```

Script akan otomatis:
1. Verifikasi Node.js, npm, Ollama ter-install
2. Verifikasi service Ollama berjalan
3. Install npm dependencies (`npm install`)
4. Pull model `llama3.2:3b` (~2 GB, durasi tergantung internet)

Durasi total: 5-15 menit pada koneksi internet rata-rata.

#### Berganti Provider Setelah Setup

Setelah salah satu setup script dijalankan, untuk berganti provider cukup:
1. Edit `LLM_PROVIDER` di file `.env`
2. Jika belum pernah jalankan setup untuk provider tersebut, jalankan script setup yang sesuai
3. Restart server (`stop.bat` lalu `start.bat`)

Tidak perlu uninstall provider yang lama. Konfigurasi kedua provider dapat hidup berdampingan di `.env`.

### Setiap Kali Pakai: Start Server

```powershell
.\start.bat
```

Script akan:
1. Cek Ollama service merespons
2. Cek port 3000 tidak dipakai container Docker atau proses lain
3. Set `NODE_ENV=production`
4. Jalankan `npm start` (= `node src/server.js`)

Output yang diharapkan (port dari `.env`, default `PORT=8000`):
```
[Indexer] Reading markdown files from: ./src/docs
[Indexer] Done. 4 docs, 38 chunks in <durasi>ms
[Server] Listening on http://localhost:8000
```

Buka browser: `http://localhost:8000`

### Stop Server

Tekan `Ctrl+C` di terminal yang menjalankan `start.bat`.

Atau gunakan `stop.bat` untuk kill paksa proses Node.js di port 8000:

```powershell
.\stop.bat
```

## Verifikasi Berjalan dengan Benar

Setelah `start.bat` jalan, di terminal lain:

```powershell
curl http://localhost:8000/api/health
```

Output yang diharapkan (perhatikan `ollama_status: connected`):
```json
{
  "status": "ok",
  "model": "llama3.2:3b",
  "documents_indexed": 4,
  "chunks_indexed": 38,
  "ollama_status": "connected"
}
```

Test chat:
```powershell
curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"Kapan PT Cendana Digital didirikan?\",\"stream\":false}"
```

Output yang diharapkan: jawaban mengandung "**15 Maret 2018**" dan field `sources` dari `company.md`.

## Update Knowledge Base

Folder `src/docs/` berisi file markdown yang diindex sebagai knowledge base.

### Tambah/Edit/Hapus File

1. Edit file `.md` di folder `src/docs/` (relatif terhadap root project `chatbot-rag`) menggunakan editor apa saja
2. Trigger reindex tanpa restart server:
   ```powershell
   curl -X POST http://localhost:8000/api/reindex
   ```
3. Verifikasi:
   ```powershell
   curl http://localhost:8000/api/sources
   ```

### Update Source Code Aplikasi

Jika ada perubahan di `src/*.js` atau `public/index.html`:

1. Stop server (Ctrl+C atau `stop.bat`)
2. Jalankan ulang `start.bat`

Tidak perlu re-install dependencies kecuali ada perubahan di `package.json`.

## Konfigurasi

Edit file `.env` di root project:

```ini
PORT=8000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
DOCS_DIR=./src/docs
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K=3
```

### Ganti Model LLM

Pull model yang diinginkan:
```powershell
ollama pull qwen2.5:7b
```

Edit `.env`:
```ini
OLLAMA_MODEL=qwen2.5:7b
```

Pilihan model berdasarkan RAM:

| Model | Ukuran | RAM | Performa CPU |
|---|---|---|---|
| `qwen2.5:0.5b` | ~400 MB | 2 GB | ~5-10 token/s |
| `llama3.2:3b` | ~2 GB | 8 GB | ~5-15 token/s |
| `qwen2.5:7b` | ~4.5 GB | 16 GB | ~3-7 token/s |
| `llama3.1:8b` | ~5 GB | 16 GB | ~3-7 token/s |

Restart server setelah ubah `.env`.

## Pemecahan Masalah (Troubleshooting)

### Error: Port 8000 sudah dipakai

```
[ERROR] Port 8000 sudah dipakai oleh proses lain.
```

Penyebab umum:
- Server Node.js native sebelumnya masih jalan → jalankan `stop.bat` atau cari PID:
  ```powershell
  netstat -ano | findstr :8000
  ```
- Aplikasi lain pakai port 8000 → ganti `PORT` di `.env` ke port lain yang tersedia (misal 8001, 7000)

### Error: ECONNREFUSED 127.0.0.1:11434

Ollama service tidak berjalan. Solusi:

```powershell
# Cek status service Ollama
Get-Service | Where-Object { $_.Name -like "*Ollama*" }

# Atau start manual
ollama serve
```

Jika service hilang, install ulang Ollama via installer.

### Error: Model llama3.2:3b not found

Model belum di-pull. Solusi:
```powershell
ollama pull llama3.2:3b
```

Verifikasi:
```powershell
ollama list
```

### Server lambat saat first run

Wajar pada query pertama:
- Model embedding `all-MiniLM-L6-v2` (~25 MB) di-download otomatis ke `~/.cache/huggingface`
- Ollama load model `llama3.2:3b` ke memory (~30 detik untuk first load)

Query kedua dan seterusnya akan lebih cepat karena model sudah warm di memory.

### Performa Terasa Lambat (>30 detik per response)

Untuk model 3B di CPU tanpa GPU, durasi 10-30 detik per response adalah wajar. Solusi:

1. Pakai model lebih kecil: `qwen2.5:0.5b` (jauh lebih cepat)
2. Pastikan ada GPU NVIDIA dan driver CUDA ter-install
3. Kurangi `TOP_K` di `.env` dari 3 ke 2 (konteks lebih pendek = generation lebih cepat)
4. Kurangi `CHUNK_SIZE` di `.env` dari 500 ke 300

## Perbandingan dengan Docker

| Aspek | Native Windows | Docker |
|---|---|---|
| Performa LLM | Lebih cepat (akses langsung) | Lebih lambat (overhead WSL2) |
| Setup awal | Manual install Ollama + Node.js | Otomatis via compose |
| Resource | Akses penuh RAM host | Dibatasi Docker Desktop |
| Portability | Terikat Windows | Bisa deploy ke Linux server |
| Update Ollama | Manual download installer | `docker compose pull` |
| Keep folder | `windows/` (folder ini) | `docker/` |

Setup Docker tetap dipertahankan di folder `docker/` dan dapat dipakai kapan saja jika diperlukan (misal untuk testing deployment ke server). Hanya satu yang dijalankan pada satu waktu (port konflik).

## Catatan untuk Uninstall

Jika nanti tidak butuh setup native Windows:

1. **Hapus dependencies npm** (opsional, untuk hemat disk).

   Dari folder root project `chatbot-rag`:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   ```

2. **Uninstall Ollama** via Add or Remove Programs

3. **Hapus folder data Ollama** (model yang sudah di-pull, bisa puluhan GB):
   ```powershell
   Remove-Item -Recurse -Force "$env:USERPROFILE\.ollama"
   ```

4. **Hapus cache embedding model**:
   ```powershell
   Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\huggingface"
   ```

Folder `windows/` ini sendiri dapat dihapus jika tidak diperlukan lagi.
