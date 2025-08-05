const API_URL = `http://${window.location.hostname}:3000/todos`;

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const completedTodoList = document.getElementById('completed-todo-list');
const completedHeader = document.getElementById('completed-header');

function formatTimestamp(dateString) {
    if (!dateString) {
        return '';
    }
    const date = new Date(dateString);
    // Prüfe, ob das Datum gültig ist, bevor es formatiert wird
    if (isNaN(date.getTime())) {
        return '';
    }
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
            
            let timestampsHTML = '';
            if (todo.is_completed) {
                timestampsHTML = `
                    <div class="timestamp-container">
                        <span class="timestamp-created">Erstellt: ${formatTimestamp(todo.created_at)}</span>
                        <span class="timestamp-completed">Erledigt: ${formatTimestamp(todo.completed_at)}</span>
                    </div>
                `;
                completedCount++;
            } else {
                timestampsHTML = `
                    <div class="timestamp-container">
                        <span class="timestamp-created">Erstellt: ${formatTimestamp(todo.created_at)}</span>
                    </div>
                `;
            }

            const todoHTML = `
                <div class="todo-content">
                    <div>${todo.task}</div>
                    ${timestampsHTML}
                </div>
                <div class="todo-actions">
                    <button class="complete-btn" data-id="${todo.id}">✓</button>
                    <button class="delete-btn" data-id="${todo.id}">×</button>
                </div>
            `;
            
            li.innerHTML = todoHTML;

            if (todo.is_completed) {
                completedTodoList.appendChild(li);
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