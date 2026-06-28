// Google Keep Clone - Entry Point

// Import stylesheet
import './css/style.css';

// Import application orchestrator
import { initApp } from './js/app.js';

// Launch application on DOM content load
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
