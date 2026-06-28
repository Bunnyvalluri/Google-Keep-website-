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

// Initialize notesState from localStorage (filtering out legacy mock notes if any exist)
export let notesState = (loadNotes() || []).filter(note => note.id > 6);

// Sync cleaned state back to local storage if legacy mock notes were removed
if (loadNotes() && loadNotes().some(note => note.id <= 6)) {
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

