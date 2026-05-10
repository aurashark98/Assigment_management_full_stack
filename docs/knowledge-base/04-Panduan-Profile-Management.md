# Panduan Profile Management

Penjelasan tentang cara mengelola profil user dan informasi personal dalam sistem.

## Mengakses Profil

### Dari Halaman Manapun
1. Cari tombol profile atau menu di kanan atas halaman
2. Klik **"Profile"** atau ikon profile
3. Anda akan diarahkan ke halaman Profile Settings

### Dari Navbar
- Klik menu **Profile** di navbar utama aplikasi

## Halaman Profile Settings

Halaman profile menampilkan informasi user Anda dalam beberapa section:

### Section 1: Header dan Status
Di bagian atas halaman Anda akan lihat:
- **Greeting** - Salam dengan nama Anda
- **Completion Percentage** - Persentase profile yang sudah lengkap (contoh: 75% Lengkap)
- **Home Button** - Tombol untuk kembali ke halaman utama
- **Profile Status** - Badge menunjukkan status profile (Lengkap/Belum)

### Section 2: Sidebar Profile Card
Di sebelah kiri (desktop) atau atas (mobile) ada card dengan:
- **Foto Profil** - Avatar user (gambar lingkaran)
- **Nama** - Nama lengkap Anda
- **Email** - Email yang terdaftar
- **Progress Bar** - Visual progress kelengkapan profile
- **Status Card** - Menunjukkan "Lengkap" atau "Belum"
- **Foto Status** - Menunjukkan "Ada" atau "Belum"

### Section 3: Main Form - Data Pribadi

#### Username (Tidak bisa diubah)
- Field ini read-only / tidak bisa diedit
- Username otomatis dari employee code sistem
- Digunakan untuk login dan identifikasi

#### Email (Bisa diedit)
- Alamat email Anda
- Bisa diubah jika berubah
- Minimal satu karakter @ dan domain
- Email akan diverifikasi (jika sistem memerlukan)

#### Nama Lengkap (Bisa diedit) ⭐ **PENTING**
- Nama lengkap Anda sesuai identitas
- Digunakan untuk laporan dan komunikasi resmi
- Bersambung dengan struktur tabel `full_name` di database
- Wajib untuk profile yang lengkap
- Disimpan otomatis ke database saat Anda klik "Simpan Profile"

#### Nomor Telepon (Bisa diedit)
- Nomor telpon yang bisa dihubungi
- Format: 08xxxxxxxxxx atau standar lokal
- Opsional tapi direkomendasikan untuk kontakt darurat

#### Gender (Bisa diedit)
- Pilih dari dropdown:
  - Laki-laki
  - Perempuan
  - Lainnya
- Opsional

#### Tanggal Lahir (Bisa diedit)
- Pilih tanggal lahir dari date picker
- Format: DD/MM/YYYY
- Opsional tapi helpful untuk records HR

### Section 4: Foto Profil

#### Upload Foto
Di bagian bawah form ada area khusus untuk foto profil:

1. **Preview Foto Saat Ini** - Menampilkan foto yang sudah di-upload
2. **Tombol Upload Foto** - Klik untuk memilih file dari komputer
3. **Ketentuan File**:
   - Format yang diterima: JPG, PNG, GIF
   - Ukuran maksimal: 5MB
   - Direkomendasikan resolusi: 200x200 px atau lebih (untuk kualitas)

#### Proses Upload
1. Klik tombol **"Upload Foto"**
2. Pilih file foto dari komputer Anda
3. Foto akan preview langsung di form
4. Klik **"Simpan Profile"** untuk menyimpan perubahan

#### Tips Foto Profil yang Baik
✅ **Gunakan foto:**
- Headshot / portrait (wajah terlihat jelas)
- Pencahayaan baik (tidak gelap atau backlit)
- Background netral (tidak berantakan)
- Pakaian profesional / formal
- Ekspresi wajah natural (senyum biasa)

❌ **Hindari:**
- Foto keadaan (sedang sibuk, foto candid)
- Background rumit atau mengganggu
- Foto 5-10 tahun lalu
- Filter atau efek ekstrim
- Potret bersama orang lain

## Menyimpan Perubahan

### Tombol "Simpan Profile"
Setelah mengubah informasi:
1. Klik tombol **"Simpan Profile"** (biasanya berwarna gradient biru)
2. Sistem akan mengirim perubahan ke server
3. Tunggu hingga muncul pesan sukses (biasanya 1-3 detik)

### Pesan Sukses
Jika berhasil, Anda akan lihat:
- Toast notification hijau dengan teks "Profile berhasil diperbarui"
- Form akan refresh dengan data terbaru

### Pesan Error
Jika ada error:
- Toast notification merah dengan pesan error
- Kemungkinan: koneksi internet, field tidak valid, atau server error
- Coba lagi atau hubungi support

## Fitur Auto-Save (Jika Ada)

Beberapa sistem memiliki auto-save:
- Badge "Auto-saved" akan muncul jika perubahan disimpan otomatis
- Anda tidak perlu khawatir data hilang
- Tetap klik "Simpan Profile" secara eksplisit untuk memastikan

## Profil Completion Percentage

Sistem menghitung kelengkapan profile berdasarkan field yang diisi:

| Field | Weight | Wajib? |
|-------|--------|--------|
| Username | - | Auto-filled |
| Email | 15% | Ya |
| Nama Lengkap | 20% | Ya ⭐ |
| Nomor Telepon | 15% | Tidak |
| Gender | 15% | Tidak |
| Tanggal Lahir | 15% | Tidak |
| Foto Profil | 20% | Tidak |

**Untuk mencapai 100%**, Anda perlu:
- Username ✓ (auto-filled)
- Email ✓ (wajib)
- Nama Lengkap ✓ (wajib)
- Nomor Telepon (optional)
- Gender (optional)
- Tanggal Lahir (optional)
- Foto Profil (optional)

Untuk minimal profile yang dianggap "Lengkap", ketiga field wajib sudah cukup (≈ 50%).

## Logout

Di halaman Profile ada tombol **"Logout"** (biasanya berwarna merah):
1. Klik tombol Logout
2. Session akan berakhir
3. Anda akan diarahkan ke halaman login
4. Untuk akses kembali, login dengan email dan password

⚠️ **Perhatian:** Logout akan mengakhiri semua session. Jika ada draft form, pastikan sudah disimpan sebelum logout.

## Troubleshooting Profile

### Perubahan tidak disimpan
**Penyebab:**
- Koneksi internet terputus
- Tidak klik tombol "Simpan Profile"
- Halaman refresh sebelum disimpan

**Solusi:**
- Cek koneksi internet
- Ubah field lagi dan klik "Simpan Profile"
- Tunggu sampai muncul pesan sukses

### Foto tidak bisa diupload
**Penyebab:**
- Ukuran > 5MB
- Format file salah (bukan JPG/PNG/GIF)
- Browser error

**Solusi:**
- Kompresi foto sebelum upload (gunakan online tools)
- Pastikan format JPG, PNG, atau GIF
- Refresh halaman dan coba lagi
- Gunakan browser berbeda

### Nama tidak muncul di laporan
**Penyebab:**
- Nama belum disimpan
- Database belum ter-sync
- Cache belum update

**Solusi:**
- Pastikan Nama Lengkap sudah diisi dan disimpan
- Logout dan login kembali
- Bersihkan cache browser
- Tunggu beberapa menit agar database sync

### Tidak bisa edit username
**Ini adalah normal!** Username tidak bisa diubah karena:
- Username adalah identitas unik dari sistem
- Digunakan untuk login dan tracking
- Admin hanya yang bisa ubah jika ada kesalahan

Jika username salah, hubungi IT Admin.

## Integrasi dengan Sistem Lain

### Informasi yang Digunakan di Mana
- **Nama Lengkap**: Ditampilkan di work order, report, dan komunikasi
- **Email**: Digunakan untuk notifikasi (jika fitur ada)
- **Foto**: Ditampilkan di profile dan board (team view)
- **Nomor Telepon**: Digunakan untuk kontakt darurat
- **Gender & DOB**: Data HR dan analytics

### Data yang Dikirim ke Database
Saat Anda klik "Simpan Profile", data berikut dikirim dan disimpan:
- Nama Lengkap → kolom `full_name`
- Email → kolom `email`
- Nomor Telepon → kolom `phone`
- Gender → kolom `gender`
- Tanggal Lahir → kolom `birth_date`
- Foto → kolom `profile_photo` (base64 encoded)

## Privacy dan Security

### Data Pribadi Aman?
Ya, sistem menggunakan:
- HTTPS encryption untuk transmisi data
- Hashed password storage
- Database access control

### Siapa yang Bisa Lihat Profil?
- Anda sendiri (full access)
- Admin/Manager (limited access untuk operational needs)
- Teknisi/Tim support (jika diperlukan untuk tracking)

### Jangan Share
Jangan bagikan informasi berikut:
- Password
- Email password
- Personal identification number
- Bank account atau financial data

---

**Profile yang lengkap dan accurate sangat penting untuk komunikasi efektif dan tracking yang baik dalam sistem.**
