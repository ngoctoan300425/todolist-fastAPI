const API_URL = 'http://localhost:8000/api/v1/todos';

// DOM Elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const sortSelect = document.getElementById('sort-select');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// State Variables for Level 2 Pagination
let limit = 5; // Show 5 items per page
let offset = 0;
let total = 0;

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchTodos);
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// React to filter, search and sort changes
searchInput.addEventListener('input', () => { offset = 0; fetchTodos(); });
filterSelect.addEventListener('change', () => { offset = 0; fetchTodos(); });
sortSelect.addEventListener('change', () => { offset = 0; fetchTodos(); });

// Pagination events
prevBtn.addEventListener('click', () => {
    if (offset >= limit) {
        offset -= limit;
        fetchTodos();
    }
});

nextBtn.addEventListener('click', () => {
    if (offset + limit < total) {
        offset += limit;
        fetchTodos();
    }
});


// Fetch all todos from the backend with query params
async function fetchTodos() {
    try {
        const params = new URLSearchParams();
        params.append('limit', limit);
        params.append('offset', offset);

        // Search
        const q = searchInput.value.trim();
        if (q) params.append('q', q);

        // Filtering
        const filter = filterSelect.value;
        if (filter === 'active') params.append('is_done', 'false');
        if (filter === 'done') params.append('is_done', 'true');

        // Sorting
        params.append('sort', sortSelect.value);

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const data = await response.json();

        // Clear current list
        todoList.innerHTML = '';

        const items = data.items || [];
        total = data.total || 0;

        items.forEach(todo => renderTodo(todo));
        updatePagination();
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

// Update pagination buttons and text
function updatePagination() {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit) || 1;

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled = offset === 0;
    nextBtn.disabled = offset + limit >= total;
}

// Add a new todo
async function addTodo() {
    const title = todoInput.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title })
        });

        if (response.ok) {
            todoInput.value = ''; // Clear input field
            offset = 0;           // Go back to page 1 to see the newly added item
            sortSelect.value = '-created_at'; // Switch to newest first to guarantee it appears at the top
            fetchTodos();
        } else {
            const errData = await response.json();
            alert('Failed to add: ' + JSON.stringify(errData.detail));
        }
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

// Render a single todo item in the DOM
function renderTodo(todo) {
    const li = document.createElement('li');
    if (todo.is_done) {
        li.classList.add('done');
    }

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.is_done;
    checkbox.onchange = () => toggleTodo(todo);
    checkbox.style.marginRight = '10px';
    checkbox.style.cursor = 'pointer';

    // Text container
    const span = document.createElement('span');
    span.classList.add('todo-text');
    span.textContent = todo.title;
    // Toggle status on click
    span.onclick = () => toggleTodo(todo);

    // Default container for checkbox + text
    const leftDiv = document.createElement('div');
    leftDiv.style.display = 'flex';
    leftDiv.style.alignItems = 'center';
    leftDiv.style.flex = '1';
    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteTodo(todo.id);

    li.appendChild(leftDiv);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

// Toggle the 'is_done' status of a todo
async function toggleTodo(todo) {
    try {
        const response = await fetch(`${API_URL}/${todo.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_done: !todo.is_done
            })
        });

        if (response.ok) {
            fetchTodos();
        } else {
            const errData = await response.json();
            alert('Failed to update: ' + JSON.stringify(errData.detail));
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

// Delete a todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // If we deleted the last item on the page, move one page back if possible
            if (offset > 0 && offset + 1 === total) {
                offset -= limit;
            }
            fetchTodos();
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}
