# GreenLoop 🌿

GreenLoop is a gamified sustainability platform that encourages eco-friendly actions through a web dashboard and browser extension.

## Project Structure

- **`backend/`**: Express.js server handling user data, XP logic, and leaderboards.
- **`frontend/`**: React + Vite Web Dashboard for tracking progress, viewing maps, and logging actions.
- **`extension/`**: Chrome Extension for sustainable shopping alternatives.

## How to Run

### 1. Backend (Required)
```bash
cd backend
npm start
```
*Runs on `http://localhost:3001`*

### 2. Web Dashboard
```bash
cd frontend
npm run dev
```
*Runs on `http://localhost:5173`*

### 3. Chrome Extension
1. Open Chrome and go to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `extension/` folder.

## Features
- **Dashboard**: Visualize your environmental impact (CO2 saved, trees planted).
- **Leaderboards**: Compete with neighbors, classmates, and colleagues.
- **Action Log**: Upload photos of sustainable actions to earn XP.
- **Smart Shop**: Get eco-friendly product recommendations while browsing (via Extension).
