# PixelPure — Premium DSLR RAW Image Converter

**PixelPure** is an award-winning, designer-grade web application tailored for professional photographers, creative agencies, and content studios. It enables batch conversion of large DSLR and mirrorless camera RAW files (such as Canon `.CR2`/`.CR3`, Nikon `.NEF`, Sony `.ARW`, Fujifilm `.RAF`, and Adobe `.DNG`) directly inside the local browser sandbox.

## 🚀 Key Features

1. **Dual Experiences**:
   - **Experience 01 — Marketing Homepage**: High-conversion SaaS landing page featuring a file selection dropzone and floating conversion motion graphics.
   - **Experience 02 — Workstation Dashboard**: A desktop-grade creative workspace modeled on industry tools like Adobe Lightroom and Figma.
2. **Object-Oriented UI (OOUI)**: Every uploaded photo is treated as an active workspace object with metadata inspector bindings, selection states, custom checkboxes, and dynamic status dots.
3. **Local WebAssembly Pipeline**: Processing executes entirely client-side. Images are loaded and rendered locally; no camera data is ever uploaded to a remote server.
4. **Adaptive Dark & Light Theme**: Built-in visual mode toggling persistable via browser storage.
5. **Simulated Batch conversion**: Fully animated step-by-step queues featuring success/failure rates, quality ratios, progress updates, and a functioning ZIP compiler.

---

## 📂 File Architecture

- **`index.html`**: The marketing landing experience containing hero graphics, features list, camera brands cards, FAQ accordion, and footer.
- **`dashboard.html`**: The photo worklist workspace containing file grids, toolbars, and the sticky sidebar conversion controls panel.
- **`style.css`**: Design tokens, variables, responsive styling, and custom animations.
- **`script.js`**: Core state managers, drag-and-drop triggers, dynamic render templates, and local storage transfers.

---

## 🎨 Color Palette Design System

### Dark Mode (Default)
- **Deep Background**: `#1B1E24`
- **Surface Panels**: `#22262F`
- **Primary Accent Green**: `#06BF92`
- **Slate Gray**: `#575B6A`
- **Coral Accent**: `#FD5B45`
- **Blue Details**: `#066AFA`

### Light Mode
- **Clean Background**: `#F7F9FC`
- **Surface Panels**: `#FFFFFF`
- **Borders & Dividers**: `#E4E8EF`
- **Primary Text**: `#1B1E24`

---

## ⚙️ Running Locally

Since the application uses `localStorage` to pass selected RAW files from the landing page to the dashboard and loads modular styling, it should be served via a local web server to prevent browser CORS blockages:

### Option A: Using node/npx (Recommended)
Navigate to the project root and run:
```bash
npx serve -l 3000
```
Then, open [http://localhost:3000](http://localhost:3000) in your web browser.

### Option B: Python SimpleHTTPServer
If you have Python installed, run:
```bash
# For Python 3
python -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000).
