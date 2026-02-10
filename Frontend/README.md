# MAT-CHA.AI - AI-Powered Creator & Startup Collaboration Platform

MAT-CHA.AI is a modern web application designed to bridge the gap between startups and content creators. It features a sleek, themeable interface, robust authentication, and AI-driven content generation and matching.

---

## 🚀 Getting Started

To run the application, you need to start both the **Backend** and the **Frontend** servers.

### 📋 Prerequisites
*   **Node.js & npm**: Installed on your system.
*   **Python 3.10+**: For the backend server.
*   **MongoDB**: Ensure MongoDB Community Server is installed and the service is running on `localhost:27017`.
    *   *Tip:* Use **MongoDB Compass** to visually manage your data.

---

## 🛠️ Installation & Setup

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd Frontend/backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the server:
   ```powershell
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup
1. Open a **new** terminal and navigate to the frontend directory:
   ```powershell
   cd Frontend/apps/frontend
   ```
2. Install dependencies:
   ```powershell
   npm install --legacy-peer-deps
   ```
3. Start the application:
   ```powershell
   npm start
   ```
   *The app will automatically open at `http://localhost:3000`.*

---

## ✨ Key Features

### 👤 Role-Based Authentication
*   **Startups**: Create collaboration requests, manage campaigns, and find creators.
*   **Creators**: Build a professional profile, showcase portfolios, and discover opportunities.
*   **Secure**: All passwords are encrypted using `bcrypt`.

### 🤖 AI Capabilities
*   **AI Description Generator**: Instantly generate professional campaign descriptions in the "New Collaboration" modal.
*   **Smart Matchmaking**: Uses LLMs and Vector Search (ChromaDB) to predict high-success partnerships based on brand alignment.

### 🌓 Premium Theming System
*   **Light Mode**: Clean and professional.
*   **Dark Mode**: Sleek and modern.
*   **Reader Mode**: Warm tones designed for long periods of focus and eye comfort.

---

## 🔧 Troubleshooting

### MongoDB "Connection Refused"
If the app shows a "Database Offline" badge:
1. Press `Win + R`, type `services.msc`, and hit Enter.
2. Find **MongoDB Server** in the list.
3. Right-click and select **Start**.

### Authentication "Network Error"
*   Ensure the backend is running at `http://localhost:8000`.
*   Check the `/api/health` endpoint in your browser to verify the connection status.
