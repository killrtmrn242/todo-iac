const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Создать задачу (POST /api/tasks)
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Ошибка при создании задачи:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Получить все задачи (GET /api/tasks)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error('Ошибка при получении задач:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Обновить задачу (PUT /api/tasks/:id)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Ошибка при обновлении задачи:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Удалить задачу (DELETE /api/tasks/:id)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Ошибка при удалении задачи:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
