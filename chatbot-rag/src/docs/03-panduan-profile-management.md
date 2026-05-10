# Panduan Profile Management - Kelola Informasi Pribadi Anda

Profile adalah halaman di mana Anda bisa mengelola dan melihat informasi pribadi Anda di Assignment Management System. 

## Mengakses Profile

1. Login ke sistem
2. Cari icon profile/avatar di sudut kanan atas (biasanya menampilkan inisial nama Anda)
3. Klik → Pilih "Profile" atau "My Profile"
4. Atau bisa via menu: Profile atau Settings

## Field di Profile

### Informasi Pribadi (Wajib diisi saat registrasi)

**Full Name** (Nama Lengkap)
- Format: Nama depan + nama belakang
- Contoh: "Budi Santoso" atau "Rina Wijaya Putri"
- Ini adalah nama yang tampil di sistem dan ke maintenance team
- Pastikan spelling benar sesuai KTP/dokumen

**Email** (Email)
- Email yang digunakan untuk login
- Juga email yang akan menerima notifikasi work order
- Jangan ganti email sering-sering
- Jika perlu ganti, hubungi admin/IT

**Phone Number** (Nomor Telepon)
- Nomor yang bisa dihubungi (mobile/WhatsApp)
- Format: +62 atau 0 (Indonesia)
- Contoh: "+6281234567890" atau "0812-3456-7890"
- Maintenance team bisa gunakan untuk emergency contact

**Gender** (Jenis Kelamin)
- Pilih: Male / Female / Other / Prefer not to say
- Opsional untuk beberapa sistem
- Dipakai untuk personalisasi komunikasi

**Birth Date** (Tanggal Lahir)
- Format: DD/MM/YYYY atau MM/DD/YYYY (sesuai sistem)
- Contoh: "15/03/1990"
- Biasanya opsional

### Foto Profil (Profile Photo)

**Upload Foto**
- Klik "Upload Photo" atau area foto profil
- Pilih file dari komputer (format JPG, PNG)
- Ukuran file: biasanya max 5MB
- Dimensi: bisa auto-crop (potong 1:1 untuk avatar)
- **Tips**: Gunakan foto formal/profesional, tidak blur, pencahayaan baik

**Ganti Foto**
- Klik pada foto yang sudah ada
- Pilih "Change Photo" atau "Upload New"
- Pilih file baru
- Foto lama akan tergantikan

**Hapus Foto**
- Klik pada foto
- Pilih "Remove Photo" atau "Delete"
- Avatar akan kembali ke inisial nama

## Cara Edit Profile

### Edit di Web

1. **Buka halaman Profile**
   - Login → klik icon profile → "My Profile" atau "Profile Settings"

2. **Klik tombol "Edit" atau "Edit Profile"**
   - Tombol biasanya di atas atau di samping setiap field

3. **Edit field yang ingin diubah**
   - Full Name: edit teks
   - Phone: edit nomor
   - Birth Date: pilih tanggal dari calendar
   - Foto: upload file baru

4. **Klik tombol "Save" atau "Update"**
   - Tunggu loading sampai selesai
   - Akan ada notifikasi "Profile Updated Successfully" atau serupa

5. **Verifikasi perubahan**
   - Refresh halaman
   - Cek apakah data sudah berubah
   - Jika masih lama belum update, clear cache browser (Ctrl+Shift+Del)

### Edit di Mobile App

Proses serupa dengan web:
1. Buka app → tab Profile
2. Tap tombol Edit / Pencil icon
3. Edit field yang diperlukan
4. Tap Save
5. Tunggu sync (biasanya auto-save)

## Data Persistence - Apakah Perubahan Tersimpan?

### Perubahan Disimpan ke Database
Ketika Anda klik "Save", data akan:
1. **Dikirim ke server** via API request
2. **Tersimpan di database** (PostgreSQL)
3. **Di-sync ke semua devices** - jika login di device lain, akan lihat data terbaru
4. **Persistent** - data tetap ada meski Anda logout/login kembali

### Cek Apakah Data Tersimpan

**Cek 1: Lihat notifikasi sukses**
- Saat save, biasanya ada notification "Saved successfully" atau "Profile updated"

**Cek 2: Logout dan login kembali**
- Logout dari sistem
- Login ulang dengan credential Anda
- Buka profile, lihat apakah data masih ada = TERSIMPAN

**Cek 3: Cek dari device lain**
- Login dari device/browser lain (laptop, tablet, dll)
- Buka profile
- Jika data sama dengan device sebelumnya = TERSIMPAN di server

### Troubleshooting: Perubahan Tidak Tersimpan

Jika edit profile tapi perubahan tidak tersimpan:

**Masalah 1: Tombol Save tidak aktif**
- Pastikan ada field yang diubah (tidak semua field yang sama)
- Jika hanya copy-paste nilai yang sama, tombol save bisa tidak aktif
- Ubah 1 character → tombol save akan aktif

**Masalah 2: Perubahan hilang setelah refresh**
- Cek jika ada error notification saat save
- Ada error network? Coba lagi
- Ada validasi error? Edit field sesuai requirement
- Coba clear browser cache: Ctrl+Shift+Del → Clear

**Masalah 3: Perubahan ada di satu device, tapi tidak ada di device lain**
- Wait 1-2 menit, bisa ada delay sync
- Refresh halaman atau logout-login ulang
- Cek apakah API/server working: buka halaman lain, apakah bisa akses?
- Jika masih error, hubungi IT support

**Masalah 4: Foto upload berhasil, tapi foto tidak muncul**
- Cek ukuran file (max 5MB)
- Cek format file (JPG, PNG)
- Clear browser cache, refresh halaman
- Coba ganti foto dengan file lain untuk testing

## Permission & Privacy

### Siapa yang Bisa Lihat Profile Anda?
- **Anda sendiri**: Bisa lihat dan edit
- **Maintenance team**: Bisa lihat beberapa field (nama, email, phone, foto)
- **Admin/Manager**: Bisa lihat semua field
- **Other users**: Biasanya TIDAK bisa lihat

### Field yang Shared dengan Maintenance Team
Saat Anda buat work order, maintenance team bisa lihat:
- Full Name
- Email
- Phone Number
- Foto profil
- Lokasi terkait work order

### Privacy Settings
Jika ada privacy settings, Anda bisa kontrol:
- Visibility of phone number (public/private)
- Visibility of profile picture (public/private)
- Cek di "Settings" atau "Privacy" tab jika ada

## FAQ Profile

**Q: Bisa ganti full name?**
A: Ya, bisa edit langsung di profile. Pastikan nama sesuai dengan dokumen resmi jika diperlukan untuk official purposes.

**Q: Jika ganti phone number, apakah notifikasi work order pindah ke nomor baru?**
A: Notifikasi email akan tetap ke email yang terdaftar. SMS/WhatsApp (jika ada) akan ke nomor baru setelah di-save.

**Q: Apakah maintenance team bisa lihat tanggal lahir saya?**
A: Tidak. Tanggal lahir hanya untuk internal system (kalkulasi usia, report statistik). Maintenance team tidak perlu lihat ini.

**Q: Bisa nggak ganti email?**
A: Tidak disarankan. Jika perlu ganti, hubungi IT admin. Email adalah identifier untuk login, jadi perlu diubah di database juga.

**Q: Berapa lama foto perubahan muncul?**
A: Seharusnya instant. Jika tidak muncul, clear browser cache (Ctrl+Shift+Del) dan refresh halaman.

**Q: Foto saya private atau public?**
A: Default biasanya visible ke maintenance team (mereka perlu tahu siapa yang membuat work order). Jika ada privacy setting, baca aturan di halaman privacy.

---

**Last Updated**: May 7, 2026
