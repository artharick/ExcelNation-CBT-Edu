# Memperbarui web app Railway ke ExcelNation CBT Edu — Versi Final

Aplikasi ini server Node tanpa dependensi, jadi memperbarui = mengganti file di repo yang tersambung ke Railway. Data siswa/ujian tersimpan di *Volume* (`/data`) dan **tidak ikut terhapus** saat redeploy.

## 1. Cadangkan dulu (1 menit)
Buka web app lama → login guru → Pengaturan → **Unduh cadangan**. Simpan file JSON-nya.

## 2. Ganti file di repo GitHub Railway
Salin isi folder ini (timpa file lama): `ExcelNation-CBT-Edu.html`, `server.js`, `sw.js`, `manifest.webmanifest`, `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `Dockerfile`, `package.json`.
Commit & push → Railway otomatis build ulang.

## 3. Cek Variables di Railway
- `DATA_DIR=/data` dan Volume ter-mount di `/data` (sudah ada di versi lama; jangan diubah).
- `TRUST_PROXY=1` (Railway berada di belakang proxy).
- `PORT` dibiarkan otomatis.

## 4. Setelah deploy
- Buka alamat web app, tekan refresh keras (Ctrl+Shift+R). Service worker baru aktif sendiri.
- Siswa/guru: tombol **📲 Pasang Aplikasi** (HP Android/laptop) atau Safari → Bagikan → *Tambahkan ke Layar Utama* (iPhone).
- Jika ada yang masih melihat tampilan lama: tutup tab lalu buka lagi.

## 5. Bila perlu kembali ke versi lama
Di Railway → Deployments → pilih deployment sebelumnya → Redeploy. Data tidak berubah.

## Catatan pembaruan 25 Nov 2026
- Salin juga `sw.js` dan `server.js` terbaru (notifikasi & sesi susulan butuh server baru).
- Kunci notifikasi (VAPID) dibuat otomatis dan disimpan di berkas data pada Volume — jangan hapus Volume.
- Notifikasi mensyaratkan https (Railway sudah https) dan siswa menekan "Aktifkan notifikasi" sekali.
- Ujian yang sudah dipublikasikan: klik **Publikasikan ulang** agar fitur Review jawaban memuat kunci.
