# MAT-CHA.AI - Intelligent Collaboration Platform

An AI-powered matchmaking platform connecting startups with content creators for impactful social media campaigns.

## 🌟 Key Features

1.  **AI Matchmaking (Match Score)**: Intelligent algorithm using **Vector Search** (ChromaDB) to match startups with creators. Provides a 0-100 score and qualitative analysis explaining *why* a pair is compatible.
2.  **AI Writer & Script Assistant**: Built-in "Writer Mode" helping founders create scripts, captions, and descriptions instantly using Llama-3.
3.  **Real-Time Chat Hub**: Semi-persistent messaging with **Optimistic UI** (instant feedback) and local state syncing.
4.  **48h Ephemeral Messaging**: Messages automatically expire after 48 hours, ensuring a high-performance, secure communication environment.
5.  **Mutual Deal Confirmation**: A formal multi-step agreement workflow that syncs state across both user dashboards in real-time.
6.  **Hybrid AI Backend**: Dynamic routing between **Groq** (primary), **Hugging Face** (fallback), and a **Local Torch Pipeline** (offline fallback).
7.  **Cloud Native Design**: Fully optimized for **AWS Amplify** and **Render** with dynamic CORS and healthy endpoint monitoring.

## Tech Stack

*   **Frontend**: React.js, TailwindCSS, Shadcn/UI
*   **Backend**: Python FastAPI, Uvicorn
*   **Database**: MongoDB Atlas (Cloud)
*   **AI Engine**: 
    *   **Primary**: Groq API (Llama-3-8b-instant) - Fast & Free
    *   **Fallback**: Hugging Face Router (Mistral-7B) / Local `distilgpt2`
*   **Deployment**: AWS Amplify (Frontend) + Render (Backend)

## Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.8+
*   MongoDB Atlas Account (or local MongoDB)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/mat-cha-ai.git
    cd mat-cha-ai
    ```

2.  **Backend Setup**
    ```bash
    cd Frontend/backend
    pip install -r requirements.txt
    
    # Create .env file with your credentials
    # MONGO_URL=mongodb+srv://...
    # GROQ_API_KEY=gsk_...
    
    python server.py
    ```

3.  **Frontend Setup**
    ```bash
    cd Frontend/apps/frontend
    npm install
    npm start
    ```

## Deployment

See [`AMPLIFY_GUIDE.md`](AMPLIFY_GUIDE.md) and [`DEPLOYMENT.md`](DEPLOYMENT.md) for detailed instructions on how to host this project for free.

## License
MIT
