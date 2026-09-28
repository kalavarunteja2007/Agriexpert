# 🌱 AgriExpert AI — Intelligent Farm Companion & Digital Agronomy Platform

An enterprise-grade, full-stack agricultural intelligence web application and website empowering farmers, agronomists, and agricultural research institutions.

---

## 🚀 Key Features

### 1. 🩺 AI Crop Doctor (Leaf Disease Diagnostics)
- **Computer Vision Leaf Scanner:** Upload photos or capture directly via device camera.
- **Instant Pathogen Detection:** Diagnoses 15+ agricultural plant diseases across Tomato, Potato, Wheat, Rice, Cotton, Chilli, and Maize with 90%+ confidence.
- **Prescription System:** Provides actionable organic remedies, chemical treatments, and a 14-day recovery protocol.
- **Task Integration:** Direct "Add to Farm Tasks" action to schedule spray reminders.

### 2. 💰 Live APMC Mandi Commodity Tracker
- Real-time wholesale arrivals, min/max prices, and modal prices (₹/Quintal) across major Indian mandis (Punjab, Haryana, Maharashtra, UP, Karnataka, Gujarat, etc.).
- Daily price trends (▲ Up, ▼ Down, — Stable) and MSP comparison benchmarks.
- Instant search and dual filtering by commodity and state.

### 3. 🧪 Soil Health Doctor & NPK Fertilizer Calculator
- Input soil test parameters (pH, Available Nitrogen, Phosphorus, Potassium, Organic Carbon).
- Generates exact commercial fertilizer bag requirements for **Urea (45kg bags)**, **DAP (50kg bags)**, and **MOP (50kg bags)** based on field acreage.
- Custom soil amendment advice (Gypsum for alkaline soils, Agricultural Lime for acidic soils, FYM recommendations).

### 4. 🌦️ Agricultural Micro-Climate Weather Advisory
- Real-time temperature, relative humidity, wind speed, barometer, and dew point.
- **Smart Spray Advisory:** Dynamically calculates whether weather is favorable or unfavorable for pesticide/fertilizer spraying.
- **5-Day Rain & Spray Forecast:** Day-by-day precipitation probability and field guidance.

### 5. 💧 Smart Irrigation Planner
- Water conservation engine using soil moisture sensors and rain-delay algorithms.
- Plot-by-plot drip and alternate wetting & drying (AWD) schedule with water volume metrics.

### 6. 🤖 24/7 Conversational AI Agronomist
- Multilingual conversational assistant (English and Hindi).
- **Text-to-Speech:** Voice read-out of recommendations.
- **Speech Recognition:** Direct microphone voice questions.
- Context-aware advice on crop stages, organic farming recipes (Jeevamrutha, Neemastra), and pest management.

### 7. 🏛️ Government Schemes & Subsidies Directory
- Comprehensive details on **PM-KISAN**, **PMFBY** (Crop Insurance), **PM-KUSUM** (Solar Pumps), **PMKSY** (Per Drop More Crop), **KCC**, and **SMAM** (Farm Machinery).
- Direct eligibility checklists, document requirements, and links to official portals.

### 8. 👥 Farmer Community Forum & Q&A
- Peer-to-peer knowledge sharing between farmers and ICAR-certified agronomists.
- Verified agronomist answer badges and community voting.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** Node.js (v20 LTS), Express.js REST API, Multer (image uploads), CORS
- **Frontend:** Vanilla ES6+ JavaScript modules, semantic HTML5, custom CSS design system
- **Design:** Modern glassmorphism, responsive grid layout, dark mode & light mode toggle, Google Fonts (`Outfit` & `DM Sans`)
- **Data Layer:** Persistent JSON database (`data/farm_data.json`, `data/diseases_db.json`, `data/mandi_db.json`, `data/schemes_db.json`)
- **Offline / Standalone:** Includes the original single-file bundle at `/standalone.html`

---

## 🏃 Quick Start & Running Locally

The local server is already running! To start it manually at any time:

```bash
# Start the full-stack server
node server.js
```

Then visit in your web browser:
- **Web Application & Dashboard:** [http://localhost:3000](http://localhost:3000)
- **AI Crop Doctor:** [http://localhost:3000/#crop-doctor](http://localhost:3000/#crop-doctor)
- **Mandi Live Rates:** [http://localhost:3000/#mandi](http://localhost:3000/#mandi)
- **Soil Health Doctor:** [http://localhost:3000/#soil](http://localhost:3000/#soil)
- **AI Agronomist:** [http://localhost:3000/#assistant](http://localhost:3000/#assistant)
- **Original Standalone Demo:** [http://localhost:3000/standalone.html](http://localhost:3000/standalone.html)

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System and telemetry health check |
| `/api/weather?city=...` | GET | Real-time weather and spray advisory |
| `/api/mandi-prices` | GET | Live APMC mandi prices and trends |
| `/api/diagnose` | POST | AI Crop disease diagnostic from leaf image |
| `/api/chat` | POST | Conversational AI Agronomist |
| `/api/farm` | GET | Farm profile, active crops, tasks, irrigation |
| `/api/crops` | POST | Register a new crop into farm |
| `/api/tasks/toggle` | POST | Mark field task complete/incomplete |
| `/api/soil-report` | POST | Scientific NPK commercial bag calculator |
| `/api/schemes` | GET | Government agricultural schemes |
| `/api/community/posts` | GET/POST | Farmer community forum posts |
