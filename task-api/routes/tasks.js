const express = require('express');
const router = express.Router();
const Task = require('../models/Task.js');

// GET all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    next(err); // Pass error to error handler
  }
});

// GET single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST create new task
router.post('/', async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed || false,
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate
    });

    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT update task
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields
    if (req.body.title) task.title = req.body.title;
    if (req.body.description) task.description = req.body.description;
    if (req.body.completed !== undefined) task.completed = req.body.completed;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.dueDate) task.dueDate = req.body.dueDate;

    task.updatedAt = Date.now();
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// PATCH partially update task
router.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update only provided fields
    const updates = ['title', 'description', 'completed', 'priority', 'dueDate'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    task.updatedAt = Date.now();
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;