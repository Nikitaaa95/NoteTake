let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let clearBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelector('.list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

//updating to post notes properly
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };
  saveNote(newNote)
    .then(response => response.json())
    .then(savedNote => {
      // Update the UI to display the saved note
      console.log('Note saved successfully:', savedNote);
      getAndRenderNotes();
      renderActiveNote(); 
    })
    .catch(error => {
      console.error('Error saving note:', error);
    });
};


// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target.parentElement;
  const noteId = JSON.parse(note.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

// Clear the form fields
const handleClearForm = () => {
  noteTitle.value = '';
  noteText.value = '';
  renderActiveNote();
};

// Event listener for the clear button
clearBtn.addEventListener('click', handleClearForm);


// Renders the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
  show(clearBtn);
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Put together the list of note's titles
const renderNoteList = async () => {
  try {
    const notes = await getNotes();
    const jsonNotes = await notes.json();

    noteList.innerHTML = '';

    if (!Array.isArray(jsonNotes)) {
      console.error('Invalid data format: expected an array');
      return;
    }

    if (jsonNotes.length === 0) {
      noteList.innerHTML = '<li class="list-group-item">No saved Notes</li>';
      return;
    }

    jsonNotes.forEach((note) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.innerHTML = `<span class="list-item-title">${note.title}</span><i class="fas fa-trash-alt float-right text-danger delete-note"></i>`;
      li.setAttribute('data-note', JSON.stringify(note));
      li.querySelector('.list-item-title').addEventListener('click', handleNoteView);
      li.querySelector('.delete-note').addEventListener('click', handleNoteDelete);
      noteList.appendChild(li);
    });
  } catch (error) {
    console.error('Error rendering note list:', error);
  }
};

// Gets notes from the db and shows them to the sidebar
const getAndRenderNotes = () => {
  getNotes().then(renderNoteList);
};

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteForm.addEventListener('input', handleRenderBtns);
}

getAndRenderNotes();
