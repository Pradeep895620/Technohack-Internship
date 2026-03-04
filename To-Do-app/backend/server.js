const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Add this line
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory database
let todos = [
    {
        id: uuidv4(),
        title: 'Learn Full Stack Development',
        description: 'Build a complete todo application with frontend and backend',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        title: 'Practice JavaScript',
        description: 'Complete 5 coding challenges on LeetCode',
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Helper function to find todo by id
const findTodoById = (id) => {
    return todos.find(todo => todo.id === id);
};

// API Routes
// GET all todos
app.get('/api/todos', (req, res) => {
    try {
        res.json({
            success: true,
            data: todos,
            message: 'Todos retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving todos',
            error: error.message
        });
    }
});

// GET single todo by id
app.get('/api/todos/:id', (req, res) => {
    try {
        const todo = findTodoById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            data: todo,
            message: 'Todo retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving todo',
            error: error.message
        });
    }
});

// POST create new todo
app.post('/api/todos', (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const newTodo = {
            id: uuidv4(),
            title: title.trim(),
            description: description ? description.trim() : '',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        todos.push(newTodo);

        res.status(201).json({
            success: true,
            data: newTodo,
            message: 'Todo created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating todo',
            error: error.message
        });
    }
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
    try {
        const todoId = req.params.id;
        const { title, description, completed } = req.body;
        
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        
        if (todoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        // Update only provided fields
        if (title !== undefined) todos[todoIndex].title = title.trim();
        if (description !== undefined) todos[todoIndex].description = description.trim();
        if (completed !== undefined) todos[todoIndex].completed = completed;
        
        todos[todoIndex].updatedAt = new Date().toISOString();

        res.json({
            success: true,
            data: todos[todoIndex],
            message: 'Todo updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating todo',
            error: error.message
        });
    }
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
    try {
        const todoId = req.params.id;
        const todoExists = findTodoById(todoId);
        
        if (!todoExists) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        todos = todos.filter(todo => todo.id !== todoId);

        res.json({
            success: true,
            message: 'Todo deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting todo',
            error: error.message
        });
    }
});

// DELETE all todos (optional)
app.delete('/api/todos', (req, res) => {
    try {
        todos = [];
        res.json({
            success: true,
            message: 'All todos deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting todos',
            error: error.message
        });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/todos`);
});