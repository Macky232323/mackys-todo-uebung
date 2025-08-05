const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect(err => {
  if (err) {
    console.error('Fehler bei der Datenbankverbindung: ', err);
    return;
  }
  console.log('Erfolgreich mit der MySQL-Datenbank verbunden.');
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME DEFAULT NULL
    );
  `;
  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log('Tabelle "todos" ist bereit.');
  });
});

// KORRIGIERTE, EINFACHERE SORTIERUNG
app.get('/todos', (req, res) => {
  const query = 'SELECT * FROM todos ORDER BY is_completed ASC, completed_at ASC, created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/todos', (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Das Feld "task" darf nicht leer sein.' });
  }
  db.query('INSERT INTO todos (task) VALUES (?)', [task], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, task });
  });
});

// DIE EXPLIZITE, KORREKTE UPDATE-LOGIK BLEIBT
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT is_completed FROM todos WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'ToDo nicht gefunden.'});
        }

        const currentStatus = results[0].is_completed;
        let updateQuery;
        
        if (currentStatus) {
            updateQuery = 'UPDATE todos SET is_completed = FALSE, completed_at = NULL WHERE id = ?';
        } else {
            updateQuery = 'UPDATE todos SET is_completed = TRUE, completed_at = NOW() WHERE id = ?';
        }

        db.query(updateQuery, [id], (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).json({ error: updateErr.message });
            }
            res.status(200).json({ message: 'ToDo-Status geändert.' });
        });
    });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ToDo nicht gefunden.'});
    }
    res.status(204).send();
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend-Server läuft auf Port ${PORT}`);
});