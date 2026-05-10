# Panduan Lengkap Work Order System

Penjelasan komprehensif tentang sistem work order (laporan kerusakan) untuk mengelola semua tahap proses pemeliharaan fasilitas.

## Apa itu Work Order?

Work Order adalah laporan resmi tentang kerusakan atau masalah pada peralatan dan fasilitas yang memerlukan perbaikan atau pemeliharaan. Sistem ini memastikan setiap masalah tercatat, ditugaskan ke teknisi yang tepat, dan dipantau sampai selesai.

## Pihak-Pihak dalam Work Order System

Sistem melibatkan beberapa peran dengan tanggung jawab berbeda:

1. **Requester (Pelapor)** - Karyawan atau user yang melaporkan kerusakan
2. **WO Manager (Work Order Manager)** - Menerima laporan dan menentukan prioritas
3. **Technician (Teknisi)** - Melakukan perbaikan peralatan
4. **Site Manager (Manajer Lokasi)** - Mengelola keseluruhan operasi

## Alur Workflow Work Order

Setiap laporan kerusakan akan melewati beberapa status dalam sistem:

```
DRAFT → SUBMITTED → ASSIGNED → IN PROGRESS → PENDING REVIEW → APPROVED
```

**Penjelasan setiap status:**

### Status: DRAFT
- **Deskripsi**: Laporan baru yang belum dikirim ke WO Manager
- **Apa yang bisa dilakukan**: Edit, simpan kembali, atau hapus laporan
- **Durasi**: Tidak terbatas (sampai Anda siap mengirim)
- **Aksi berikutnya**: Tekan "Kirim Laporan" untuk mengubah ke SUBMITTED

### Status: SUBMITTED
- **Deskripsi**: Laporan telah dikirim dan menunggu persetujuan dari WO Manager
- **Apa yang bisa dilakukan**: Pantau status, lihat komentar dari WO Manager
- **Durasi**: Biasanya 1-2 hari kerja
- **Kemungkinan**: 
  - Disetujui → status berubah ke ASSIGNED
  - Ditolak → kembali ke DRAFT (bisa direvisi dan dikirim ulang)

### Status: ASSIGNED
- **Deskripsi**: Laporan sudah disetujui WO Manager dan ditugaskan ke teknisi
- **Apa yang bisa dilakukan**: Lihat siapa teknisinya, mulai berharap teknisi datang
- **Durasi**: Bergantung jadwal dan prioritas perbaikan (biasanya 1-7 hari)
- **Keterangan**: WO Manager sudah memastikan laporan valid dan prioritasnya tepat

### Status: IN PROGRESS
- **Deskripsi**: Teknisi sedang memperbaiki peralatan
- **Apa yang bisa dilakukan**: Pantau kemajuan (jika ada update), koordinasi dengan teknisi jika perlu
- **Durasi**: Bergantung kompleksitas perbaikan (beberapa jam hingga berhari-hari)
- **Keterangan**: Peralatan sedang dalam perbaikan, jangan gunakan sampai selesai

### Status: PENDING REVIEW
- **Deskripsi**: Teknisi sudah selesai perbaikan, menunggu verifikasi dari Site Manager
- **Apa yang bisa dilakukan**: Siap untuk verifikasi, bisa berkomunikasi dengan teknisi tentang hasil perbaikan
- **Durasi**: Biasanya 1-2 hari
- **Keterangan**: Hasil perbaikan harus dikonfirmasi apakah sudah memenuhi standar

### Status: APPROVED
- **Deskripsi**: Perbaikan selesai dan sudah disetujui, laporan ditutup
- **Apa yang bisa dilakukan**: Lihat detail perbaikan, feedback jika ada
- **Durasi**: Status final
- **Keterangan**: Peralatan sudah aman digunakan kembali

### Status: REJECTED atau REJECTED_BY_WOM
- **Deskripsi**: Laporan ditolak oleh WO Manager (tidak cukup informasi atau tidak prioritas)
- **Apa yang bisa dilakukan**: Kembali ke DRAFT, revisi laporan, dan kirim ulang
- **Tindakan**: Hubungi WO Manager jika ada pertanyaan tentang penolakan

## Cara Membuat Work Order Baru

### Langkah 1: Akses Halaman Input

1. Login ke aplikasi dengan akun Anda
2. Dari menu utama, pilih **Work Order** atau **Dashboard Pelapor**
3. Klik tombol **"Input Laporan Kerusakan"** atau **"Buat Laporan Baru"**

### Langkah 2: Isi Form Laporan

Pada halaman form, Anda akan melihat beberapa field yang harus diisi:

#### Field Wajib Diisi (ditandai dengan *)

**Judul Kerusakan** (wajib)
- Deskripsi singkat apa yang bermasalah
- Contoh yang baik: "AC Lantai 3 Tidak Mendingin", "Printer Rusak Tidak Bisa Cetak"
- Hindari: "Error", "Tidak bekerja", "Rusak" (terlalu umum)

**Kategori** (wajib)
- Jenis kerusakan, contoh:
  - Electrical (Listrik & Panel)
  - Mechanical (Mesin & Gear)
  - HVAC (Pendingin Udara & Ventilasi)
  - Plumbing (Pipa & Air)
  - Furniture & Fixtures (Perabotan)
  - IT & Electronics (Komputer & Elektronik)
  - Other (Lainnya)
- Pilih kategori yang paling sesuai dengan jenis kerusakan

**Deskripsi Detail** (wajib)
- Jelaskan apa yang terjadi, gejala yang terlihat, kapan dimulai
- Contoh bagus: "AC unit di ruangan tidak mengeluarkan udara dingin sejak pagi, hanya angin biasa, bising aneh dari kompresor"
- Semakin detail semakin baik untuk diagnosis teknisi

**Tingkat Urgensi** (wajib)
- **Low** - Bisa ditunggu 3-7 hari, tidak urgent
- **Normal/Medium** - Perlu ditangani dalam 1-2 hari
- **High** - Segera, harus ditangani hari ini atau esok hari

#### Field Opsional (Tambahan)

**Lokasi Lantai**
- Nomor lantai tempat peralatan rusak berada
- Contoh: "3", "2", "Ground Floor"

**Nama Ruangan**
- Nama atau identitas ruangan
- Contoh: "R. Meeting Utama", "Departemen IT", "Gudang B"

**Detail Posisi**
- Posisi detail peralatan dalam ruangan
- Contoh: "Di sudut timur dekat jendela", "Samping mesin fotokopi", "Rak bagian atas"

**Foto Masalah**
- Upload foto kerusakan (JPG, PNG, GIF, max 5MB)
- Foto yang jelas membantu diagnosis cepat
- Ambil dari berbagai sudut jika perlu

#### Field Tersembunyi

**Asset/Peralatan** (dipilih sistem)
- Sistem secara otomatis mengaitkan laporan dengan asset yang sesuai
- Informasi ini penting untuk tracking history peralatan

### Langkah 3: Review dan Simpan

1. **Review semua field** - Pastikan semua informasi benar
2. **Pilih aksi:**
   - **Simpan Draft** - Jika belum yakin atau ingin melengkapi nanti
   - **Kirim Laporan** - Langsung submit ke WO Manager

### Langkah 4: Konfirmasi Pengiriman

Setelah mengklik **Kirim Laporan**:
- Sistem akan meminta konfirmasi (perhatian: setelah dikirim tidak bisa diedit)
- Setelah klik OK, laporan terkirim dengan status SUBMITTED
- **Catat nomor Work Order** yang diberikan (contoh: WR #2024001)

## Cara Mengedit Laporan (Draft)

Jika laporan masih berstatus **DRAFT**, Anda bisa mengedit:

1. Dari **Dashboard Pelapor**, cari laporan dengan status "Draft"
2. Klik tombol **Edit** pada laporan tersebut
3. Modal form akan terbuka dengan data laporan
4. Ubah informasi yang diperlukan
5. Klik **Simpan Draft** untuk menyimpan perubahan
6. Atau klik **Kirim Laporan** untuk mengirimnya

⚠️ **Perhatian**: Setelah laporan dikirim (status SUBMITTED atau lebih), Anda tidak bisa mengedit lagi. Hubungi WO Manager jika perlu perubahan signifikan.

## Cara Menghapus Laporan (Draft)

Laporan yang masih berstatus **DRAFT** bisa dihapus:

1. Dari **Dashboard Pelapor**, cari laporan dengan status "Draft"
2. Klik tombol **Hapus** pada laporan tersebut
3. Sistem akan meminta konfirmasi
4. Klik OK untuk menghapus

⚠️ **Perhatian**: Laporan yang sudah dikirim tidak bisa dihapus. Jika ingin membatalkan, hubungi WO Manager.

## Cara Melacak Status Laporan

### Di Dashboard Pelapor

1. Login dan buka **Dashboard Pelapor**
2. Daftar semua laporan Anda ditampilkan, sorted dari yang terbaru
3. Setiap laporan menunjukkan:
   - **Nomor WR** - Identitas unik laporan
   - **Judul** - Ringkas masalah
   - **Status** - Status terkini (Draft, Submitted, Assigned, dll)
   - **Approval Status** - Keterangan apakah sudah disetujui WO Manager
   - **Teknisi** - Nama teknisi yang ditugaskan (jika ada)
   - **Waktu Update** - Kapan laporan terakhir di-update

### Cara Membaca Status Badge

- **Badge Abu-abu** = Draft (belum dikirim)
- **Badge Biru** = Submitted (menunggu approval)
- **Badge Ungu** = Assigned (ditugaskan ke teknisi)
- **Badge Oranye** = In Progress (sedang dikerjakan)
- **Badge Cyan** = Pending Review (menunggu verifikasi)
- **Badge Hijau** = Approved (selesai dan disetujui)
- **Badge Merah** = Rejected (ditolak)

## Cara Melihat Detail Laporan Lengkap

1. Dari **Dashboard Pelapor**, klik pada laporan yang ingin dilihat
2. Atau jika sudah di halaman dashboard, klik tombol **"Detail"** atau **"Lihat"**
3. Halaman detail menampilkan:
   - Semua informasi laporan (judul, deskripsi, kategori, lokasi)
   - Foto yang diupload
   - Teknisi yang ditugaskan
   - History status perubahan
   - Waktu setiap transisi status

## Tips untuk Laporan yang Efektif

✅ **Lakukan:**
- Berikan detail sebanyak mungkin tentang kerusakan
- Upload foto berkualitas yang menunjukkan masalah
- Gunakan kategori yang paling sesuai
- Tentukan urgensi dengan objektif
- Follow up jika laporan dalam status SUBMITTED terlalu lama

❌ **Jangan:**
- Membuat laporan dengan judul terlalu umum
- Mengabaikan field yang tersedia
- Meremehkan tingkat urgensi hanya agar prioritas tinggi
- Membuat banyak laporan untuk masalah yang sama
- Menunggu terlalu lama untuk melaporkan kerusakan

## Troubleshooting Umum

### Laporan tidak bisa dikirim
**Kemungkinan penyebab:**
- Ada field wajib yang belum diisi (Judul, Kategori, Deskripsi, Tingkat Urgensi, Asset)
- Ukuran foto terlalu besar (harus < 5MB)
- Koneksi internet terputus

**Solusi:**
- Pastikan semua field wajib terisi
- Kompresi foto sebelum upload
- Refresh halaman dan coba lagi

### Laporan sudah dikirim tapi status masih DRAFT
**Penyebab:**
- Sistem belum update, atau
- Halaman perlu di-refresh

**Solusi:**
- Refresh halaman (F5 atau Ctrl+R)
- Logout dan login kembali
- Tunggu beberapa detik kemudian buka ulang

### Tidak bisa mengedit laporan
**Penyebab:**
- Laporan sudah dikirim (status sudah berubah dari DRAFT)

**Solusi:**
- Laporan yang sudah SUBMITTED tidak bisa diedit user
- Hubungi WO Manager jika perlu revisi

---

**Pertanyaan lebih lanjut?** Hubungi WO Manager atau Tech Support.
