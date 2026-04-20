// Simulasi database in-memory
let tasks = [];
let idCounter = 1;

/**
 * Membuat task baru
 * @param {string} title - Judul task
 * @param {string} no_hp - Nomor HP pemilik task
 * @returns {Object} Task yang baru dibuat
 */
const createTask = (title, no_hp) => {
  const newTask = {
    id: idCounter++,
    title: title.trim(),
    no_hp: no_hp.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return newTask;
};

/**
 * Mengambil semua task
 * @returns {Array} Daftar semua task
 */
const getAllTasks = () => {
  return tasks;
};

/**
 * Mengambil task berdasarkan ID
 * @param {number} id - ID task
 * @returns {Object|null} Task jika ditemukan, null jika tidak
 */
const getTaskById = (id) => {
  return tasks.find((t) => t.id === parseInt(id)) || null;
};

/**
 * Memperbarui task berdasarkan ID
 * @param {number} id - ID task
 * @param {Object} updateData - Data yang akan diperbarui
 * @returns {Object|null} Task yang sudah diperbarui, atau null jika tidak ditemukan
 */
const updateTask = (id, updateData) => {
  const index = tasks.findIndex((t) => t.id === parseInt(id));
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updateData, updatedAt: new Date().toISOString() };
  return tasks[index];
};

/**
 * Menghapus task berdasarkan ID
 * @param {number} id - ID task
 * @returns {boolean} true jika berhasil dihapus, false jika tidak ditemukan
 */
const deleteTask = (id) => {
  const index = tasks.findIndex((t) => t.id === parseInt(id));
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
