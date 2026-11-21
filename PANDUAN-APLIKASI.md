# ExcelNation CBT Edu — Panduan Singkat

## Cara menjalankan
**Ujian sebenarnya (disarankan, real-time antar perangkat):**
1. Taruh `server.js` dan `ExcelNation-CBT-Edu.html` di satu folder di laptop guru (butuh Node.js).
2. Jalankan `node server.js` — alamat untuk siswa tampil di layar (mis. `http://192.168.1.10:8080/`).
3. Guru dan siswa membuka alamat itu (siswa lewat Safe Exam Browser).

**Uji coba cepat:** buka `ExcelNation-CBT-Edu.html` langsung di browser (mode lokal, data hanya di perangkat itu).

## Alur guru (kode akses guru tidak ditampilkan di aplikasi)
1. **Unggah Soal** → pilih mapel, jadwal mulai/selesai, durasi, kode ujian → unggah DOCX/PDF/TXT/HTML (tanpa batas jumlah soal).
2. **Proses Soal** → periksa hasil pindai, edit ala Word (tebal/miring/pangkat, sisipkan atau tempel gambar), ubah tipe soal, atur kunci → **Simpan & Terbitkan**. Soal langsung muncul di E-Exam siswa.
3. **Pemantauan Live** → progres, pelanggaran, buka blokir, +5 menit, kumpulkan, reset.
4. **Hasil & Publikasi** → Hitung IRT 2PL + Partial Points (200–800) → Publikasikan → unduh CSV / gambar (untuk WhatsApp).
5. **Pengaturan** → unduh konfigurasi `.seb`, kelola siswa, cadangan data.

## Catatan jujur
- Volume perangkat tidak bisa diatur paksa oleh browser/aplikasi web; siswa diminta tes alarm & memastikan volume maksimum, dan alarm diputar dengan gain maksimum.
- Berkas `.seb` dibuat otomatis tetapi belum saya uji di SEB sungguhan; bila ditolak, buat lewat SEB Config Tool dengan Start URL yang sama.
- PDF hasil scan/foto (tanpa teks) tidak bisa dibaca otomatis (tidak ada OCR); halaman dimasukkan sebagai gambar untuk dibuat soal di editor. Gambar EMF/WMF dari Word perlu disisipkan ulang sebagai PNG/JPG.
- Grafik/diagram vektor di PDF tidak ikut terambil; gunakan DOCX atau tempel tangkapan layar di editor.

## Tampilan HP & ketahanan data
- Di HP, aplikasi memakai tata letak khusus layar sempit. Saat ujian dimulai, aplikasi meminta mode layar penuh otomatis (Chrome Android mendukungnya). Tombol **☰ Navigasi** di bawah layar membuka daftar nomor soal; layar tidak lompat ke atas setelah memilih jawaban.
- File HTML dan `server.js` tidak punya masa kedaluwarsa — selama file-nya disimpan, bisa dipakai berbulan-bulan.
- Yang bisa hilang adalah **data** (soal, jawaban, hasil): di mode lokal tersimpan di browser perangkat itu (hilang bila "hapus data situs"); di mode server tersimpan di `excelnation-data.json` di folder server (di hosting gratis bisa terhapus saat restart). Unduh **cadangan** di Pengaturan secara berkala; dashboard guru mengingatkan bila sudah 7 hari.
- Simpan `manifest.webmanifest` dan `icon-192.png` / `icon-512.png` satu folder dengan `server.js` (untuk ikon & layar penuh saat dipasang ke layar utama; pemasangan ke layar utama paling andal lewat alamat https).

## Bank Soal Kelas XII (menu guru → Bank Soal)
- Simpan soal per **mapel · semester · materi · tingkat kesulitan**. Daftar materi kelas XII sudah terisi sebagai usulan awal (tombol ⚙ *Atur daftar materi* untuk menyesuaikan dengan ATP/silabus sekolah).
- Cara mengisi bank: (1) unggah file DOCX/PDF/TXT langsung di halaman Bank Soal setelah memilih label; (2) tombol **📚 Simpan ke Bank** di Kelola Ujian (dari ujian yang sudah terbit) atau di Unggah/Proses Soal (dari draf). Soal duplikat dilewati otomatis.
- Cara memakai: centang butir lalu **Buat ujian dari pilihan**, atau **🎲 Rakit acak** (jumlah soal, semester, kesulitan, topik, bagi merata antar topik). Hasilnya masuk draf; atur jadwal & kode lalu terbitkan seperti biasa. Teks bacaan bersama tetap utuh.
- Ekspor/Impor bank (JSON) untuk cadangan atau berbagi antar guru. Bank ikut dalam cadangan data. Pada mode server, bank hanya bisa dibaca guru.

## Paket Soal Pemanasan (kelas XII semester 1)
File `bank-pemanasan-kelas12-sem1.json`: 154 soal (±8 per mapel, 19 mapel) untuk latihan awal. Cara pakai: Bank Soal → **Impor bank** → pilih file ini. Semua soal berkunci dan berpembahasan singkat, sudah berlabel mapel/semester/materi/kesulitan.
**Catatan penting:** soal dibuat AI sebagai latihan pemanasan, bukan soal resmi. Mohon guru mapel memeriksa kunci dan kesesuaian dengan ATP sekolah sebelum dipakai untuk penilaian (terutama Bahasa Jawa, Bahasa Arab, PAIBP, dan Seni Musik). Soal bisa diedit lewat Proses Soal setelah dirakit menjadi ujian.

## Dua sistem penilaian (pilih per ujian)
Di **Unggah Soal → Sistem penilaian** (atau Kelola Ujian → Jadwal & kode) pilih:
1. **IRT 2PL + Partial Points (200–800)** — seperti sebelumnya.
2. **Berbobot manual (0–100)** — isi sendiri bobotnya: PG (per soal), PG Kompleks (per soal), Benar/Salah (**per pernyataan**), Menjodohkan (**per pasangan**). Contoh: PG 1,5 · PGK 3 · B/S 1,6 → skor = poin diperoleh ÷ poin maksimum × 100. Koma desimal boleh. PGK bisa diberi poin parsial atau harus tepat semua.
Soal tanpa kunci tidak dihitung. Skor tetap tersembunyi sampai guru klik Hitung lalu Publikasikan. Jika sistem diganti setelah dihitung, klik **Hitung ulang**. Siswa melihat skala sesuai ujian (rata-rata lintas ujian beda skala otomatis dinormalkan 0–100).

## Teka-Teki Pompom (menu siswa → Teka-Teki)
- **Penalaran Cepat:** 41 soal ala Penalaran Umum (deret angka/huruf, analogi, silogisme, logika urutan, sandi, hitungan cerdik) ditambah soal acak otomatis. Mode 10 soal atau Tanpa Batas (3 nyawa). Ada timer, kombo, petunjuk (−5 poin), pembahasan, bintang, dan rekor pribadi.
- **Teka-Teki Silang:** 6 TTS bertema (Biologi, Sejarah/PPKn, Geografi/Ekonomi, Bahasa Indonesia, Matematika/Fisika/Kimia, Galaksi Andromeda). Ada tombol Cek, Bantu huruf, Bantu kata; progres tersimpan otomatis.
- **Musik:** dibuat langsung oleh aplikasi (tanpa file audio): irama seru untuk Penalaran (makin cepat saat waktu hampir habis) dan santai untuk TTS/menu. Tombol 🎵 untuk menyalakan/mematikan. Musik berhenti otomatis saat siswa keluar dari menu ini, dan tidak pernah berbunyi saat ujian.
- Skor dan rekor permainan tersimpan di perangkat siswa, terpisah dari nilai ujian.

## Karakter profil siswa
Setiap siswa otomatis mendapat satu karakter (dari 12 karakter orisinal "Penghuni Andromeda") dan bisa menggantinya di Profile → Ganti karakter. Pilihan tersimpan di perangkat siswa. Karakter tampil di layar pilih nama, bilah atas, dan profil.

## Pembaruan (19 Nov 2026)
- **Tampilan**: otomatis menyesuaikan HP (tab bawah), tablet, dan laptop (menu samping). Tombol *Otomatis / HP / Laptop* di bar atas memaksa mode tertentu. Ada animasi loading saat membuka aplikasi dan saat masuk.
- **Pindai soal lebih teliti**: mengenali bacaan, soal, pernyataan, opsi; kunci jawaban terbaca dari teks **tebal**, **berwarna**, **stabilo/highlight**, atau garis bawah (DOCX & PDF). Setelah pindai, buka *🔎 Peta hasil pindai* untuk melihat peran tiap blok dan tingkat keyakinan; kunci berkeyakinan rendah ditandai agar dicek.
- **Unduhan hasil**: CSV memuat skor mentah (%), butir benar/poin, theta, skor final IRT 200–800 + setara 0–100, dan predikat. Gambar WhatsApp & tabel di layar menampilkan skor mentah + final. Siswa melihat keduanya.
- **Karakter profil**: 61 karakter (49 bergaya anime/AU, putra & putri).
- **Rekap Data** (guru) : Ringkasan, Hasil Ujian, Evaluasi Butir (daya beda, sebaran opsi), Pemetaan Pemahaman (heatmap siswa × topik), Kesalahan Umum, Per Siswa (kelebihan/kekurangan/saran), Gabungan Mapel; KKM bisa diatur; unduh CSV/cetak PDF. Siswa punya **Rekap Saya**.
- **Database ExcelNation**: gabungan CBT + Database Eligible. Guru: tabel gabungan (rata-rata CBT, rapor Eligible, kelengkapan) + buka data Eligible tiap siswa. Siswa: mengisi data Eligible sendiri. Data Eligible disimpan di perangkat dan ikut Cadangan (Pengaturan). Data dari aplikasi Eligible lama bisa dipindah lewat *Cadangkan → Pulihkan*.

## Pembaruan: Isian Singkat, Esai Kata Kunci, Tema Mistik, Gamifikasi

**Tipe soal baru**
- *Isian Singkat*: kunci = satu/lebih jawaban diterima (satu per baris). Toleransi salah ketik ringan, urutan kata bebas, angka dibandingkan sebagai angka.
- *Esai (Kata Kunci)*: tulis `kata | sinonim *bobot` per baris; skor = bobot kata kunci yang disebut ÷ total bobot. Ada kolom "Minimal kata" dan kotak uji langsung.
- Pemindai dokumen mengenali soal tanpa opsi sebagai isian (titik-titik/"isilah") atau esai, dan membaca baris "Kata kunci:" / "Rubrik:" / "Pedoman penskoran:".
- Guru bisa mengoreksi manual di Hasil & Publikasi → ✍ Koreksi isian & esai (nilai manual menimpa otomatis).

**Tampilan**: nuansa ungu mistik — aurora, lingkaran rune berputar, debu cahaya, kartu kaca bercahaya (mode gelap & terang).

**Fitur siswa**: Peta Galaksi Belajar (planet per mapel), Prestasi (XP, level, streak, 14 lencana, misi), Pompom yang berevolusi (6 tahap), Kartu Prestasi (unduh PNG).

## Pembaruan Versi Final
Lihat PANDUAN.md (hasil) dan PERBARUI-RAILWAY.md untuk daftar fitur baru dan langkah update Railway.
