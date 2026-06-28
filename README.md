# 💡 Google Keep Clone

A premium, pixel-perfect, and fully responsive clone of **Google Keep** built with modern frontend tools. Featuring a highly modular architecture, a stunning glassmorphic design system, support for multiple themes (light and dark mode), and persistent local storage.

---

## ✨ Features

- **📂 Modular MVC Architecture**: Highly organized vanilla ES modules separating state controller, rendering engine, and local storage operations.
- **🎨 Glassmorphic Design System**: Uses customized HSL pastels, variable blur filters, and smooth interactive transitions.
- **🌓 Adaptive Themes**: Toggle between a crisp Slate/Amber light mode and a deep Midnight/Gold dark mode instantly.
- **📌 Interactive Note Actions**:
  - Pin and unpin notes to prioritize layout ordering.
  - Apply custom pastel background colors (10+ distinct curated colors).
  - Attach images, set custom reminders, and tag notes with custom labels.
  - Archive, trash, restore, or delete notes permanently.
- **🔍 Real-Time Search**: Instant filtering of notes by title or content.
- **🗂️ Views & Sidebar Navigation**:
  - Toggle between **Grid View** (dynamic columns) and **List View** layouts.
  - Sidebar sections for *Notes*, *Reminders*, *Archive*, *Trash*, and *Edit Labels*.
- **💾 Local Storage Persistence**: Saves notes and custom labels on the client side so no data is lost upon refresh.

---

## 📁 Repository Structure

```text
Google keep project/
├── public/
│   ├── favicon.svg             # Application tab icon
│   └── icons.svg               # SVG icons sheet
├── src/
│   ├── assets/                 # SVGs and images (vite.svg, etc.)
│   ├── css/
│   │   └── style.css           # Core stylesheet (Tailwind-like tokens, dark theme)
│   ├── js/
│   │   ├── app.js              # Application state and controller logic
│   │   ├── notes.js            # Note CRUD helper functions and logic
│   │   ├── storage.js          # LocalStorage data persistence layer
│   │   └── ui.js               # UI events, listeners, and DOM rendering
│   └── main.js                 # App entry point (Vite launcher)
├── index.html                  # Main HTML template file
├── package.json                # Project configurations & dependencies
├── package-lock.json           # Exact dependency tree lockfile
└── README.md                   # Project documentation
```

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5, Vanilla ES6 JavaScript (ES Modules)
- **Styling**: Pure CSS3 with custom variables for themes, glassmorphism, and smooth layouts
- **Development Tooling**: [Vite](https://vite.dev/) for extremely fast hot module replacement (HMR) and optimized build outputs

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bunnyvalluri/Google-Keep-website-.git
   cd Google-Keep-website-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` to see it in action.

### Production Build

To compile and bundle the project for production deployment:
```bash
npm run build
```
The output files will be compiled into the `dist/` directory, ready to be hosted.

---

## 💅 Design Tokens & Styles

The application relies on customized CSS variables defined in [style.css](file:///c:/Users/vallu/OneDrive/Desktop/mywebside/Google%20keep%20project/src/css/style.css):

- **Typography**: Uses `Outfit` for primary headings and UI text, and `Inter` for content fields to ensure high readability.
- **Note Pastel Tones**: Selected carefully using HSL color models (e.g. `--note-bg-mint: hsl(142, 70%, 97%)`) to blend nicely in both light and dark backgrounds.
- **Glassmorphism**: Leverages backdrop-filter blur (`12px`) and subtle translucent borders (`rgba(255, 255, 255, 0.4)`) to create depth.