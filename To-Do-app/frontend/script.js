// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const todoForm = document.getElementById('todoForm');
const todoContainer = document.getElementById('todoContainer');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModal = document.querySelector('.close');

// State
let isEditing = false;

// Utility Functions
const showLoading = () => loading.classList.remove('hidden');
const hideLoading = () => loading.classList.add('hidden');

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// API Functions
const api = {
    async getTodos() {
        const response = await fetch(`${API_BASE_URL}/todos`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    async createTodo(todo) {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todo)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    async updateTodo(id, todo) {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todo)
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    async deleteTodo(id) {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data;
    },

    async deleteAllTodos() {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data;
    }
};

// Render Functions
const createTodoElement = (todo) => {
    const todoDiv = document.createElement('div');
    todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoDiv.dataset.id = todo.id;

    todoDiv.innerHTML = `
        <div class="todo-header">
            <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
            <span class="todo-status">${todo.completed ? 'Completed' : 'Pending'}</span>
        </div>
        ${todo.description ? `
            <p class="todo-description">${escapeHtml(todo.description)}</p>
        ` : ''}
        <div class="todo-meta">
            <div>Created: ${formatDate(todo.createdAt)}</div>
            <div>Updated: ${formatDate(todo.updatedAt)}</div>
        </div>
        <div class="todo-actions">
            <button class="btn btn-secondary toggle-btn" onclick="toggleTodoStatus('${todo.id}')">
                <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                ${todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="btn btn-warning edit-btn" onclick="openEditModal('${todo.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger delete-btn" onclick="deleteTodo('${todo.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    return todoDiv;
};

// Helper function to escape HTML
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const renderTodos = (todos) => {
    todoContainer.innerHTML = '';
    if (todos.length === 0) {
        todoContainer.innerHTML = '<p class="no-todos">No todos yet. Add your first task!</p>';
        return;
    }
    todos.forEach(todo => {
        todoContainer.appendChild(createTodoElement(todo));
    });
};

// Load Todos
const loadTodos = async () => {
    try {
        showLoading();
        const todos = await api.getTodos();
        renderTodos(todos);
    } catch (error) {
        showError('Failed to load todos: ' + error.message);
    } finally {
        hideLoading();
    }
};

// Add Todo
const addTodo = async (event) => {
    event.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!title) {
        showError('Title is required');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        await api.createTodo({ title, description });
        todoForm.reset();
        await loadTodos();
    } catch (error) {
        showError('Failed to add todo: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
};

// Toggle Todo Status
window.toggleTodoStatus = async (id) => {
    try {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        const isCompleted = todoElement.classList.contains('completed');
        
        await api.updateTodo(id, { completed: !isCompleted });
        await loadTodos();
    } catch (error) {
        showError('Failed to update todo: ' + error.message);
    }
};

// Delete Todo
window.deleteTodo = async (id) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        await api.deleteTodo(id);
        await loadTodos();
    } catch (error) {
        showError('Failed to delete todo: ' + error.message);
    }
};

// Delete All Todos
const deleteAllTodos = async () => {
    if (todos.length === 0) {
        showError('No todos to delete');
        return;
    }

    if (!confirm('Are you sure you want to delete all todos? This action cannot be undone.')) return;

    deleteAllBtn.disabled = true;
    try {
        await api.deleteAllTodos();
        await loadTodos();
    } catch (error) {
        showError('Failed to delete all todos: ' + error.message);
    } finally {
        deleteAllBtn.disabled = false;
    }
};

// Edit Modal Functions
window.openEditModal = async (id) => {
    try {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        const title = todoElement.querySelector('.todo-title').textContent;
        const description = todoElement.querySelector('.todo-description')?.textContent || '';
        const isCompleted = todoElement.classList.contains('completed');

        document.getElementById('editId').value = id;
        document.getElementById('editTitle').value = title;
        document.getElementById('editDescription').value = description;
        document.getElementById('editCompleted').checked = isCompleted;

        editModal.style.display = 'block';
    } catch (error) {
        showError('Failed to open edit modal: ' + error.message);
    }
};

const closeEditModal = () => {
    editModal.style.display = 'none';
    editForm.reset();
};

const updateTodo = async (event) => {
    event.preventDefault();

    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const completed = document.getElementById('editCompleted').checked;

    if (!title) {
        showError('Title is required');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        await api.updateTodo(id, { title, description, completed });
        closeEditModal();
        await loadTodos();
    } catch (error) {
        showError('Failed to update todo: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
};

// Event Listeners
todoForm.addEventListener('submit', addTodo);
deleteAllBtn.addEventListener('click', deleteAllTodos);
editForm.addEventListener('submit', updateTodo);
closeModal.addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', loadTodos);