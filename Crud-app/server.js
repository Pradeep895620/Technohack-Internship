const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure data directory exists
async function ensureDataFile() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error setting up data file:', error);
    }
}

// Read all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading tasks' });
    }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const tasks = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
        const newTask = {
            id: Date.now().toString(),
            title: req.body.title,
            description: req.body.description || '',
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const tasks = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...req.body,
            id: req.params.id // Ensure ID doesn't change
        };
        
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error updating task' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const tasks = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
        const filteredTasks = tasks.filter(t => t.id !== req.params.id);
        
        if (tasks.length === filteredTasks.length) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        await fs.writeFile(DATA_FILE, JSON.stringify(filteredTasks, null, 2));
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
});

// Initialize and start server
ensureDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});