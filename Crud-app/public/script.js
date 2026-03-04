// API endpoints
const API_URL = '/api/tasks';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeBtn = document.querySelector('.close');

// State
let tasks = [];

// Fetch all tasks
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        tasks = await response.json();
        displayTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showError('Failed to load tasks');
    }
}

// Display tasks
function displayTasks() {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state">No tasks yet. Add your first task!</div>';
        return;
    }

    tasksContainer.innerHTML = tasks.map(task => `
        <div class="task-card" data-id="${task.id}">
            <div class="task-header">
                <span class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</span>
                <span class="task-status">${task.completed ? '✓ Completed' : '○ Pending'}</span>
            </div>
            <div class="task-description">${escapeHtml(task.description) || 'No description'}</div>
            <div class="task-meta">Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            const newTask = await response.json();
            tasks.push(newTask);
            displayTasks();
            taskForm.reset();
            showMessage('Task added successfully!');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showError('Failed to create task');
    }
});

// Edit task
window.editTask = function(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskCompleted').checked = task.completed;
        editModal.style.display = 'block';
    }
};

// Update task
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const completed = document.getElementById('editTaskCompleted').checked;

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, completed })
        });

        if (response.ok) {
            const updatedTask = await response.json();
            const index = tasks.findIndex(t => t.id === taskId);
            tasks[index] = updatedTask;
            displayTasks();
            editModal.style.display = 'none';
            showMessage('Task updated successfully!');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
    }
});

// Delete task
window.deleteTask = async function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            tasks = tasks.filter(t => t.id !== taskId);
            displayTasks();
            showMessage('Task deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task');
    }
};

// Modal close functionality
closeBtn.onclick = function() {
    editModal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
};

// Show success message
function showMessage(message) {
    // You can implement a toast notification here
    console.log('Success:', message);
}

// Show error message
function showError(message) {
    // You can implement a toast notification here
    console.error('Error:', message);
    alert(message);
}

// Initialize
fetchTasks();