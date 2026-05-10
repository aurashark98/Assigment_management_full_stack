# Panduan Work Order - Cara Membuat & Melacak Maintenance Request

Work Order adalah laporan formal yang Anda submit ketika ada equipment/asset yang perlu perbaikan atau maintenance. Panduan ini menjelaskan workflow lengkap.

## Apa Itu Work Order?

Work Order adalah dokumen digital yang mencatat:
- Apa equipment yang bermasalah
- Deskripsi masalah
- Lokasi equipment
- Prioritas/urgency perbaikan
- Foto bukti kerusakan
- Status progress perbaikan

Setelah dibuat, work order di-assign ke maintenance team dan bisa dilacak progress-nya sampai selesai.

## Status Work Order - Penjelasan Lengkap

Setiap work order melalui beberapa status. Pahami arti setiap status:

| Status | Arti | Siapa yang Bisa Action | Apa Artinya untuk Anda |
|--------|------|----------------------|----------------------|
| **Draft** | Sedang disiapkan | Anda (requester) | Work order belum dikirim, masih bisa edit/hapus |
| **Submitted** | Sudah dikirim, menunggu review | Management/Supervisor | Sudah dikirim, sedang ditinjau apakah perlu/urgent |
| **Assigned** | Sudah di-assign ke technician | Maintenance team | Technician sudah dikasih tugas, akan ke lokasi |
| **In Progress** | Sedang dikerjakan | Maintenance team | Technician sedang perbaiki/check equipment |
| **Pending Review** | Selesai, menunggu verifikasi | Anda + Supervisor | Perbaikan selesai, tunggu Anda verifikasi atau supervisor approve |
| **Approved** | Final approve, selesai | Management | Work order selesai, dilanjut paperwork/dokumentasi |
| **Rejected** | Ditolak | Management | Tidak bisa dikerjakan atau ada issue, mungkin perlu buat ulang |

### Visual Flow Status

```
Draft 
  ↓ (Submit)
Submitted 
  ↓ (Review OK)
Assigned 
  ↓ (Start work)
In Progress 
  ↓ (Finish work)
Pending Review 
  ↓ (Verify OK)
Approved (SELESAI)

Atau:
... → Rejected (buat ulang)
```

## Cara Membuat Work Order

### Step 1: Siapkan Informasi
Sebelum mulai, pastikan Anda punya:
- Nama/deskripsi equipment yang rusak
- Lokasi pasti (lantai, ruangan, detail)
- Deskripsi masalah yang detail
- Foto equipment (opsional tapi sangat membantu)
- Urgency level (low/medium/high)

### Step 2: Masuk ke Dashboard
1. Login ke Assignment Management System
2. Masuk ke dashboard
3. Cari tombol "New Work Order", "Create Work Order", atau icon "+"

### Step 3: Isi Form Work Order

#### Field yang Wajib Diisi:

**Title** (Judul singkat)
- Isi dengan singkat deskripsi masalah
- Contoh baik: "Printer Canon MX520 - Paper Jam Error"
- Contoh kurang: "Printer rusak"

**Description** (Deskripsi detail)
- Jelaskan masalah dengan **DETAIL DAN SPESIFIK**
- Sertakan:
  - Apa yang terjadi
  - Kapan mulai terjadi
  - Gejala apa yang muncul
  - Apa yang sudah dicoba diperbaiki
- Format yang baik:
  ```
  Equipment: Printer Canon MX520
  Lokasi: Lantai 2, Ruang R204 (IT Dept)
  Waktu rusak: [Hari], [jam] WIB
  Masalah: Tidak bisa print, keluar error "Paper Jam 02"
  Yang sudah dicoba: Buka compartment, tidak ada kertas tersangkut
  Urgensi: High (orang2 butuh print urgent documents hari ini)
  ```

**Category** (Kategori perbaikan)
- Pilih yang paling sesuai:
  - **Electrical**: Masalah listrik, power, charging
  - **Mechanical**: Masalah mekanis, rusak fisik, patah, terlepas
  - **General**: General maintenance, cleaning, adjustment
  - **Software**: Masalah software, error, freeze, tidak bisa boot
  - **Network**: Masalah internet/jaringan, tidak connect
  - Pilih kategori yang paling relevan untuk mempercepat diagnosa

**Urgency** (Tingkat urgensi)
- **High**: Perlu diperbaiki HARI INI atau besok (mengganggu produktivitas kritis)
- **Medium**: Perlu dalam 3-5 hari (mengganggu tapi bisa temporary workaround)
- **Low**: Bisa menunggu 1-2 minggu (preventive maintenance atau non-critical)
- **JANGAN** selalu set High, itu bikin prioritas jadi tidak jelas

**Facility** (Fasilitas/Lokasi)
- Pilih facility/lokasi di mana equipment berada
- Contoh: "Main Office", "Warehouse A", "Plant B", dll

**Location Floor** (Lantai)
- Masukkan nomor lantai atau tulisan (1, 2, "Ground Floor", "Basement", dll)

**Location Room** (Ruangan)
- Masukkan ruangan atau area spesifik
- Contoh: "R204", "Server Room", "Pantry", "Main lobby"

**Location Detail** (Detail lokasi)
- Deskripsi tambahan untuk mudah ditemukan
- Contoh: "Meja putih di dekat jendela", "Bagian sudut ruangan", "Di atas meja printing"

**Photo Before** (Foto kerusakan)
- SANGAT DISARANKAN upload foto
- Ambil foto yang menunjukkan masalahnya
- Foto harus jelas, cukup terang, tidak blur
- Bisa upload 1 foto di awal, bisa tambah lebih banyak during progress

#### Field Opsional:
- Asset ID: Jika Anda tahu ID/serial number equipment
- Additional Notes: Catatan tambahan jika ada

### Step 4: Review dan Submit
1. **Review semua field** - pastikan informasi sudah lengkap dan benar
2. Jika ada yang kurang, edit
3. Klik tombol **"Submit"** atau **"Create Work Order"**
4. Sistem akan menampilkan nomor Work Order ID
5. **SIMPAN nomor ini!** Anda butuh untuk follow-up

### Step 5: Work Order Sudah Dibuat
Setelah submit, status berubah ke "Submitted" dan:
- ✓ Notification dikirim ke management/supervisor
- ✓ Maintenance team akan lihat dalam queue mereka
- ✓ Biasanya dalam 2-24 jam status berubah ke "Assigned"
- ✓ Anda bisa lihat progress di dashboard

## Cara Edit/Hapus Work Order

### Edit Work Order
Anda **HANYA BISA EDIT** jika status masih **"Draft"** (belum submitted)
- Klik work order yang ingin diedit
- Klik tombol "Edit"
- Ubah field yang perlu
- Klik "Save" atau "Update"

**TIDAK BISA EDIT** jika sudah "Submitted" atau status lebih lanjut.
Jika ada perubahan penting saat sudah submitted, comment di work order atau hubungi manager.

### Hapus Work Order
Anda **HANYA BISA HAPUS** jika status **"Draft"**
- Klik work order
- Klik tombol "Delete"
- Konfirmasi penghapusan
- Work order akan dihapus sepenuhnya (tidak bisa undo)

## Cara Melacak Status Work Order

### Via Dashboard
1. Login dan masuk dashboard
2. Lihat list "My Work Orders" atau "Work Requests"
3. Setiap work order menampilkan:
   - Status saat ini (color-coded: draft=gray, submitted=blue, in_progress=yellow, approved=green, rejected=red)
   - Equipment name
   - Created date
   - Last updated date
4. Klik work order untuk lihat detail lengkap

### Detail View
Saat membuka detail work order, Anda bisa lihat:
- **Status timeline**: Kapan status berubah
- **Comments**: Komunikasi antara Anda dan maintenance team
- **Attached files**: Foto sebelum, foto sesudah, dokumen teknis
- **Estimated completion**: Perkiraan selesai
- **Assigned to**: Nama technician yang handle perbaikan

### Email Notification
Anda akan dapat email notifikasi saat:
- Work order di-assign ke technician
- Status berubah menjadi "In Progress"
- Technician add comment atau minta info tambahan
- Status berubah ke "Pending Review" (selesai, tunggu verifikasi Anda)
- Work order di-approve/reject

## Troubleshooting Work Order

### "Work Order saya tidak muncul di dashboard"
**Solusi**:
- Refresh halaman (F5 atau Ctrl+R)
- Cek apakah filter sudah benar (filter berdasarkan date, status, etc)
- Cek apakah ada error message
- Logout dan login ulang
- Hubungi IT support jika masih tidak muncul

### "Tidak bisa edit work order, tombol edit tidak aktif"
**Solusi**:
- Cek status - hanya draft yang bisa edit
- Jika status sudah submitted, tidak bisa edit lagi
- Hubungi manager jika urgent perlu di-edit

### "Tidak bisa submit, ada field yang merah"
**Solusi**:
- Field yang merah adalah **required/wajib**
- Isi semua field yang merah
- Biasanya: Title, Description, Category, Urgency, Location
- Setelah semua field lengkap, baru bisa submit

### "Status sudah "In Progress" tapi tidak ada update 3 hari"
**Solusi**:
- Comment di work order: "Any update on progress? Sudah 3 hari tapi belum ada perubahan"
- Atau hubungi manager/IT supervisor langsung
- Bisa ada issue (technician tidak ada, parts belum datang, dll)

### "Work order rejected, apa artinya?"
**Solusi**:
- Baca comment dari management tentang alasan reject
- Perbaiki issue yang disebutkan
- Buat work order baru dengan informasi yang sudah diperbaiki
- Atau hubungi manager untuk diskusi

## Best Practices

✓ **DO**: Buat work order dengan deskripsi detail dan foto

✗ **DON'T**: Submit work order tanpa deskripsi (hanya "rusak")

✓ **DO**: Set urgency yang realistis

✗ **DON'T**: Selalu set HIGH urgency untuk semuanya

✓ **DO**: Monitor status dan respond quickly jika ada pertanyaan

✗ **DON'T**: Set dan lupa, tidak follow-up

✓ **DO**: Provide more info jika technician minta

✗ **DON'T**: Ignore comments dari technician

✓ **DO**: Verify equipment benar-benar fixed sebelum approve

✗ **DON'T**: Approve sebelum test equipment

---

**Last Updated**: May 7, 2026
