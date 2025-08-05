// Import der benötigten Pakete
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// App-Initialisierung
const app = express();
app.use(cors()); // CORS für alle Routen aktivieren
app.use(express.json()); // Ermöglicht das Lesen von JSON im Request Body

// Datenbankverbindung
// Die Daten kommen später aus den Umgebungsvariablen von Docker Compose
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Versuch, die Verbindung zur Datenbank herzustellen
db.connect(err => {
  if (err) {
    console.error('Fehler bei der Datenbankverbindung: ', err);
    return;
  }
  console.log('Erfolgreich mit der MySQL-Datenbank verbunden.');

  // Erstelle die Tabelle, falls sie nicht existiert
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log('Tabelle "todos" ist bereit.');
  });
});

// === API-Endpunkte ===

// GET /todos - Alle To-Dos abrufen
app.get('/todos', (req, res) => {
  db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST /todos - Ein neues To-Do hinzufügen
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

// DELETE /todos/:id - Ein To-Do löschen
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ToDo nicht gefunden.'});
    }
    res.status(204).send(); // 204 No Content - Erfolgreich gelöscht
  });
});


// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend-Server läuft auf Port ${PORT}`);
});