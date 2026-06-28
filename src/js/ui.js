// Google Keep Clone - UI Controller (Modular rendering and layout behaviors)

import { loadLabels, saveLabels, loadSettings, saveSettings } from './storage.js';

// Selectors Cache
export const DOM = {
  // Navigation & Shell
  sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
  sidebar: document.getElementById('app-sidebar'),
  navAddNoteBtn: document.getElementById('nav-add-note-btn'),
  deleteAllBtn: document.getElementById('delete-all-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  viewToggleBtn: document.getElementById('view-toggle-btn'),
  viewToggleIcon: document.getElementById('view-toggle-icon'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeToggleIcon: document.getElementById('theme-toggle-icon'),
  searchInput: document.querySelector('#search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  
  // Note Creator
  noteForm: document.getElementById('note-form'),
  creatorCollapsed: document.getElementById('note-creator-collapsed'),
  creatorExpanded: document.getElementById('note-creator-expanded'),
  dummyInput: document.getElementById('dummy-input'),
  noteTitle: document.getElementById('note-title'),
  noteText: document.getElementById('note-text'),
  creatorCloseBtn: document.getElementById('note-creator-close-btn'),
  creatorPinBtn: document.getElementById('note-creator-pin-btn'),
  creatorPinIcon: document.getElementById('note-creator-pin-icon'),
  colorPaletteBtn: document.getElementById('color-palette-btn'),
  colorPickerPopover: document.getElementById('color-picker-popover'),
  archiveCreatorBtn: document.getElementById('archive-creator-btn'),
  
  // Notes Grid Workspace
  pinnedSection: document.querySelector('#pinned-section'),
  pinnedGrid: document.querySelector('#pinned-grid'),
  othersSection: document.querySelector('#others-section'),
  othersGrid: document.querySelector('#others-grid'),
  othersTitle: document.querySelector('#others-title'),
  emptyState: document.querySelector('#empty-state'),
  
  // Modal Edit Card
  editModal: document.querySelector('#edit-note-modal'),
  modalCard: document.querySelector('#modal-card'),
  modalTitle: document.getElementById('modal-title'),
  modalText: document.getElementById('modal-text'),
  modalPinBtn: document.getElementById('modal-pin-btn'),
  modalPinIcon: document.getElementById('modal-pin-icon'),
  modalColorBtn: document.getElementById('modal-color-btn'),
  modalColorPickerPopover: document.getElementById('modal-color-picker-popover'),
  modalArchiveBtn: document.getElementById('modal-archive-btn'),
  modalDeleteBtn: document.getElementById('modal-delete-btn'),
  modalSaveBtn: document.getElementById('modal-save-btn'),

  // Labels Modal selectors
  labelsModal: document.querySelector('#edit-labels-modal'),
  newLabelInput: document.getElementById('new-label-input'),
  createLabelBtn: document.getElementById('create-label-btn'),
  labelsListContainer: document.querySelector('#labels-list-container'),
  labelsModalCloseBtn: document.getElementById('labels-modal-close-btn'),

  // Settings Modal Selectors
  settingsModal: document.getElementById('settings-modal'),
  settingsFont: document.getElementById('settings-font'),
  settingsDensity: document.getElementById('settings-density'),
  settingsResetBtn: document.getElementById('settings-reset-btn'),
  settingsModalCloseBtn: document.getElementById('settings-modal-close-btn'),

  // QuerySelectorAll elements
  sidebarItems: document.querySelectorAll('.sidebar-item'),
  colorDots: document.querySelectorAll('.color-dot')
};

// State Variables for UI
let isGridView = true;
let activeColor = 'default';
let activeModalColor = 'default';

// Temporary Draft state for Note Creator
let creatorImageBase64 = null;
let creatorReminder = null;
let creatorLabels = [];

// Temporary Draft state for Modal editor
let modalImageBase64 = null;
let modalReminder = null;
let modalLabels = [];

/**
 * Initializes global UI event listeners and setups themes
 */
export function initUI(callbacks = {}) {
  // Theme management setup
  setupTheme();

  // Settings management setup
  initSettings();

  const modalReminderBtn = document.getElementById('modal-reminder-btn');
  const modalDatetimePopover = document.getElementById('modal-datetime-popover');
  const modalLabelMenuBtn = document.getElementById('modal-label-menu-btn');
  const modalLabelsDropdown = document.getElementById('modal-labels-dropdown');

  // Add note click from header (opens reusable note modal)
  DOM.navAddNoteBtn.addEventListener('click', () => {
    openNoteModal(null, callbacks.onSaveNote, callbacks.onDeleteClick);
  });

  // Delete all notes click
  DOM.deleteAllBtn.addEventListener('click', () => {
    if (callbacks.onDeleteAll) {
      callbacks.onDeleteAll();
      showToast('All active notes moved to Trash');
    }
  });

  // Sidebar toggle
  DOM.sidebarToggleBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      DOM.sidebar.classList.toggle('open');
      DOM.sidebar.classList.remove('collapsed');
    } else {
      DOM.sidebar.classList.toggle('collapsed');
      DOM.sidebar.classList.remove('open');
    }
  });

  // Sidebar link clicks (visual active state)
  const sidebarItems = DOM.sidebarItems;
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.dataset.nav === 'edit-labels') {
        if (callbacks.onEditLabelsClick) {
          callbacks.onEditLabelsClick();
        }
        return;
      }
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        DOM.sidebar.classList.remove('open');
      }

      // Callback if sidebar page changes
      if (callbacks.onNavigation) {
        callbacks.onNavigation(item.dataset.nav);
      }
    });
  });

  // Labels modal event listeners
  DOM.createLabelBtn.addEventListener('click', () => {
    const labelName = DOM.newLabelInput.value.trim();
    if (labelName && callbacks.onCreateLabel) {
      callbacks.onCreateLabel(labelName);
      DOM.newLabelInput.value = '';
      showToast(`Label "${labelName}" created`);
    }
  });

  DOM.newLabelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      DOM.createLabelBtn.click();
    }
  });

  DOM.labelsModalCloseBtn.addEventListener('click', () => {
    DOM.labelsModal.style.display = 'none';
  });

  DOM.labelsModal.addEventListener('click', (e) => {
    if (e.target === DOM.labelsModal) {
      DOM.labelsModal.style.display = 'none';
    }
  });

  // Toggle layout between Grid and List view
  DOM.viewToggleBtn.addEventListener('click', () => {
    toggleLayout();
  });

  // Auto-resize textareas as user types
  [DOM.noteText, DOM.modalText].forEach(textarea => {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });

  // Note Creator Expand/Collapse Transitions
  DOM.dummyInput.addEventListener('click', () => {
    expandNoteCreator();
  });

  DOM.creatorCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    collapseNoteCreator(callbacks.onNoteCreated);
  });

  // Color picker toggles in creator card
  DOM.colorPaletteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.colorPickerPopover.style.display = DOM.colorPickerPopover.style.display === 'none' ? 'flex' : 'none';
  });

  // Creator color selection click
  DOM.colorPickerPopover.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-dot')) {
      const color = e.target.dataset.color;
      setSelectedColor(color);
    }
  });

  // Creator Image Upload logic
  const creatorImageBtn = document.getElementById('creator-image-btn');
  const creatorImageInput = document.getElementById('creator-image-input');
  const creatorImagePreviewContainer = document.getElementById('creator-image-preview-container');
  const creatorImagePreview = document.getElementById('creator-image-preview');
  const creatorRemoveImageBtn = document.getElementById('creator-remove-image-btn');

  if (creatorImageBtn && creatorImageInput) {
    creatorImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      creatorImageInput.click();
    });

    creatorImageInput.addEventListener('change', () => {
      handleImageUpload(creatorImageInput, creatorImagePreview, creatorImagePreviewContainer, (base64) => {
        creatorImageBase64 = base64;
      });
    });

    creatorRemoveImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      creatorImageBase64 = null;
      creatorImagePreview.src = '';
      creatorImagePreviewContainer.style.display = 'none';
      creatorImageInput.value = '';
    });
  }

  // Creator Reminder DateTime popover
  const creatorReminderBtn = document.getElementById('creator-reminder-btn');
  const creatorDatetimePopover = document.getElementById('creator-datetime-popover');
  const creatorReminderInput = document.getElementById('creator-reminder-input');

  if (creatorReminderBtn && creatorDatetimePopover) {
    creatorReminderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      creatorDatetimePopover.style.display = creatorDatetimePopover.style.display === 'none' ? 'flex' : 'none';
      document.getElementById('creator-labels-dropdown').style.display = 'none';
    });

    document.getElementById('creator-dt-save').addEventListener('click', (e) => {
      e.stopPropagation();
      const val = creatorReminderInput.value;
      if (val) {
        creatorReminder = new Date(val).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        showToast(`Reminder set for ${creatorReminder}`);
      }
      creatorDatetimePopover.style.display = 'none';
    });

    document.getElementById('creator-dt-clear').addEventListener('click', (e) => {
      e.stopPropagation();
      creatorReminder = null;
      creatorReminderInput.value = '';
      creatorDatetimePopover.style.display = 'none';
      showToast('Reminder cleared');
    });
  }

  // Creator labels dropdown selection
  const creatorLabelMenuBtn = document.getElementById('creator-label-menu-btn');
  const creatorLabelsDropdown = document.getElementById('creator-labels-dropdown');

  if (creatorLabelMenuBtn && creatorLabelsDropdown) {
    creatorLabelMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (creatorLabelsDropdown.style.display === 'none') {
        populateLabelsDropdown(creatorLabelsDropdown, creatorLabels);
        creatorLabelsDropdown.style.display = 'flex';
      } else {
        creatorLabelsDropdown.style.display = 'none';
      }
      creatorDatetimePopover.style.display = 'none';
    });
  }

  // Hide popovers when clicking elsewhere
  document.addEventListener('click', (e) => {
    // Creator color picker
    if (DOM.colorPaletteBtn && !DOM.colorPaletteBtn.contains(e.target) && !DOM.colorPickerPopover.contains(e.target)) {
      DOM.colorPickerPopover.style.display = 'none';
    }
    // Modal color picker
    if (DOM.modalColorBtn && !DOM.modalColorBtn.contains(e.target) && !DOM.modalColorPickerPopover.contains(e.target)) {
      DOM.modalColorPickerPopover.style.display = 'none';
    }
    // Creator reminder popover
    if (creatorReminderBtn && !creatorReminderBtn.contains(e.target) && !creatorDatetimePopover.contains(e.target)) {
      creatorDatetimePopover.style.display = 'none';
    }
    // Creator labels popover
    if (creatorLabelMenuBtn && !creatorLabelMenuBtn.contains(e.target) && !creatorLabelsDropdown.contains(e.target)) {
      creatorLabelsDropdown.style.display = 'none';
    }
    // Modal reminder popover
    if (modalReminderBtn && !modalReminderBtn.contains(e.target) && !modalDatetimePopover.contains(e.target)) {
      modalDatetimePopover.style.display = 'none';
    }
    // Modal labels popover
    if (modalLabelMenuBtn && !modalLabelMenuBtn.contains(e.target) && !modalLabelsDropdown.contains(e.target)) {
      modalLabelsDropdown.style.display = 'none';
    }
    // Card color pickers in grid
    if (!e.target.closest(".toolbar-color-btn") && !e.target.closest(".card-color-picker")) {
      document.querySelectorAll(".card-color-picker").forEach(p => p.style.display = 'none');
    }
    // Close creator card if clicked outside
    if (DOM.noteForm && !DOM.noteForm.contains(e.target) && DOM.creatorExpanded.style.display !== 'none') {
      collapseNoteCreator(callbacks.onNoteCreated);
    }
  });

  // Pin button inside creator card
  let creatorPinned = false;
  DOM.creatorPinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    creatorPinned = !creatorPinned;
    DOM.creatorPinBtn.classList.toggle('active', creatorPinned);
    DOM.creatorPinIcon.textContent = creatorPinned ? 'keep_public' : 'keep'; // toggle pin visual icon
    DOM.creatorPinBtn.dataset.pinned = creatorPinned;
  });

  // Modal Actions
  DOM.editModal.addEventListener('click', (e) => {
    if (e.target === DOM.editModal) {
      DOM.modalSaveBtn.click();
    }
  });
  
  DOM.modalColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.modalColorPickerPopover.style.display = DOM.modalColorPickerPopover.style.display === 'none' ? 'flex' : 'none';
  });

  DOM.modalColorPickerPopover.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-dot')) {
      const color = e.target.dataset.color;
      setSelectedModalColor(color);
    }
  });

  // Modal Image upload logic
  const modalImageBtn = document.getElementById('modal-image-btn');
  const modalImageInput = document.getElementById('modal-image-input');
  const modalImagePreviewContainer = document.getElementById('modal-image-preview-container');
  const modalImagePreview = document.getElementById('modal-image-preview');
  const modalRemoveImageBtn = document.getElementById('modal-remove-image-btn');

  if (modalImageBtn && modalImageInput) {
    modalImageBtn.onclick = (e) => {
      e.stopPropagation();
      modalImageInput.click();
    };

    modalImageInput.onchange = () => {
      handleImageUpload(modalImageInput, modalImagePreview, modalImagePreviewContainer, (base64) => {
        modalImageBase64 = base64;
      });
    };

    modalRemoveImageBtn.onclick = (e) => {
      e.stopPropagation();
      modalImageBase64 = null;
      modalImagePreview.src = '';
      modalImagePreviewContainer.style.display = 'none';
      modalImageInput.value = '';
    };
  }

  // Modal Reminder DateTime Picker popover
  if (modalReminderBtn && modalDatetimePopover) {
    modalReminderBtn.onclick = (e) => {
      e.stopPropagation();
      modalDatetimePopover.style.display = modalDatetimePopover.style.display === 'none' ? 'flex' : 'none';
      document.getElementById('modal-labels-dropdown').style.display = 'none';
    };

    document.getElementById('modal-dt-save').onclick = (e) => {
      e.stopPropagation();
      const val = document.getElementById('modal-reminder-input').value;
      if (val) {
        modalReminder = new Date(val).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        showToast(`Reminder set for ${modalReminder}`);
      }
      modalDatetimePopover.style.display = 'none';
    };

    document.getElementById('modal-dt-clear').onclick = (e) => {
      e.stopPropagation();
      modalReminder = null;
      document.getElementById('modal-reminder-input').value = '';
      modalDatetimePopover.style.display = 'none';
      showToast('Reminder cleared');
    };
  }

  // Modal Labels Checklist dropdown
  if (modalLabelMenuBtn && modalLabelsDropdown) {
    modalLabelMenuBtn.onclick = (e) => {
      e.stopPropagation();
      if (modalLabelsDropdown.style.display === 'none') {
        populateLabelsDropdown(modalLabelsDropdown, modalLabels);
        modalLabelsDropdown.style.display = 'flex';
      } else {
        modalLabelsDropdown.style.display = 'none';
      }
      modalDatetimePopover.style.display = 'none';
    };
  }

  // Hook search clear button
  DOM.searchInput.addEventListener('input', () => {
    const hasValue = DOM.searchInput.value.length > 0;
    DOM.clearSearchBtn.style.display = hasValue ? 'block' : 'none';
    if (callbacks.onSearch) {
      callbacks.onSearch(DOM.searchInput.value);
    }
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.style.display = 'none';
    DOM.searchInput.focus();
    if (callbacks.onSearch) {
      callbacks.onSearch('');
    }
  });
}

/* Theme Setup & Toggling */
function setupTheme() {
  const savedTheme = localStorage.getItem('keep-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  DOM.themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('keep-theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    DOM.themeToggleIcon.textContent = 'light_mode';
    DOM.themeToggleBtn.title = 'Use light theme';
  } else {
    DOM.themeToggleIcon.textContent = 'dark_mode';
    DOM.themeToggleBtn.title = 'Use dark theme';
  }
}

/* Layout Management */
function toggleLayout() {
  isGridView = !isGridView;
  if (isGridView) {
    DOM.pinnedGrid.classList.remove('list-layout');
    DOM.othersGrid.classList.remove('list-layout');
    DOM.viewToggleIcon.textContent = 'view_list';
    DOM.viewToggleBtn.title = 'List view';
  } else {
    DOM.pinnedGrid.classList.add('list-layout');
    DOM.othersGrid.classList.add('list-layout');
    DOM.viewToggleIcon.textContent = 'grid_view';
    DOM.viewToggleBtn.title = 'Grid view';
  }
}

/* Image Upload FileReader Helper */
function handleImageUpload(fileInput, imgElement, containerElement, onSuccess) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    imgElement.src = base64;
    containerElement.style.display = 'block';
    if (onSuccess) onSuccess(base64);
  };
  reader.readAsDataURL(file);
}

/* Labels Checkbox list renderer */
function populateLabelsDropdown(dropdownEl, activeLabelsList, onChangeCallback) {
  const allLabels = loadLabels() || ['Work', 'Personal', 'Health', 'Inspiration'];
  dropdownEl.innerHTML = '';
  
  if (allLabels.length === 0) {
    dropdownEl.innerHTML = '<div style="padding: 6px 10px; font-size:11px; opacity:0.6; text-align:center;">No labels found</div>';
    return;
  }

  allLabels.forEach(label => {
    const item = document.createElement('label');
    item.className = 'label-checkbox-item';
    
    const isChecked = activeLabelsList.includes(label);
    item.innerHTML = `
      <input type="checkbox" data-label="${label}" ${isChecked ? 'checked' : ''} />
      <span>${label}</span>
    `;

    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!activeLabelsList.includes(label)) {
          activeLabelsList.push(label);
        }
      } else {
        const index = activeLabelsList.indexOf(label);
        if (index > -1) {
          activeLabelsList.splice(index, 1);
        }
      }
      if (onChangeCallback) onChangeCallback(activeLabelsList);
    });

    dropdownEl.appendChild(item);
  });
}

/* Note Creator Actions */
function expandNoteCreator() {
  DOM.creatorCollapsed.style.display = 'none';
  DOM.creatorExpanded.style.display = 'flex';
  DOM.noteText.focus();
}

function collapseNoteCreator(saveCallback) {
  const title = DOM.noteTitle.value.trim();
  const text = DOM.noteText.value.trim();
  const isPinned = DOM.creatorPinBtn.dataset.pinned === 'true';

  if ((title || text || creatorImageBase64) && saveCallback) {
    saveCallback({
      title,
      content: text,
      pinned: isPinned,
      color: activeColor,
      image: creatorImageBase64,
      reminder: creatorReminder,
      labels: [...creatorLabels]
    });
    showToast('Note created');
  }

  // Reset fields
  DOM.noteTitle.value = '';
  DOM.noteText.value = '';
  DOM.noteText.style.height = 'auto';
  DOM.creatorPinBtn.classList.remove('active');
  DOM.creatorPinIcon.textContent = 'keep';
  DOM.creatorPinBtn.dataset.pinned = 'false';
  setSelectedColor('default');
  
  // Reset creator state drafts
  creatorImageBase64 = null;
  creatorReminder = null;
  creatorLabels = [];
  document.getElementById('creator-image-preview-container').style.display = 'none';
  document.getElementById('creator-image-preview').src = '';
  document.getElementById('creator-image-input').value = '';
  document.getElementById('creator-reminder-input').value = '';
  document.getElementById('creator-datetime-popover').style.display = 'none';
  document.getElementById('creator-labels-dropdown').style.display = 'none';
  
  DOM.creatorExpanded.style.display = 'none';
  DOM.creatorCollapsed.style.display = 'flex';
}

function setSelectedColor(colorName) {
  activeColor = colorName;
  // Remove active from all dots
  DOM.colorPickerPopover.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === colorName);
  });
  // Change form bg
  DOM.noteForm.style.backgroundColor = `var(--note-bg-${colorName})`;
}

/* Note Modal Actions */
let currentEditingNote = null;

export function openNoteModal(note = null, onSaveCallback, onDeleteCallback) {
  currentEditingNote = note;
  
  if (note) {
    // Edit Mode
    DOM.modalTitle.value = note.title;
    DOM.modalText.value = note.content;
    DOM.modalDeleteBtn.style.display = 'block';
    
    const isPinned = note.pinned;
    DOM.modalPinBtn.classList.toggle('active', isPinned);
    DOM.modalPinIcon.textContent = isPinned ? 'keep_public' : 'keep';
    DOM.modalPinBtn.dataset.pinned = isPinned;

    setSelectedModalColor(note.color || 'default');

    // Populate Modal assets drafts
    modalImageBase64 = note.image || null;
    modalReminder = note.reminder || null;
    modalLabels = [...(note.labels || [])];

    // Image preview toggle
    if (modalImageBase64) {
      document.getElementById('modal-image-preview').src = modalImageBase64;
      document.getElementById('modal-image-preview-container').style.display = 'block';
    } else {
      document.getElementById('modal-image-preview-container').style.display = 'none';
      document.getElementById('modal-image-preview').src = '';
    }

    // Set reminder inputs
    document.getElementById('modal-reminder-input').value = '';
  } else {
    // Add Mode
    DOM.modalTitle.value = '';
    DOM.modalText.value = '';
    DOM.modalDeleteBtn.style.display = 'none';
    
    DOM.modalPinBtn.classList.remove('active');
    DOM.modalPinIcon.textContent = 'keep';
    DOM.modalPinBtn.dataset.pinned = 'false';

    setSelectedModalColor('default');

    // Reset Modal asset drafts
    modalImageBase64 = null;
    modalReminder = null;
    modalLabels = [];

    document.getElementById('modal-image-preview-container').style.display = 'none';
    document.getElementById('modal-image-preview').src = '';
    document.getElementById('modal-reminder-input').value = '';
  }

  DOM.modalText.style.height = 'auto';
  if (note) {
    DOM.modalText.style.height = DOM.modalText.scrollHeight + 'px';
  }

  // Wire modal Pin toggling
  DOM.modalPinBtn.onclick = (e) => {
    e.preventDefault();
    const pinState = DOM.modalPinBtn.dataset.pinned !== 'true';
    DOM.modalPinBtn.classList.toggle('active', pinState);
    DOM.modalPinIcon.textContent = pinState ? 'keep_public' : 'keep';
    DOM.modalPinBtn.dataset.pinned = pinState;
  };

  // Wire modal delete
  DOM.modalDeleteBtn.onclick = () => {
    if (onDeleteCallback && note) {
      onDeleteCallback(note.id);
    }
    DOM.editModal.style.display = 'none';
    currentEditingNote = null;
  };

  // Wire modal save (Save button click)
  DOM.modalSaveBtn.onclick = () => {
    const title = DOM.modalTitle.value.trim();
    const content = DOM.modalText.value.trim();
    const isPinned = DOM.modalPinBtn.dataset.pinned === 'true';
    const color = activeModalColor;

    if (title || content || modalImageBase64) {
      if (onSaveCallback) {
        if (note) {
          // Edit save
          onSaveCallback(note.id, { 
            title, 
            content, 
            color, 
            pinned: isPinned, 
            image: modalImageBase64,
            reminder: modalReminder,
            labels: [...modalLabels]
          });
        } else {
          // Add save
          onSaveCallback(null, { 
            title, 
            content, 
            color, 
            pinned: isPinned, 
            image: modalImageBase64,
            reminder: modalReminder,
            labels: [...modalLabels]
          });
        }
      }
    }

    DOM.editModal.style.display = 'none';
    currentEditingNote = null;
  };

  DOM.editModal.style.display = 'flex';
}

function setSelectedModalColor(colorName) {
  activeModalColor = colorName;
  DOM.modalColorPickerPopover.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === colorName);
  });
  DOM.modalCard.style.backgroundColor = `var(--note-bg-${colorName})`;
}

/* Rendering Logic */

/**
 * Updates the visibility of notes sections and empty states.
 */
export function updateSectionVisibility(activeTab = 'notes', showPinnedSection = false) {
  const pinnedCount = DOM.pinnedGrid.childElementCount;
  const othersCount = DOM.othersGrid.childElementCount;
  const totalCount = pinnedCount + othersCount;

  // Manage note creator form display
  const showCreator = (activeTab === 'notes' || activeTab === 'reminders');
  DOM.noteForm.style.display = showCreator ? 'block' : 'none';

  if (showPinnedSection && pinnedCount > 0) {
    DOM.pinnedSection.style.display = "block";
    DOM.othersTitle.style.display = "block";
  } else {
    DOM.pinnedSection.style.display = "none";
    DOM.othersTitle.style.display = "none";
  }

  if (totalCount === 0) {
    // Dynamic Empty States
    const EMPTY_STATES = {
      notes: { icon: 'lightbulb', text: 'Notes you add appear here' },
      reminders: { icon: 'notifications', text: 'Notes with upcoming reminders appear here' },
      archive: { icon: 'archive', text: 'Your archived notes appear here' },
      trash: { icon: 'delete', text: 'No notes in Trash' }
    };
    const emptyStateData = EMPTY_STATES[activeTab] || EMPTY_STATES.notes;
    const emptyIconEl = DOM.emptyState.querySelector('.empty-icon');
    const emptyTextEl = DOM.emptyState.querySelector('.empty-text');
    if (emptyIconEl) emptyIconEl.textContent = emptyStateData.icon;
    if (emptyTextEl) emptyTextEl.textContent = emptyStateData.text;

    DOM.emptyState.style.display = "flex";
    DOM.othersSection.style.display = "none";
  } else {
    DOM.emptyState.style.display = "none";
    DOM.othersSection.style.display = "block";
  }
}

/**
 * Removes a note element from the DOM by its ID and updates section visibilities.
 * @param {number} id - Note ID
 * @param {string} activeTab - The active section tab
 */
export function removeNoteFromDOM(id, activeTab = 'notes') {
  const card = document.querySelector(`.note-card[data-id="${id}"]`);
  if (card) {
    card.remove();
  }
  
  // Recalculate showPinnedSection for updateSectionVisibility
  const pinnedCount = DOM.pinnedGrid.childElementCount;
  const showPinnedSection = pinnedCount > 0 && (activeTab === 'notes' || activeTab === 'reminders');
  updateSectionVisibility(activeTab, showPinnedSection);
}

/**
 * Takes note array and renders them in correct columns
 * @param {Array} notes 
 * @param {Object} cardCallbacks - click events inside note cards (pin click, card click, delete card)
 * @param {string} activeTab - The active sidebar tab section name
 */
export function renderNotes(notes, cardCallbacks = {}, activeTab = 'notes') {
  // Clear lists before rendering using innerHTML = ""
  DOM.pinnedGrid.innerHTML = "";
  DOM.othersGrid.innerHTML = "";

  const pinnedNotes = notes.filter(n => n.pinned);
  const otherNotes = notes.filter(n => !n.pinned);

  // Render Pinned (only in notes or reminders sections)
  const showPinnedSection = pinnedNotes.length > 0 && (activeTab === 'notes' || activeTab === 'reminders');
  
  if (showPinnedSection) {
    pinnedNotes.forEach(note => {
      const noteEl = createNoteElement(note, cardCallbacks, activeTab);
      DOM.pinnedGrid.appendChild(noteEl);
    });
  }

  // Render Others
  otherNotes.forEach(note => {
    const noteEl = createNoteElement(note, cardCallbacks, activeTab);
    DOM.othersGrid.appendChild(noteEl);
  });

  // If there are pinned notes but we shouldn't show a separate pinned section, put them in the general grid
  if (!showPinnedSection && pinnedNotes.length > 0) {
    pinnedNotes.forEach(note => {
      const noteEl = createNoteElement(note, cardCallbacks, activeTab);
      DOM.othersGrid.appendChild(noteEl);
    });
  }

  // Manage sections visibility
  updateSectionVisibility(activeTab, showPinnedSection);
}

/* Regular expression escaping for highlighting search matches */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps matching query strings in <mark> tags
 */
export function highlightText(text, query) {
  if (!text) return '';
  if (!query || query.trim() === '') return text;
  const escapedQuery = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Creates dynamic note card element
 */
function createNoteElement(note, callbacks, activeTab = 'notes') {
  // 1. Create notes dynamically using document.createElement()
  const card = document.createElement("div");
  
  // 2. Add class names using classList.add()
  card.classList.add("note-card");
  if (note.pinned) {
    card.classList.add("pinned");
  }

  card.style.backgroundColor = `var(--note-bg-${note.color || 'default'})`;
  card.dataset.id = note.id;

  // Add click to open card (disabled in Trash tab)
  if (activeTab !== 'trash') {
    card.addEventListener("click", (e) => {
      // If not clicking toolbar items, popovers, or badges, open modal
      if (!e.target.closest(".card-toolbar") && 
          !e.target.closest(".card-pin-btn") && 
          !e.target.closest(".badge") &&
          !e.target.closest(".card-color-picker")) {
        if (callbacks.onCardClick) callbacks.onCardClick(note);
      }
    });
  }

  // Determine Pin Button visibility
  const showPinBtn = (activeTab !== 'trash' && activeTab !== 'archive');

  // Generate Image markup
  const imageHTML = note.image ? `
    <img src="${note.image}" class="note-card-image" alt="Attachment" />
  ` : '';

  // Generate Badges markup
  let badgesHTML = '';
  if (note.reminder || (note.labels && note.labels.length > 0)) {
    badgesHTML = '<div class="note-card-badges">';
    if (note.reminder) {
      badgesHTML += `
        <span class="badge reminder-badge">
          <span class="material-symbols-outlined">add_alert</span>
          <span>${note.reminder}</span>
          <span class="badge-close" data-id="${note.id}" data-type="reminder" title="Remove reminder">&times;</span>
        </span>
      `;
    }
    if (note.labels && note.labels.length > 0) {
      note.labels.forEach(lbl => {
        badgesHTML += `
          <span class="badge">
            <span>${lbl}</span>
            <span class="badge-close" data-id="${note.id}" data-type="label" data-name="${lbl}" title="Remove label">&times;</span>
          </span>
        `;
      });
    }
    badgesHTML += '</div>';
  }

  // Determine Toolbar Buttons markup based on tab
  let toolbarHTML = '';
  if (activeTab === 'trash') {
    toolbarHTML = `
      <div class="card-toolbar">
        <button class="icon-btn toolbar-restore-btn" data-id="${note.id}" title="Restore note">
          <span class="material-symbols-outlined">restore_from_trash</span>
        </button>
        <button class="icon-btn toolbar-delete-forever-btn" data-id="${note.id}" title="Delete forever">
          <span class="material-symbols-outlined">delete_forever</span>
        </button>
      </div>
    `;
  } else {
    const archiveIcon = activeTab === 'archive' ? 'unarchive' : 'archive';
    const archiveTitle = activeTab === 'archive' ? 'Unarchive' : 'Archive';
    const archiveClass = activeTab === 'archive' ? 'toolbar-unarchive-btn' : 'toolbar-archive-btn';

    toolbarHTML = `
      <div class="card-toolbar" style="position: relative;">
        <button class="icon-btn toolbar-edit-btn" data-id="${note.id}" title="Edit note">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="icon-btn toolbar-card-reminder-btn" data-id="${note.id}" title="Remind me">
          <span class="material-symbols-outlined">add_alert</span>
        </button>
        <button class="icon-btn toolbar-card-label-btn" data-id="${note.id}" title="Change labels">
          <span class="material-symbols-outlined">label</span>
        </button>
        <button class="icon-btn toolbar-color-btn" title="Background options">
          <span class="material-symbols-outlined">palette</span>
        </button>
        
        <!-- Relative Grid-level Color Picker -->
        <div class="color-palette-picker card-color-picker" id="card-color-picker-${note.id}" style="display: none;">
          <button type="button" class="color-dot default" data-color="default" title="Default" style="background-color: var(--note-bg-default);"></button>
          <button type="button" class="color-dot coral" data-color="coral" title="Coral" style="background-color: var(--note-bg-coral);"></button>
          <button type="button" class="color-dot peach" data-color="peach" title="Peach" style="background-color: var(--note-bg-peach);"></button>
          <button type="button" class="color-dot sand" data-color="sand" title="Sand" style="background-color: var(--note-bg-sand);"></button>
          <button type="button" class="color-dot mint" data-color="mint" title="Mint" style="background-color: var(--note-bg-mint);"></button>
          <button type="button" class="color-dot sage" data-color="sage" title="Sage" style="background-color: var(--note-bg-sage);"></button>
          <button type="button" class="color-dot fog" data-color="fog" title="Fog" style="background-color: var(--note-bg-fog);"></button>
          <button type="button" class="color-dot storm" data-color="storm" title="Storm" style="background-color: var(--note-bg-storm);"></button>
          <button type="button" class="color-dot dusk" data-color="dusk" title="Dusk" style="background-color: var(--note-bg-dusk);"></button>
          <button type="button" class="color-dot blossom" data-color="blossom" title="Blossom" style="background-color: var(--note-bg-blossom);"></button>
          <button type="button" class="color-dot clay" data-color="clay" title="Clay" style="background-color: var(--note-bg-clay);"></button>
        </div>

        <button class="icon-btn toolbar-card-image-btn" data-id="${note.id}" title="Add image">
          <span class="material-symbols-outlined">image</span>
        </button>
        <input type="file" class="card-image-input" data-id="${note.id}" accept="image/*" style="display: none;" />

        <button class="icon-btn ${archiveClass}" data-id="${note.id}" title="${archiveTitle}">
          <span class="material-symbols-outlined">${archiveIcon}</span>
        </button>
        <button class="icon-btn toolbar-delete-btn" data-id="${note.id}" title="Delete note">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }

  // Highlight search keywords if query exists
  const searchQuery = DOM.searchInput ? DOM.searchInput.value : '';
  const displayTitle = highlightText(note.title, searchQuery);
  const displayContent = highlightText(note.content, searchQuery);

  // 3. Insert markup inside note card using innerHTML
  card.innerHTML = `
    ${imageHTML}
    ${showPinBtn ? `
      <button class="card-pin-btn ${note.pinned ? 'active' : ''}" data-id="${note.id}" title="${note.pinned ? 'Unpin note' : 'Pin note'}">
        <span class="material-symbols-outlined">${note.pinned ? 'keep_public' : 'keep'}</span>
      </button>
    ` : ''}
    ${note.title ? `<div class="note-card-title">${displayTitle}</div>` : ''}
    <div class="note-card-text">${displayContent}</div>
    ${badgesHTML}
    ${toolbarHTML}
  `;

  // 6. Attach event listeners to dynamic elements
  
  // Badge close listener
  card.querySelectorAll(".badge-close").forEach(closeBtn => {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const noteId = Number(closeBtn.dataset.id);
      const type = closeBtn.dataset.type;
      
      if (type === 'reminder') {
        if (callbacks.onSaveNote) {
          callbacks.onSaveNote(noteId, { reminder: null });
        }
      } else if (type === 'label') {
        const labelName = closeBtn.dataset.name;
        const updatedLabels = note.labels.filter(l => l !== labelName);
        if (callbacks.onSaveNote) {
          callbacks.onSaveNote(noteId, { labels: updatedLabels });
        }
      }
    });
  });

  // Pin Button listener
  if (showPinBtn) {
    const pinBtn = card.querySelector(".card-pin-btn");
    if (pinBtn) {
      pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const noteId = Number(pinBtn.dataset.id);
        if (callbacks.onPinToggle) {
          callbacks.onPinToggle(noteId);
        }
      });
    }
  }

  // Quick Background options picker listener
  const quickColorBtn = card.querySelector(".toolbar-color-btn");
  const quickColorPicker = card.querySelector(".card-color-picker");
  if (quickColorBtn && quickColorPicker) {
    quickColorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close other pickers
      document.querySelectorAll(".card-color-picker").forEach(p => {
        if (p !== quickColorPicker) p.style.display = 'none';
      });
      quickColorPicker.style.display = quickColorPicker.style.display === 'none' ? 'flex' : 'none';
    });

    quickColorPicker.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.classList.contains("color-dot")) {
        const selColor = e.target.dataset.color;
        card.style.backgroundColor = `var(--note-bg-${selColor})`;
        quickColorPicker.style.display = 'none';
        if (callbacks.onSaveNote) {
          callbacks.onSaveNote(note.id, { color: selColor });
        }
      }
    });
  }

  // Quick Card Image upload
  const cardImageBtn = card.querySelector(".toolbar-card-image-btn");
  const cardImageInput = card.querySelector(".card-image-input");
  if (cardImageBtn && cardImageInput) {
    cardImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cardImageInput.click();
    });

    cardImageInput.addEventListener("change", (e) => {
      const file = cardImageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target.result;
          if (callbacks.onSaveNote) {
            callbacks.onSaveNote(note.id, { image: base64 });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Quick Card Label button click
  const cardLabelBtn = card.querySelector(".toolbar-card-label-btn");
  if (cardLabelBtn) {
    cardLabelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (callbacks.onCardClick) callbacks.onCardClick(note);
    });
  }

  // Quick Card Reminder button click
  const cardReminderBtn = card.querySelector(".toolbar-card-reminder-btn");
  if (cardReminderBtn) {
    cardReminderBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (callbacks.onCardClick) callbacks.onCardClick(note);
    });
  }

  if (activeTab === 'trash') {
    const restoreBtn = card.querySelector(".toolbar-restore-btn");
    restoreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const noteId = Number(restoreBtn.dataset.id);
      if (callbacks.onRestoreClick) {
        callbacks.onRestoreClick(noteId);
      }
    });

    const deleteForeverBtn = card.querySelector(".toolbar-delete-forever-btn");
    deleteForeverBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const noteId = Number(deleteForeverBtn.dataset.id);
      if (callbacks.onDeleteForeverClick) {
        if (confirm("Are you sure you want to delete this note permanently?")) {
          callbacks.onDeleteForeverClick(noteId);
        }
      }
    });
  } else {
    const editBtn = card.querySelector(".toolbar-edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (callbacks.onCardClick) callbacks.onCardClick(note);
    });

    const deleteBtn = card.querySelector(".toolbar-delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const noteId = Number(deleteBtn.dataset.id);
      if (callbacks.onDeleteClick) {
        callbacks.onDeleteClick(noteId);
      }
    });

    if (activeTab === 'archive') {
      const unarchiveBtn = card.querySelector(".toolbar-unarchive-btn");
      unarchiveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const noteId = Number(unarchiveBtn.dataset.id);
        if (callbacks.onUnarchiveClick) {
          callbacks.onUnarchiveClick(noteId);
        }
      });
    } else {
      const archiveBtn = card.querySelector(".toolbar-archive-btn");
      archiveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const noteId = Number(archiveBtn.dataset.id);
        if (callbacks.onArchiveClick) {
          callbacks.onArchiveClick(noteId);
        }
      });
    }
  }

  return card;
}

export function openLabelsModal(labels, labelCallbacks = {}) {
  DOM.labelsModal.style.display = 'flex';
  renderLabelsList(labels, labelCallbacks);
}

export function renderLabelsList(labels, labelCallbacks = {}) {
  DOM.labelsListContainer.innerHTML = '';
  
  labels.forEach(label => {
    const item = document.createElement('div');
    item.className = 'label-item';
    item.innerHTML = `
      <button class="icon-btn delete-label-btn" title="Delete label">
        <span class="material-symbols-outlined">delete</span>
      </button>
      <input type="text" value="${label}" autocomplete="off" />
      <button class="icon-btn save-label-btn" title="Rename label" style="display: none;">
        <span class="material-symbols-outlined">check</span>
      </button>
    `;

    const input = item.querySelector('input');
    const deleteBtn = item.querySelector('.delete-label-btn');
    const saveBtn = item.querySelector('.save-label-btn');

    input.addEventListener('input', () => {
      saveBtn.style.display = 'block';
    });

    saveBtn.addEventListener('click', () => {
      const newName = input.value.trim();
      if (newName && newName !== label && labelCallbacks.onRenameLabel) {
        labelCallbacks.onRenameLabel(label, newName);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    });

    deleteBtn.addEventListener('click', () => {
      if (labelCallbacks.onDeleteLabel) {
        labelCallbacks.onDeleteLabel(label);
      }
    });

    DOM.labelsListContainer.appendChild(item);
  });
}

/* Toast System Controller */
export function showToast(message, actionText = null, onActionClick = null) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  toast.innerHTML = `
    <span class="toast-text">${message}</span>
    ${actionText ? `<button class="toast-action">${actionText}</button>` : ''}
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  const progressBar = toast.querySelector('.toast-progress');
  const duration = 4000; // 4 seconds
  
  // Trigger entry animation progress bar
  progressBar.style.transition = `transform ${duration}ms linear`;
  progressBar.getBoundingClientRect(); // force reflow
  progressBar.style.transform = 'scaleX(0)';

  const timer = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  if (actionText && onActionClick) {
    const actionBtn = toast.querySelector('.toast-action');
    actionBtn.addEventListener('click', () => {
      clearTimeout(timer);
      onActionClick();
      dismissToast(toast);
    });
  }
}

function dismissToast(toast) {
  toast.style.transition = 'opacity 0.2s, transform 0.2s';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px)';
  setTimeout(() => {
    toast.remove();
  }, 200);
}

/* Settings Settings Manager */
export function initSettings() {
  const settings = loadSettings() || { font: 'Outfit', density: 'comfortable' };
  applySettings(settings);

  if (DOM.settingsFont) DOM.settingsFont.value = settings.font;
  if (DOM.settingsDensity) DOM.settingsDensity.value = settings.density;

  // Toggle modal
  if (DOM.settingsBtn && DOM.settingsModal) {
    DOM.settingsBtn.onclick = () => {
      DOM.settingsModal.style.display = 'flex';
    };
  }

  if (DOM.settingsModalCloseBtn) {
    DOM.settingsModalCloseBtn.onclick = () => {
      DOM.settingsModal.style.display = 'none';
    };
  }

  if (DOM.settingsModal) {
    DOM.settingsModal.onclick = (e) => {
      if (e.target === DOM.settingsModal) {
        DOM.settingsModal.style.display = 'none';
      }
    };
  }

  // Listeners
  if (DOM.settingsFont) {
    DOM.settingsFont.onchange = (e) => {
      settings.font = e.target.value;
      saveSettings(settings);
      applySettings(settings);
    };
  }

  if (DOM.settingsDensity) {
    DOM.settingsDensity.onchange = (e) => {
      settings.density = e.target.value;
      saveSettings(settings);
      applySettings(settings);
    };
  }

  if (DOM.settingsResetBtn) {
    DOM.settingsResetBtn.onclick = () => {
      if (confirm('Are you sure you want to delete all notes and labels? This will completely clear all local storage.')) {
        localStorage.clear();
        showToast('All storage data reset successfully. Reloading...', 'Reload Now', () => {
          window.location.reload();
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };
  }
}

function applySettings(settings) {
  document.body.classList.remove('font-outfit', 'font-poppins', 'font-inter', 'font-roboto', 'font-system-ui');
  if (settings.font === 'Outfit') document.body.classList.add('font-outfit');
  else if (settings.font === 'Poppins') document.body.classList.add('font-poppins');
  else if (settings.font === 'Inter') document.body.classList.add('font-inter');
  else if (settings.font === 'Roboto') document.body.classList.add('font-roboto');
  else if (settings.font === 'system-ui') document.body.classList.add('font-system-ui');

  document.body.classList.remove('density-comfortable', 'density-compact');
  if (settings.density === 'comfortable') document.body.classList.add('density-comfortable');
  else if (settings.density === 'compact') document.body.classList.add('density-compact');
}
