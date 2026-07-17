# Update Log: Penambahan Fitur & Role Admin

Dokumen ini berisi rangkuman fitur-fitur baru yang telah diimplementasikan ke dalam aplikasi **Puspadi Bali Portal** yang berkaitan dengan penambahan **Role Admin** beserta hak akses khusus yang menyertainya.

## Ringkasan Pembaruan

Sistem kini memiliki role pengguna baru, yaitu `ADMIN`. Pengguna dengan role ini memiliki hak istimewa (privilege) untuk memantau aktivitas keseluruhan di dalam sistem dan mengelola data-data inti.

## Fitur-Fitur Baru (Frontend & Backend)

### 1. Manajemen Hak Akses Penerima Manfaat (Beneficiary)

- **Akses Edit & Hapus**: Sebelumnya dibatasi, sekarang akun dengan role `ADMIN` memiliki izin penuh untuk mengedit informasi dan menghapus (delete) data Penerima Manfaat langsung dari dashboard utama.
- **Pembaruan Backend**: `IsAdmin` permission class telah ditambahkan ke dalam `users/permissions.py` dan diterapkan pada `BeneficiaryDataViewSet` untuk memungkinkan metode modifikasi bagi role `ADMIN`.

### 2. Manajemen Pengguna (Users List)

- **Daftar Pengguna Global**: Admin kini memiliki menu baru bernama **"Users Management"** di sidebar. Halaman ini (`Users.jsx`) memungkinkan Admin untuk melihat daftar seluruh pengguna (Penerima Manfaat, Staff Lapangan, Operational Staff, Manager, dan Admin lainnya) lengkap dengan informasi email, nama asli, dan jabatannya.
- **Pembaruan Backend**: Endpoint `/users/users/` dibuat menggunakan `UserViewSet` yang hanya bisa diakses oleh `ADMIN`.

### 3. Log Aktivitas (Activity Logs)

- **Pemantauan Aktivitas (Audit Trail)**: Menu baru **"Activity Logs"** ditambahkan ke sidebar (`ActivityLogs.jsx`). Halaman ini berfungsi sebagai buku catatan (_log_) dari sistem yang merekam:
  - Siapa yang _Login_ dan kapan.
  - Siapa yang _menambah_ (Create) data penerima manfaat.
  - Siapa yang _mengubah_ (Update) data penerima manfaat.
  - Siapa yang _menghapus_ (Delete) data penerima manfaat.
- **Pembaruan Backend**: Model baru `ActivityLog` ditambahkan ke dalam `users/models.py`. Fitur ini berintegrasi secara otomatis (_hook_) pada proses autentikasi (Login) dan pada fungsi CRUD Beneficiary. Endpoint `/users/activity-logs/` disediakan khusus untuk admin.

### 4. Kelola Kategori Feedback

- **Manajemen Dinamis**: Menu baru **"Feedback Categories"** ditambahkan ke sidebar (`FeedbackCategories.jsx`). Admin dapat menambahkan, mengedit deskripsi, dan menghapus kategori pertanyaan feedback secara mandiri.
- **Pembaruan Backend**: Model `FeedbackCategory` dibuat dan dihubungkan ke model `Feedback` melalui relasi `ForeignKey`. Endpoint `/feedbacks/feedback-categories/` diciptakan dengan pembatasan hak tulis (Create, Update, Delete) yang diatur khusus untuk `ADMIN`.

---

## File Utama yang Dimodifikasi/Ditambahkan

**Backend (Django):**

- `backend/users/models.py` (Menambah role ADMIN & model ActivityLog)
- `backend/users/permissions.py` (Menambah kelas izin akses `IsAdmin`)
- `backend/users/views.py` (Menambahkan `UserViewSet`, `ActivityLogViewSet`, & integrasi logging aksi pengguna)
- `backend/feedbacks/models.py` (Menambah model `FeedbackCategory`)
- `backend/feedbacks/views.py` (Menambah `FeedbackCategoryViewSet`)
- File-file Migrasi Baru.

**Frontend (React/Vite):**

- `frontend/src/App.jsx` (Menambah rute aman untuk halaman Admin baru)
- `frontend/src/components/Layout.jsx` (Menambah menu navigasi sidebar khusus Admin)
- `frontend/src/pages/Beneficiaries.jsx` (Membuka batasan akses Edit/Delete untuk Admin)
- `frontend/src/pages/Users.jsx` (FILE BARU)
- `frontend/src/pages/ActivityLogs.jsx` (FILE BARU)
- `frontend/src/pages/FeedbackCategories.jsx` (FILE BARU)

## Cara Menguji

Anda dapat login menggunakan akun kredensial yang telah memiliki Role Admin berikut:

- **Username**: `admin_puspadi`
- **Password**: `Password123!`
