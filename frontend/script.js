const API_URL = `http://${window.location.hostname}:3000/todos`;

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const completedTodoList = document.getElementById('completed-todo-list');
const completedHeader = document.getElementById('completed-header');

function formatTimestamp(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
}

async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        const todos = await response.json();
        
        todoList.innerHTML = '';
        completedTodoList.innerHTML = '';
        
        let completedCount = 0;

        todos.forEach(todo => {
            const li = document.createElement('li');

            const contentDiv = document.createElement('div');
            contentDiv.className = 'todo-content';
            contentDiv.textContent = todo.task;
            
            const timestampContainer = document.createElement('div');
            timestampContainer.className = 'timestamp-container';

            const createdSpan = document.createElement('span');
            createdSpan.className = 'timestamp-created';
            createdSpan.textContent = `Erstellt: ${formatTimestamp(todo.created_at)}`;
            timestampContainer.appendChild(createdSpan);
            
            if (todo.is_completed && todo.completed_at) {
                const completedSpan = document.createElement('span');
                completedSpan.className = 'timestamp-completed';
                completedSpan.textContent = `Erledigt: ${formatTimestamp(todo.completed_at)}`;
                timestampContainer.appendChild(completedSpan);
            }
            contentDiv.appendChild(timestampContainer);
            li.appendChild(contentDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'todo-actions';

            const completeButton = document.createElement('button');
            completeButton.textContent = '✓';
            completeButton.className = 'complete-btn';
            completeButton.dataset.id = todo.id;
            actionsDiv.appendChild(completeButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.className = 'delete-btn';
            deleteButton.dataset.id = todo.id;
            actionsDiv.appendChild(deleteButton);
            
            li.appendChild(actionsDiv);

            if (todo.is_completed) {
                completedTodoList.appendChild(li);
                completedCount++;
            } else {
                todoList.appendChild(li);
            }
        });

        completedHeader.style.display = completedCount > 0 ? 'block' : 'none';

    } catch (error) {
        console.error('Fehler beim Laden der To-Dos:', error);
    }
}

todoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const task = todoInput.value.trim();
    if (task) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: task }),
            });
            todoInput.value = '';
            fetchTodos();
        } catch (error) {
            console.error('Fehler beim Hinzufügen des To-Dos:', error);
        }
    }
});

document.body.addEventListener('click', async (event) => {
    const target = event.target;
    const id = target.dataset.id;

    if (!id) return;

    if (target.classList.contains('complete-btn')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'PUT' });
            fetchTodos();
        } catch (error) {
            console.error('Fehler beim Ändern des To-Do-Status:', error);
        }
    }

    if (target.classList.contains('delete-btn')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchTodos();
        } catch (error) {
            console.error('Fehler beim Löschen des To-Dos:', error);
        }
    }
});

fetchTodos();