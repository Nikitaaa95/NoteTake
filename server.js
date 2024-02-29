const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON bodies
app.use(express.json());

// Serve static files 
app.use(express.static(path.join(__dirname, 'public')));

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'home.html'));
});


app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
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
  
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read notes from the database.' });
        return;
      }
  
      let notes = JSON.parse(data);
  
      // Replace placeholder if this is the first note being added
      if (notes.length === 1 && notes[0].id === 'placeholder') {
        notes = [newNote];
      } else {
        // Check if a note with the same ID already exists
        const existingNoteIndex = notes.findIndex((note) => note.id === newNote.id);
  
        if (existingNoteIndex !== -1) {
          // Update the existing note
          notes[existingNoteIndex] = newNote;
        } else {
          // Add the new note to the array
          notes.push(newNote);
        }
      }
  
      fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), (err) => {
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
  
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read notes from the database.' });
        return;
      }
  
      let notes = JSON.parse(data);
      const filteredNotes = notes.filter((note) => note.id !== id);
  
      if (notes.length === filteredNotes.length) {
        res.status(404).json({ error: 'Note not found.' });
        return;
      }
  
      fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(filteredNotes), (err) => {
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
