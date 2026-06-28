// Google Keep Clone - Notes Schema and Mock Data

import { loadNotes, saveNotes } from './storage.js';

/**
 * Note object structure definition:
 * @typedef {Object} Note
 * @property {number} id - Unique identifier (timestamp)
 * @property {string} title - Note title
 * @property {string} content - Note description
 * @property {boolean} pinned - Pin status
 * @property {string} color - Note background color theme (e.g. coral, mint, default)
 * @property {Date|string} createdAt - Creation date
 * @property {boolean} archived - Archive status
 * @property {boolean} trashed - Trash status
 * @property {string|null} reminder - Note reminder timestamp/description
 * @property {string[]} labels - Note labels array
 * @property {string|null} image - Base64 image attachment
 */

// Mock notes to showcase different tabs out-of-the-box
export const MOCK_NOTES = [
  {
    id: 1,
    title: "💡 Project Objective",
    content: "Build a Google Keep clone using modular Vanilla JS + CSS and Vite. Next steps include adding persistence, edit, delete, pin, and search functionalities.",
    pinned: true,
    color: "sand",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    archived: false,
    trashed: false,
    reminder: null,
    labels: ["Work"],
    image: null
  },
  {
    id: 2,
    title: "🛒 Shopping List",
    content: "• Organic avocados\n• Greek yogurt\n• Whole grain oats\n• Dark roast coffee",
    pinned: true,
    color: "mint",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    archived: false,
    trashed: false,
    reminder: "Tomorrow, 8:00 AM",
    labels: ["Personal"],
    image: null
  },
  {
    id: 3,
    title: "🏃‍♂️ Daily Routine",
    content: "Wake up at 6:00 AM\nDrink water & meditate\n30 mins light jog\nReview project backlog",
    pinned: false,
    color: "fog",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    archived: false,
    trashed: false,
    reminder: "Everyday, 6:00 AM",
    labels: ["Personal", "Health"],
    image: null
  },
  {
    id: 4,
    title: "Quote of the day",
    content: "Simplicity is the ultimate sophistication.\n- Leonardo da Vinci",
    pinned: false,
    color: "blossom",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    archived: false,
    trashed: false,
    reminder: null,
    labels: [],
    image: null
  },
  {
    id: 5,
    title: "📦 Archived Goal",
    content: "This is an archived note. It demonstrates that the Archive section works correctly. You can unarchive this note to move it back to Notes.",
    pinned: false,
    color: "dusk",
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    archived: true,
    trashed: false,
    reminder: null,
    labels: ["ArchiveTest"],
    image: null
  },
  {
    id: 6,
    title: "🗑️ Trashed Item",
    content: "This note has been trashed. It will display a toolbar offering to Restore it or Delete it Forever.",
    pinned: false,
    color: "clay",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    archived: false,
    trashed: true,
    reminder: null,
    labels: [],
    image: null
  }
];

// Initialize notesState from localStorage, fallback to MOCK_NOTES
export let notesState = loadNotes() || MOCK_NOTES;

// Save initial mock notes if we just loaded them for the first time
if (!loadNotes()) {
  saveNotes(notesState);
}

export function getNotes() {
  return notesState;
}

export function addNote(title, content, color = 'default', pinned = false, extraFields = {}) {
  const newNote = {
    id: Date.now(),
    title: title || '',
    content: content || '',
    pinned: pinned || false,
    color: color || 'default',
    createdAt: new Date().toISOString(),
    archived: false,
    trashed: false,
    reminder: null,
    labels: [],
    image: null,
    ...extraFields
  };

  notesState = [newNote, ...notesState];
  saveNotes(notesState);
  return newNote;
}

export function editNote(id, updatedFields) {
  notesState = notesState.map(note => 
    note.id === id ? { ...note, ...updatedFields } : note
  );
  saveNotes(notesState);
  return notesState.find(note => note.id === id);
}

// Moves a note to the Trash
export function trashNote(id) {
  notesState = notesState.map(note => 
    note.id === id ? { ...note, trashed: true, pinned: false } : note
  );
  saveNotes(notesState);
}

// Restores a note from the Trash
export function restoreNote(id) {
  notesState = notesState.map(note => 
    note.id === id ? { ...note, trashed: false } : note
  );
  saveNotes(notesState);
}

// Permanently deletes a note from the array
export function deleteNotePermanently(id) {
  notesState = notesState.filter(note => note.id !== id);
  saveNotes(notesState);
}

// Deletes a note by filter (kept for legacy support if needed)
export function deleteNote(id) {
  trashNote(id);
}

// Archives a note
export function archiveNote(id) {
  notesState = notesState.map(note => 
    note.id === id ? { ...note, archived: true, pinned: false } : note
  );
  saveNotes(notesState);
}

// Unarchives a note
export function unarchiveNote(id) {
  notesState = notesState.map(note => 
    note.id === id ? { ...note, archived: false } : note
  );
  saveNotes(notesState);
}

// Clears all notes in-memory
export function deleteAllNotes() {
  notesState = [];
  saveNotes(notesState);
}

// Empties all trashed notes
export function emptyTrash() {
  notesState = notesState.filter(note => !note.trashed);
  saveNotes(notesState);
}

