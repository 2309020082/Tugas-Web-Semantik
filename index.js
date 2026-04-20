/**
 * Entry Point - src/index.js
 *
 * POIN 4 - DAMPAK LUPA app.use(express.json()):
 * Jika middleware ini TIDAK dipasang, maka req.body akan bernilai `undefined`
 * saat client mengirim POST request dengan Content-Type: application/json.
 * Express secara default tidak mem-parse body JSON, sehingga:
 *   - req.body === undefined  → destructuring { title, no_hp } akan crash
 *   - Atau jika pakai optional chaining, title & no_hp akan selalu `undefined`
 *   - Validasi tidak bisa berjalan dengan benar
 *   - Server akan selalu merespons 400 "Title wajib diisi" meskipun body sudah dikirim
 *
 * CARA MEMASTIKAN FIX-NYA BENAR:
 *   1. Pasang app.use(express.json()) SEBELUM route didefinisikan
 *   2. Kirim POST dengan header Content-Type: application/json
 *   3. Cek req.body di controller — harus berupa object, bukan undefined
 *   4. Console.log(req.body) untuk debugging
 */

const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = 3000;

// ✅ WAJIB: Middleware untuk parse JSON body
// Tanpa ini, req.body = undefined saat POST /api/tasks
app.use(express.json());

// Middleware logger sederhana
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', taskRoutes);

// Handler untuk route yang tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route ${req.method} ${req.url} tidak ditemukan`,
  });
});

// Global error handler (500)
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).json({
    success: false,
    status: 500,
    message: 'Terjadi kesalahan internal pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📋 Endpoint: POST http://localhost:${PORT}/api/tasks`);
  console.log(`📋 Endpoint: GET  http://localhost:${PORT}/api/tasks`);
});
