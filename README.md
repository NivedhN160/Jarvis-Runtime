# Jarvis-Runtime - MAT-CHA.AI Project Root

This is the root directory for the MAT-CHA.AI project.

## 📂 Project Structure

- **`Frontend/`**: Contains the core application modules.
  - **`apps/frontend/`**: The React.js frontend application.
  - **`backend/`**: The FastAPI backend server and database logic.
- **`main.py`**: Original prototype/script for AI logic.

## 🚀 Latest Updates

- **Optimistic Real-Time Chat**: Messages now appear instantly with zero lag.
- **Auto-Sync Status**: The "Confirm Deal" status now syncs between parties in real-time without refreshing.
- **AWS Amplify Hosting**: Fully configured for subfolder builds and SPA routing.
- **Backend Health Check**: New `/api/health` endpoint for debugging cluster connections.
- **New Deployment Pipeline**: AWS Amplify (Frontend) + Render (Backend) + MongoDB Atlas.

## 📖 Documentation

For detailed technical and architectural information:

👉 **[REQUIREMENTS.md](./REQUIREMENTS.md)** — *Functional & Technical Specs*  
👉 **[DESIGN.md](./DESIGN.md)** — *Architecture & Data Schema*  
👉 **[Frontend/README.md](./Frontend/README.md)** — *App Features & Setup*  
👉 **[AMPLIFY_GUIDE.md](./AMPLIFY_GUIDE.md)** — *Primary Hosting Guide*  
👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)** — *Technical Architecture Overview*

---

## ⚡ Quick Start

1. Start MongoDB Service.
2. Run Backend: `cd Frontend/backend && uvicorn server:app --reload`
3. Run Frontend: `cd Frontend/apps/frontend && npm start`
