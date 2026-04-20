/**
 * Task Controller - src/controllers/taskController.js
 *
 * KONSEP CONTROLLER vs SERVICE:
 * ─────────────────────────────────────────────────────────────────
 * CONTROLLER → Lapisan HTTP handler
 *   - Menerima HTTP request (req)
 *   - Membaca req.body, req.params, req.query
 *   - Melakukan validasi input
 *   - Memanggil service untuk proses bisnis
 *   - Mengirim HTTP response (res) dengan status code yang tepat
 *   - TIDAK berisi logika bisnis / akses database langsung
 *
 * SERVICE → Lapisan logika bisnis
 *   - Berisi logika bisnis murni
 *   - Mengakses/memanipulasi data (database / in-memory)
 *   - TIDAK tahu tentang HTTP, req, atau res
 *   - Bisa dipakai ulang (reusable)
 *
 * ANALOGI: Controller = Pelayan restoran (menerima pesanan & menyajikan)
 *          Service    = Chef dapur (memasak & menyiapkan makanan)
 * ─────────────────────────────────────────────────────────────────
 *
 * STATUS CODE YANG DIGUNAKAN:
 * ─────────────────────────────────────────────────────────────────
 * 200 OK          → GET berhasil, data ditemukan & dikembalikan
 * 201 Created     → POST berhasil, resource baru berhasil dibuat
 * 204 No Content  → DELETE berhasil, tidak ada data yang perlu dikembalikan
 * 400 Bad Request → Validasi gagal (title/no_hp kosong atau format salah)
 * 401 Unauthorized→ Tidak ada/salah token autentikasi
 * 404 Not Found   → Task dengan ID yang diminta tidak ditemukan
 * 500 Internal    → Kesalahan tidak terduga di sisi server
 * ─────────────────────────────────────────────────────────────────
 */

const taskService = require('../services/taskService');

/**
 * Validasi format nomor HP Indonesia
 * Format valid: 08xxx, +628xxx, 628xxx
 * @param {string} no_hp
 * @returns {boolean}
 */
const isValidNoHp = (no_hp) => {
  const regex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return regex.test(no_hp.replace(/\s|-/g, ''));
};

// ─── CREATE TASK ────────────────────────────────────────────────
/**
 * POST /api/tasks
 * Body: { "title": "...", "no_hp": "08xxx" }
 *
 * POIN 1 - Tambah parameter no_hp & validasi:
 *   - Jika title tidak dikirim → 400 Bad Request
 *   - Jika no_hp tidak dikirim → 400 Bad Request
 *   - Jika format no_hp salah  → 400 Bad Request
 *   - Jika sukses              → 201 Created
 *
 * POIN 4 - Tanpa app.use(express.json()):
 *   req.body = undefined → destructuring crash atau semua field undefined
 *   Gejala: server selalu balas 400 "Title wajib diisi" meski body dikirim
 */
const createTask = (req, res) => {
  try {
    // Jika express.json() tidak dipasang, req.body = undefined
    // Baris berikut akan crash: "Cannot destructure property 'title' of undefined"
    const { title, no_hp } = req.body || {};

    // ─── VALIDASI INPUT (400 Bad Request) ───────────────────────
    const errors = [];

    if (!title || title.trim() === '') {
      errors.push('title wajib diisi dan tidak boleh kosong');
    }

    if (!no_hp || no_hp.trim() === '') {
      errors.push('no_hp wajib diisi dan tidak boleh kosong');
    } else if (!isValidNoHp(no_hp)) {
      errors.push('Format no_hp tidak valid. Gunakan format: 08xxx, +628xxx, atau 628xxx');
    }

    if (errors.length > 0) {
      // 400 → Client mengirim data yang tidak valid atau tidak lengkap
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Validasi gagal',
        errors: errors,
      });
    }

    // ─── PANGGIL SERVICE (logika bisnis) ────────────────────────
    const newTask = taskService.createTask(title, no_hp);

    // 201 → Resource baru berhasil dibuat di server
    return res.status(201).json({
      success: true,
      status: 201,
      message: 'Task berhasil dibuat',
      data: newTask,
    });

  } catch (error) {
    // 500 → Kesalahan tidak terduga di server
    // Contoh: jika express.json() tidak dipasang & req.body = undefined lalu crash
    console.error('Error createTask:', error.message);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Terjadi kesalahan pada server',
      hint: 'Pastikan app.use(express.json()) sudah dipasang dan body dikirim sebagai JSON',
      error: error.message,
    });
  }
};

// ─── GET ALL TASKS ──────────────────────────────────────────────
/**
 * GET /api/tasks
 * 200 → Sukses mengambil data (meskipun array kosong)
 */
const getAllTasks = (req, res) => {
  try {
    const tasks = taskService.getAllTasks();

    // 200 → Request berhasil, data dikembalikan
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Daftar task berhasil diambil',
      total: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// ─── GET TASK BY ID ─────────────────────────────────────────────
/**
 * GET /api/tasks/:id
 * 200 → Task ditemukan
 * 404 → Task tidak ditemukan
 */
const getTaskById = (req, res) => {
  try {
    const task = taskService.getTaskById(req.params.id);

    if (!task) {
      // 404 → Resource yang diminta tidak ada di server
      return res.status(404).json({
        success: false,
        status: 404,
        message: `Task dengan ID ${req.params.id} tidak ditemukan`,
      });
    }

    // 200 → Data ditemukan & dikembalikan
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Task ditemukan',
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// ─── UPDATE TASK ────────────────────────────────────────────────
/**
 * PUT /api/tasks/:id
 * 200 → Task berhasil diperbarui
 * 400 → Data tidak valid
 * 404 → Task tidak ditemukan
 */
const updateTask = (req, res) => {
  try {
    const { title, no_hp, status } = req.body || {};
    const errors = [];

    if (title !== undefined && title.trim() === '') {
      errors.push('title tidak boleh kosong jika dikirim');
    }
    if (no_hp !== undefined && !isValidNoHp(no_hp)) {
      errors.push('Format no_hp tidak valid');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Validasi gagal',
        errors,
      });
    }

    const updated = taskService.updateTask(req.params.id, { title, no_hp, status });

    if (!updated) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: `Task dengan ID ${req.params.id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Task berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, status: 500, message: 'Kesalahan server' });
  }
};

// ─── DELETE TASK ────────────────────────────────────────────────
/**
 * DELETE /api/tasks/:id
 * 204 → Berhasil dihapus, tidak ada response body
 * 404 → Task tidak ditemukan
 */
const deleteTask = (req, res) => {
  try {
    const deleted = taskService.deleteTask(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: `Task dengan ID ${req.params.id} tidak ditemukan`,
      });
    }

    // 204 → Berhasil, tapi tidak ada konten yang perlu dikembalikan
    // Catatan: res.status(204).send() — jangan kirim body, browser/client akan mengabaikannya
    return res.status(204).send();

  } catch (error) {
    return res.status(500).json({ success: false, status: 500, message: 'Kesalahan server' });
  }
};

// ─── CONTOH 401 Unauthorized ────────────────────────────────────
/**
 * GET /api/tasks/protected
 * Simulasi endpoint yang butuh autentikasi
 * 401 → Token tidak ada atau tidak valid
 */
const getProtectedTask = (req, res) => {
  const token = req.headers['authorization'];

  if (!token || token !== 'Bearer rahasia123') {
    // 401 → Client tidak menyertakan kredensial yang valid
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Unauthorized: Token tidak valid atau tidak ada. Silakan login terlebih dahulu.',
    });
  }

  return res.status(200).json({
    success: true,
    status: 200,
    message: 'Akses diberikan. Data rahasia berhasil diambil.',
    data: { secret: 'Data super rahasia! 🔐' },
  });
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getProtectedTask,
};
