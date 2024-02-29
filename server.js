const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON bodies
app.use(express.json());

// Serve static files 
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes from the database.' });
      return;
    }

    res.json(JSON.parse(data));
  });
});

app.post('/api/notes', (req, res) => {
  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };

  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes from the database.' });
      return;
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile('db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save note to the database.' });
        return;
      }

      res.json(newNote);
    });
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes from the database.' });
      return;
    }

    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== id);

    fs.writeFile('db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete note from the database.' });
        return;
      }

      res.status(204).end();
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
