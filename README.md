# KITA_HACK: Smart Waste Management System

KITA_HACK is an AI-powered waste management solution designed to improve recycling rates and reduce contamination in waste streams. It uses the **Google Cloud Vision API** to identify waste types and verify if they are being disposed of in the correct bins.

This project aligns with **SDG 12.5**: Substantially reduce waste generation through prevention, reduction, recycling and reuse.

---

## 🚀 Project Overview

The application consists of two main parts:
- **Frontend**: A modern React application built with Vite and Tailwind CSS 4, featuring a real-time camera scanner with a "Smart Vision" HUD.
- **Backend**: A Node.js/Express API that integrates with Google Cloud Vision AI to perform image analysis and waste classification.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router 7.
- **Backend**: Node.js, Express, Google Cloud Vision SDK.
- **AI/ML**: Google Cloud Vision API (Label Detection, Color Detection, OCR).

---

## 📋 Prerequisites

Before you begin, ensure you have the following:
1. **Node.js** (v18 or higher recommended).
2. **NPM** (comes with Node.js).
3. **Google Cloud Account**:
   - Enable the **Cloud Vision API**.
   - Create a **Service Account** and download the JSON key file.
   - Place this JSON key inside the `backend/` directory as `service-account-key.json`.

---

## ⚙️ Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd KITA_HACK-2026-FEB
```

### 2. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=3000
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
NODE_ENV=development
```

### 3. Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:3000
```

---

## 🏃 Running the Application

To run the full application, you need to start both the backend and frontend servers.

### Start the Backend
In the `backend/` directory:
```bash
npm run dev
```
- The API will be available at: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

### Start the Frontend
In the `frontend/` directory:
```bash
npm run dev
```
- The application will be available at: `http://localhost:5173`

---

## 📸 How to Use

1. **Launch the Scanner**: From the Dashboard, click "Launch Scanner".
2. **Waste Classification**: Point your camera at an item and click the "Capture" button. The AI will identify the material (Plastic, Metal, Glass, etc.).
3. **Bin Verification**: Switch to "Bin" mode and scan a local recycling bin. The system will tell you if your item belongs in that specific bin.
4. **Follow Guidance**: Use the instant feedback to dispose of your waste correctly!

---

## 📂 Project Structure

```text
KITA_HACK-2026-FEB/
├── backend/                # Express API
│   ├── src/
│   │   ├── config/         # App configuration & bin rules
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Vision AI integration
│   │   └── server.js       # Entry point
│   └── service-account-key.json  # (Required) Google Cloud credentials
└── frontend/               # React Application
    ├── src/
    │   ├── components/     # UI Components (Scanner, Layout)
    │   ├── pages/          # View Pages (Dashboard, ScannerPage)
    │   └── config/         # API & Constants
    └── index.css           # Tailwind 4 styles
```
