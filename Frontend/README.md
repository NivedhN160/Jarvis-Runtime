# MAT-CHA.AI - Intelligent Collaboration Platform

An AI-powered matchmaking platform connecting startups with content creators for impactful social media campaigns.

## Key Features

1.  **AI Matchmaking**: Intelligent algorithm matches startups with creators based on niche, platform, budget, and content style.
2.  **AI Writer & Chatbot**: Built-in AI assistant ("Writer Mode") to help create scripts and captions instantly.
3.  **Real-Time Chat Hub**: Optimized messaging with **Optimistic UI** (messages appear instantly) and background polling.
4.  **Mutual Confirmation**: A formal "Confirm Deal" mechanism that syncs in real-time across both user dashboards.
5.  **Health-Checked Architecture**: Integrated backend monitoring to ensure MongoDB and AI services are always online.
6.  **Secure Authentication**: Role-based access for Startups and Creators with password hashing (Bcrypt).
7.  **Cloud Native Deployment**: Pre-configured for **AWS Amplify** and **Render**.

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
