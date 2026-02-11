# Jarvis-Runtime - MAT-CHA.AI Project Root

This is the root directory for the MAT-CHA.AI project.

## 📂 Project Structure

- **`Frontend/`**: Contains the core application modules.
  - **`apps/frontend/`**: The React.js frontend application.
  - **`backend/`**: The FastAPI backend server and database logic.
- **`main.py`**: Original prototype/script for AI logic.

## 🚀 Latest Updates

- **Shared Messaging Hub**: Real-time chat system for startups and creators to interact.
- **Mutual Deal Confirmation**: Secure mechanism for both parties to finalize collaborations.
- **Improved Dashboards**: Fully integrated "Messages" tab in both Startup and Creator views.
- **Robust Field Metadata**: Matches now track collab titles and names for better historical reference.

## 📖 Documentation

For detailed instructions on how to install, configure, and run the application, please refer to the main documentation here:

👉 **[Frontend/README.md](./Frontend/README.md)**

---

## ⚡ Quick Start

1. Start MongoDB Service.
2. Run Backend: `cd Frontend/backend && uvicorn server:app --reload`
3. Run Frontend: `cd Frontend/apps/frontend && npm start`
