// Google Keep Clone - Storage Utility

const STORAGE_KEYS = {
  NOTES: 'keep_notes',
  LABELS: 'keep_labels',
  THEME: 'keep_theme',
  SETTINGS: 'keep_settings'
};

/**
 * Saves the notes array to localStorage.
 * @param {Array} notes 
 */
export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes to localStorage:", error);
  }
}

/**
 * Loads notes from localStorage.
 * @returns {Array|null}
 */
export function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to load notes from localStorage:", error);
    return null;
  }
}

/**
 * Saves labels to localStorage.
 * @param {Array} labels 
 */
export function saveLabels(labels) {
  try {
    localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
  } catch (error) {
    console.error("Failed to save labels to localStorage:", error);
  }
}

/**
 * Loads labels from localStorage.
 * @returns {Array|null}
 */
export function loadLabels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LABELS);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to load labels from localStorage:", error);
    return null;
  }
}

/**
 * Saves app settings to localStorage.
 * @param {Object} settings 
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
}

/**
 * Loads settings from localStorage.
 * @returns {Object|null}
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
    return null;
  }
}

