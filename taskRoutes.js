/**
 * Task Routes - src/routes/taskRoutes.js
 *
 * Mendefinisikan semua endpoint untuk resource "tasks".
 * Router hanya bertugas mapping URL + HTTP method ke handler di controller.
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// ── Endpoint Utama Tasks ─────────────────────────────────────────
// POST   /api/tasks         → Buat task baru (201 / 400)
// GET    /api/tasks         → Ambil semua task (200)
// GET    /api/tasks/:id     → Ambil task by ID (200 / 404)
// PUT    /api/tasks/:id     → Update task (200 / 400 / 404)
// DELETE /api/tasks/:id     → Hapus task (204 / 404)

// ── Contoh endpoint dengan autentikasi (401) ─────────────────────
// GET    /api/tasks/protected  → Perlu Authorization header

router.post('/tasks', taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/protected', taskController.getProtectedTask);  // harus SEBELUM /:id
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;
