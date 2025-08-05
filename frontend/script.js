const API_URL = 'http://localhost:3000/todos'; // Die URL des Backends

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// alle To-Dos vom Backend zu laden und anzuzeigen
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        const todos = await response.json();

        todoList.innerHTML = ''; // Liste leeren

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.task;
            li.dataset.id = todo.id;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.className = 'delete-btn';

            li.appendChild(deleteButton);
            todoList.appendChild(li);
        });
    } catch (error) {
        console.error('Fehler beim Laden der To-Dos:', error);
    }
}

// ein neues To-Do hinzuzufügen
todoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const task = todoInput.value.trim();

    if (task) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: task }),
            });
            todoInput.value = '';
            fetchTodos(); // Liste neu laden
        } catch (error) {
            console.error('Fehler beim Hinzufügen des To-Dos:', error);
        }
    }
});

// Löschen eines To-Dos (Event Delegation)
todoList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const todoId = event.target.parentElement.dataset.id;

        try {
            await fetch(`${API_URL}/${todoId}`, {
                method: 'DELETE',
            });
            fetchTodos(); // Liste neu laden
        } catch (error) {
            console.error('Fehler beim Löschen des To-Dos:', error);
        }
    }
});


// Beim Laden der Seite die To-Dos initial laden
fetchTodos();