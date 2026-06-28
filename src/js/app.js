// Google Keep Clone - Main Application Logic (Step 5 Multi-Section Controller)

import { 
  getNotes, 
  addNote, 
  editNote, 
  trashNote, 
  restoreNote, 
  deleteNotePermanently, 
  archiveNote, 
  unarchiveNote, 
  emptyTrash 
} from './notes.js';

import { 
  initUI, 
  renderNotes, 
  openNoteModal, 
  removeNoteFromDOM, 
  openLabelsModal,
  showToast,
  updateProfileUI
} from './ui.js';

import { 
  loadLabels, 
  saveLabels,
  saveNotes,
  loadProfile,
  saveProfile
} from './storage.js';

// Application State
let activeTab = 'notes';
let searchQuery = '';
let labelsState = loadLabels() || [];

// Migration: clean up legacy default labels if they exist
if (labelsState.length === 4 && 
    labelsState.includes('Work') && 
    labelsState.includes('Personal') && 
    labelsState.includes('Health') && 
    labelsState.includes('Inspiration')) {
  labelsState = [];
  saveLabels(labelsState);
}

/**
 * Main application initializer
 */
export function initApp() {
  console.log("Initializing Keep Application...");

  // Initialize UI event handlers and pass state mutation callbacks
  initUI({
    onNoteCreated: (data) => handleAddNote(data.title, data.content, data.color, data.pinned, { image: data.image, reminder: data.reminder, labels: data.labels }),
    onSaveNote: handleSaveNote,
    onPinToggle: handlePinToggle,
    onDeleteClick: handleDeleteNote,
    onDeleteAll: handleDeleteAllNotes,
    onArchiveClick: handleNoteArchived,
    onUnarchiveClick: handleNoteUnarchive,
    onRestoreClick: handleNoteRestore,
    onDeleteForeverClick: handleNoteDeleteForever,
    onCardClick: handleCardClick,
    onSearch: handleSearch,
    onNavigation: handleNavigation,
    onEditLabelsClick: handleEditLabelsClick,
    onSaveProfile: handleSaveProfile
  });

  // Load and apply user profile data on startup
  const currentProfile = loadProfile() || {
    name: "Valluri Rahul",
    email: "vallurirahul3@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
  };
  updateProfileUI(currentProfile);

  // Render initial set of mock notes
  refreshNotesDisplay();
}

/**
 * Refreshes notes rendering based on active tab and search query
 */
function refreshNotesDisplay() {
  let notesToRender = [...getNotes()];

  // Filter notes by activeTab
  if (activeTab === 'notes') {
    notesToRender = notesToRender.filter(note => !note.archived && !note.trashed);
  } else if (activeTab === 'reminders') {
    notesToRender = notesToRender.filter(note => !note.trashed && note.reminder !== null);
  } else if (activeTab === 'archive') {
    notesToRender = notesToRender.filter(note => note.archived && !note.trashed);
  } else if (activeTab === 'trash') {
    notesToRender = notesToRender.filter(note => note.trashed);
  }

  // Apply live search filter if active
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    notesToRender = notesToRender.filter(note => 
      (note.title && note.title.toLowerCase().includes(query)) || 
      (note.content && note.content.toLowerCase().includes(query))
    );
  }

  // Draw notes dynamically in columns
  renderNotes(notesToRender, {
    onPinToggle: handlePinToggle,
    onDeleteClick: handleDeleteNote,
    onArchiveClick: handleNoteArchived,
    onUnarchiveClick: handleNoteUnarchive,
    onRestoreClick: handleNoteRestore,
    onDeleteForeverClick: handleNoteDeleteForever,
    onCardClick: handleCardClick,
    onSaveNote: handleSaveNote
  }, activeTab);
}

/**
 * Handles adding a new note, then refreshes the display
 */
function handleAddNote(title, content, color = 'default', pinned = false, extra = {}) {
  addNote(title, content, color, pinned, extra);
  refreshNotesDisplay();
}

/**
 * Moves note to Trash state with Toast Undo Action
 */
function handleDeleteNote(id) {
  trashNote(id);
  removeNoteFromDOM(id, activeTab);
  showToast('Note moved to Trash', 'Undo', () => {
    restoreNote(id);
    refreshNotesDisplay();
    showToast('Note restored');
  });
}

/**
 * Restores note from Trash state
 */
function handleNoteRestore(id) {
  restoreNote(id);
  removeNoteFromDOM(id, activeTab);
  showToast('Note restored', 'Undo', () => {
    trashNote(id);
    refreshNotesDisplay();
  });
}

/**
 * Permanently deletes a note from system
 */
function handleNoteDeleteForever(id) {
  deleteNotePermanently(id);
  removeNoteFromDOM(id, activeTab);
}

/**
 * Handles notes archiving with Toast Undo Action
 */
function handleNoteArchived(id) {
  archiveNote(id);
  removeNoteFromDOM(id, activeTab);
  showToast('Note archived', 'Undo', () => {
    unarchiveNote(id);
    refreshNotesDisplay();
    showToast('Note unarchived');
  });
}

/**
 * Moves note out of Archive
 */
function handleNoteUnarchive(id) {
  unarchiveNote(id);
  removeNoteFromDOM(id, activeTab);
  showToast('Note unarchived', 'Undo', () => {
    archiveNote(id);
    refreshNotesDisplay();
  });
}

/**
 * Handles deleting/cleaning notes inside the current view
 */
function handleDeleteAllNotes() {
  if (activeTab === 'trash') {
    emptyTrash();
    showToast('Trash emptied permanently');
  } else if (activeTab === 'archive') {
    // Trash all archived notes
    const archivedNotes = getNotes().filter(note => note.archived && !note.trashed);
    archivedNotes.forEach(note => trashNote(note.id));
    showToast('All archived notes moved to Trash');
  } else {
    // Trash all active notes
    const activeNotes = getNotes().filter(note => !note.archived && !note.trashed);
    activeNotes.forEach(note => trashNote(note.id));
    showToast('All active notes moved to Trash');
  }
  refreshNotesDisplay();
}

/**
 * Reusable modal save handler (supports both new note creation and editing)
 */
function handleSaveNote(id, data) {
  if (id) {
    editNote(id, data);
    refreshNotesDisplay();
  } else {
    handleAddNote(data.title, data.content, data.color, data.pinned, { image: data.image, reminder: data.reminder, labels: data.labels });
  }
}

/**
 * Toggles pinned state of a note
 */
function handlePinToggle(noteId) {
  const note = getNotes().find(n => n.id === noteId);
  if (note) {
    const nextPinned = !note.pinned;
    editNote(noteId, { pinned: nextPinned });
    refreshNotesDisplay();
  }
}

/**
 * Handles clicking on a note card to trigger edit note modal
 */
function handleCardClick(note) {
  openNoteModal(note, handleSaveNote, handleDeleteNote);
}

/**
 * Live filters notes by search query
 */
function handleSearch(query) {
  searchQuery = query;
  refreshNotesDisplay();
}

/**
 * Navigation change context
 */
function handleNavigation(tabName) {
  activeTab = tabName;
  refreshNotesDisplay();
}

/**
 * Returns recursive label modification event handlers
 */
function getLabelCallbacks() {
  return {
    onCreateLabel: (name) => {
      if (name && !labelsState.includes(name)) {
        labelsState.push(name);
        saveLabels(labelsState);
        openLabelsModal(labelsState, getLabelCallbacks());
      }
    },
    onRenameLabel: (oldName, newName) => {
      if (newName && oldName !== newName) {
        labelsState = labelsState.map(l => l === oldName ? newName : l);
        saveLabels(labelsState);
        // Sync labels inside notes
        getNotes().forEach(note => {
          if (note.labels) {
            note.labels = note.labels.map(l => l === oldName ? newName : l);
          }
        });
        saveNotes(getNotes());
        openLabelsModal(labelsState, getLabelCallbacks());
        refreshNotesDisplay();
      }
    },
    onDeleteLabel: (name) => {
      labelsState = labelsState.filter(l => l !== name);
      saveLabels(labelsState);
      // Remove label reference from notes
      getNotes().forEach(note => {
        if (note.labels) {
          note.labels = note.labels.filter(l => l !== name);
        }
      });
      saveNotes(getNotes());
      openLabelsModal(labelsState, getLabelCallbacks());
      refreshNotesDisplay();
    }
  };
}

/**
 * Opens label editor popup dialog
 */
function handleEditLabelsClick() {
  openLabelsModal(labelsState, getLabelCallbacks());
}

/**
 * Handles profile save callback from UI
 * @param {Object} profileData 
 */
function handleSaveProfile(profileData) {
  saveProfile(profileData);
  updateProfileUI(profileData);
}
