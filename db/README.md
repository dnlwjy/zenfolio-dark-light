# Database chatbot (Supabase Postgres)

Akses aplikasi memakai **koneksi Postgres langsung** lewat Drizzle — bukan Data API
(PostgREST). Karena itu `SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` tidak dipakai,
dan RLS di semua tabel aktif **tanpa policy** (deny-all untuk `anon`/`authenticated`).

## Dua koneksi yang dipakai

| Env | Dipakai untuk | Catatan |
|---|---|---|
| `DATABASE_URL` | Runtime aplikasi (pooler **transaction mode**, port 6543) | `max: 1`, `prepare: false`, `ssl: require` (wajib untuk serverless) |
| `DATABASE_URL_MIGRATE` | Menjalankan migrasi (session pooler/direct, port 5432) | Satu sesi panjang; bukan pola serverless |

## Alur migrasi

```bash
# 1. ubah db/schema.ts, lalu hasilkan SQL yang bisa dibaca & direview
npx drizzle-kit generate

# 2. tinjau file di db/migrations/ (pastikan blok ROLLBACK di akhir benar)

# 3. backup dulu (free tier tanpa PITR)
pg_dump "$DATABASE_URL_MIGRATE" -f "backup-$(date +%F).sql"

# 4. terapkan
DATABASE_URL_MIGRATE="$(grep '^DATABASE_URL_MIGRATE=' .env | cut -d= -f2-)" npx drizzle-kit migrate
```

- `db/migrations/*.sql` **di-commit** dan direview seperti kode; `db/migrations/meta/` juga.
- Urutan migrasi yang sudah dijalankan di produksi tidak boleh diubah.
- drizzle-kit tidak menghasilkan down-migration: setiap file diakhiri blok komentar
  `-- ROLLBACK:` berisi SQL pengembalian manual.
- Free tier Supabase tidak punya PITR → dump sebelum migrasi berisiko.

## Pelajaran penting

**Jangan pernah mengubah file migrasi yang sudah diterapkan.** drizzle-kit menyimpan
hash tiap file; begitu isinya berubah, `migrate` menolak jalan (dan pesan errornya
tidak selalu jelas). Pernah terjadi di proyek ini: blok RLS ditambahkan ke `0000` setelah
diterapkan → riwayat jadi tidak konsisten → diselesaikan dengan squash satu migrasi bersih
(tabel masih kosong saat itu). Aturan: RLS/perubahan SQL lain masuk ke file migrasi
**sebelum** dijalankan, atau dibuat sebagai migrasi baru.

## Pengerasan opsional (belum diaktifkan)

Role aplikasi terbatas supaya runtime tidak memakai `postgres` (owner):

```sql
create role app_chatbot login password '<password-acak>';
grant usage on schema public to app_chatbot;
grant select, insert on public.chat_session, public.chat_message, public.chat_event to app_chatbot;
grant select, insert, update on public.rate_limit to app_chatbot;
grant usage, select on all sequences in schema public to app_chatbot;
```

Setelah itu `DATABASE_URL` diarahkan ke `app_chatbot.[PROJECT-REF]` (pooler transaksi).
Belum dilakukan karena butuh menyimpan password baru; catat sebagai langkah pengerasan.

## Keep-alive

Free tier Supabase di-pause setelah 7 hari tanpa aktivitas. Cron harian memanggil
`/api/cron/keepalive` (endpoint ditambahkan di `app/api/cron/keepalive/route.ts`)
yang menjalankan `select 1` ke database.
