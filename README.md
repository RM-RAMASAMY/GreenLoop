# 🌿 GreenLoop

**A gamified sustainability platform that turns everyday eco-friendly actions into a rewarding, data-driven experience.**

GreenLoop unifies offline environmental care (planting, composting, green commutes) and online purchasing decisions into a single gamified ecosystem — powered by AI, real-time data visualization, and a unified XP progression system.

> Built at **SF Hacks** · React · Node.js · MongoDB · Google Gemini AI · ElevenLabs · Actian Vector DB

---

## 📸 Overview

GreenLoop is a three-part system:

| Layer | Technology | Description |
|---|---|---|
| **Web Dashboard** | React 19, Vite, Tailwind CSS, Recharts | Full-featured SPA for tracking impact, logging activities, viewing maps, and chatting with an AI sustainability coach |
| **Backend API** | Node.js, Express 5, Mongoose, Passport | RESTful API with Google OAuth, JWT auth, Gemini AI integration, ElevenLabs TTS, and RAG-powered vector search |
| **Browser Extension** | Chrome Manifest V3 | Detects products on Amazon/Walmart and suggests AI-powered eco-friendly alternatives in real time |

---

## ✨ Features

### 🏠 Dashboard (`/`)
- **Weekly XP Activity Chart** — Recharts-powered bar chart showing XP earned per day over the past week
- **Activity Distribution** — Pie chart breaking down actions by type (Plant, Walk, Compost, etc.)
- **Live Stats** — Total XP, level, streak count, CO₂ saved, and plastic reduced
- **Level Progression** — Seed → Seedling → Sapling → Tree → Forest (XP-based)

### 📷 Log Activity (`/camera`)
- **6 Activity Types** — Plant a Tree (50 XP), Green Commute (30 XP), Recycle (10 XP), Save Water (15 XP), Use Reusable (10 XP), Save Energy (20 XP)
- **Plant-Specific Fields** — Species name, plant category (tree/flower/bush/fern), and location title
- **GPS Location** — Auto-detect via browser geolocation or manual entry
- **Photo Upload** — Attach proof-of-action photos
- **Form Validation** — Description is mandatory; plant activities require species name and location title
- **Activity History** — View and delete recent logged actions with real-time XP updates

### 🔄 Eco Swap Tracker (`/eco-swap`)
- **Swap History** — Track product swaps with eco-score comparisons (before vs. after)
- **Category Filtering** — Hydration, Personal Care, Kitchen, Shopping
- **Impact Metrics** — CO₂ saved (kg) and plastic reduced (g) per swap

### 🗣️ The Green Man — AI Voice Assistant (`/greenman`)
- **Gemini 2.5 Flash** — Context-aware AI that knows your XP, recent actions, swaps, and level
- **ElevenLabs TTS** — Natural voice responses with real-time audio playback
- **RAG Pipeline** — Actian VectorAI DB stores action embeddings for semantic memory retrieval
- **Speech-to-Text** — Browser-native voice input with live waveform visualizer
- **Fallback** — Graceful degradation to browser TTS if ElevenLabs is unavailable

### 🗺️ Global Plant Map (`/map`)
- **Leaflet/MapLibre** — Interactive map showing all community-planted trees and plants
- **Live Pins** — Each pin shows planter name, species, location title, and timestamp
- **Community Data** — All users' plants aggregated on a single global map

### 📰 Eco News Feed (`/news`)
- Curated sustainability news and tips

### 🏆 Leaderboard (`/leaderboard`)
- **Top 20 Users** — Ranked by total XP
- **Public Profiles** — Avatar, name, level, and XP displayed

### 👤 Profile (`/profile`)
- **Achievements** — First Step, Streak Master, and more milestone badges
- **Recent Activity Feed** — Latest actions with timestamps
- **Stats Summary** — Total XP, level, and account age

### ⚙️ Settings (`/settings`)
- **Notification Preferences** — Push, email, weekly digest, swap alerts, leaderboard updates
- **Display** — Dark mode, compact mode
- **Privacy** — Public profile toggle, leaderboard visibility, activity sharing, location services
- **Extension** — Auto-detect products, swap popup behavior

### 🧩 Chrome Extension
- **Manifest V3** with service worker architecture
- **Amazon & Walmart** — Auto-detects product pages via content scripts
- **AI-Powered Swaps** — Queries Gemini to suggest a specific sustainable alternative with eco-score
- **Google OAuth** — Seamless sign-in via the backend's extension auth flow
- **Popup Dashboard** — Quick-access XP stats and recent swaps

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  Dashboard │ Log Activity │ Map │ Green Man │ Eco Swap   │
│  Leaderboard │ Profile │ Settings │ News │ Login         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (localhost:5173 → :3001)
┌──────────────────────▼──────────────────────────────────┐
│               Backend (Express.js + Mongoose)            │
│  Google OAuth │ JWT Auth │ REST API (15+ routes)         │
│  Gemini AI Chat │ ElevenLabs TTS │ Product Search AI     │
│            ┌─────────┴──────────┐                        │
│            ▼                    ▼                         │
│    MongoDB Atlas         Python Vector Bridge             │
│   (Users, Actions,       (vector_bridge.py)              │
│    Swaps)                       │                        │
│                          Actian VectorAI DB              │
│                          (Docker :50051)                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              Chrome Extension (Manifest V3)               │
│  Content Scripts (Amazon/Walmart) → Backend API           │
│  Popup Dashboard │ Google OAuth (Extension Flow)          │
└──────────────────────────────────────────────────────────┘
```

---

## 🧩 Data Models

### User
| Field | Type | Description |
|---|---|---|
| `googleId` | String | Google OAuth ID (sparse unique) |
| `name` | String | Display name |
| `email` | String | Unique email |
| `totalXP` | Number | Cumulative experience points |
| `level` | String | Seed / Seedling / Sapling / Tree / Forest |
| `streak` | Number | Consecutive active days |
| `settings` | Object | Notification, display, and privacy preferences |

### Action
| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to User |
| `actionType` | Enum | PLANT, SWAP, WALK, REFILL, COMPOST, CLEANUP, OBSERVE, OTHER |
| `details` | Object | `plantName`, `plantType`, `title`, `description`, `imageUrl` |
| `xpGained` | Number | XP awarded for this action |
| `location` | Object | `{ lat, lng }` for map pins |

### Swap
| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to User |
| `original` | String | Original product name |
| `swap` | String | Sustainable alternative name |
| `category` | Enum | Hydration, Personal Care, Kitchen, Shopping, Other |
| `ecoScoreBefore` / `After` | Number | Eco-score comparison (0–100) |
| `co2Saved` | Number | kg of CO₂ saved |
| `plasticSaved` | Number | grams of plastic reduced |

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | OAuth callback (redirects to frontend or extension) |
| `POST` | `/auth/demo-login` | Demo login (dev mode, seeds sample data for new users) |

### User
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/user/me` | ✅ | Get current user profile |
| `GET` | `/api/user/me/stats` | ✅ | Dashboard stats (XP, streak, charts, impact data) |
| `GET` | `/api/user/me/settings` | ✅ | Get user settings |
| `PUT` | `/api/user/me/settings` | ✅ | Update user settings |

### Actions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/action` | ✅ | Log a new eco action |
| `GET` | `/api/actions` | ✅ | Get recent actions (`?limit=N`) |
| `DELETE` | `/api/actions/:id` | ✅ | Delete action and subtract XP |

### Swaps & Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/swaps` | ✅ | Get user's swap history |
| `POST` | `/api/swaps` | ✅ | Log a product swap |
| `GET` | `/api/products/search` | ❌ | AI-powered sustainable alternative search (`?q=product`) |

### Community
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/leaderboard` | ❌ | Top 20 users by XP |
| `GET` | `/api/plants` | ❌ | All plant pins for the global map |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | ✅ | Send message to Green Man AI (returns text + audio) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ (for vector bridge, optional)
- **Docker** (for VectorAI DB, optional)
- **MongoDB Atlas** account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/GreenLoop.git
cd GreenLoop
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/greenloop

# Google OAuth 2.0 (console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT
JWT_SECRET=your-random-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# AI Services
GEMINI_API_KEY=your-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=your-voice-id
```

Start the server:
```bash
npm start
```
> Backend runs on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Dashboard runs on `http://localhost:5173`

### 4. Chrome Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder

### 5. VectorAI DB (Optional — for RAG memory)
```bash
docker compose up -d vectoraidb
```
> Runs on port `50051`. Install the Python client: `pip install -r backend/requirements.txt`

---

## 📁 Project Structure

```
GreenLoop/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (XP, levels, settings)
│   │   ├── Action.js         # Activity log schema (plants, walks, etc.)
│   │   └── Swap.js           # Product swap schema
│   ├── server.js             # Express server (routes, auth, AI integrations)
│   ├── vector_bridge.py      # Python bridge for Actian VectorAI DB
│   ├── requirements.txt      # Python dependencies
│   ├── package.json          # Node.js dependencies
│   └── .env                  # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Dashboard with charts and stats
│   │   │   ├── CameraPage.jsx      # Log Activity form
│   │   │   ├── EcoSwapPage.jsx     # Swap tracker
│   │   │   ├── GreenManPage.jsx    # AI voice assistant
│   │   │   ├── MapPage.jsx         # Global plant map (Leaflet)
│   │   │   ├── NewsPage.jsx        # Eco news feed
│   │   │   ├── LeaderboardPage.jsx # XP leaderboard
│   │   │   ├── ProfilePage.jsx     # User profile & achievements
│   │   │   ├── SettingsPage.jsx    # App settings
│   │   │   ├── NurseriesPage.jsx   # Nearby nurseries
│   │   │   └── LoginPage.jsx       # Auth page
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable UI primitives (Card, Button, Badge)
│   │   │   └── VoiceVisualizer.jsx # Audio waveform component
│   │   ├── App.jsx                 # Root component with routing & nav
│   │   └── main.jsx               # Entry point
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── extension/
│   ├── manifest.json         # Chrome Manifest V3 config
│   ├── background.js         # Service worker
│   ├── content.js            # Amazon/Walmart content script
│   ├── content_styles.css    # Injected overlay styles
│   ├── popup.html            # Extension popup UI
│   ├── popup.js              # Popup logic
│   └── auth-capture.js       # OAuth token capture script
├── docker-compose.yml        # VectorAI DB container
├── GreenLoop_FRD.md          # Functional Requirements Document
└── README.md
```

---

## 🔑 XP & Leveling System

| Action | XP |
|---|---|
| Plant a Tree | +50 |
| Cleanup | +40 |
| Green Commute | +30 |
| Save Energy | +20 |
| Save Water | +15 |
| Observe | +15 |
| Recycle | +10 |
| Product Swap | +100 |

| Level | XP Required |
|---|---|
| 🌱 Seed | 0 |
| 🌿 Seedling | 100 |
| 🌳 Sapling | 500 |
| 🌲 Tree | 2,000 |
| 🏔️ Forest | 5,000 |

---

## 🤖 AI Integrations

| Service | Purpose | Model |
|---|---|---|
| **Google Gemini** | Green Man chat, product swap suggestions | `gemini-2.5-flash`, `gemini-flash-lite-latest` |
| **Google Embeddings** | Vector embeddings for RAG memory | `text-embedding-004` |
| **ElevenLabs** | Text-to-speech for AI voice responses | `eleven_flash_v2_5` |
| **Actian VectorAI** | Semantic search over user action history | gRPC via Python bridge |

---

## 📄 License

MIT

---

<p align="center">
  Built with 💚 for the planet at <strong>SF Hacks</strong>
</p>
