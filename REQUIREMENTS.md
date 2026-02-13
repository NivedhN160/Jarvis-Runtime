# Project Requirements - MAT-CHA.AI

## 1. Overview
MAT-CHA.AI is an AI-powered matchmaking platform designed to bridge the gap between startups and content creators. The primary goal is to facilitate high-quality, data-driven collaborations through intelligent analysis and seamless communication.

## 2. Functional Requirements

### 2.1 User Roles & Authentication
- **Startup/Brand**: Can post collaboration requests, search for creators, and manage deals.
- **Creator**: Can create profiles, showcase portfolios, and express interest in collaborations.
- **Authentication**: Secure login/signup using email and password (hashed with Bcrypt).

### 2.2 Collaboration Management
- **Request Creation**: Startups can define title, description, budget, platform (Instagram/YouTube), and content type.
- **Profile Creation**: Creators can define bio, platforms, content types, and provide social media stats (followers, subscribers, engagement).
- **Deletion**: Users can delete their accounts or individual collaboration requests.

### 2.3 AI-Powered Features
- **Semantic Matchmaking**: Use vector embeddings to match startups with creators based on niche and description.
- **Match Analysis**: Provide a score (0-100) and a qualitative explanation for every pairing.
- **AI Writer Mode**: Help users generate scripts, captions, and collaboration descriptions.
- **External Recommendations**: Suggest real-world influencers based on the campaign niche.

### 2.4 Communication
- **Real-Time Chat**: Direct messaging between matched parties with optimistic updates.
- **Ephemeral Messaging**: Messages automatically expire after 48 hours to maintain a lightweight and secure database.
- **Deal Confirmation**: A formal mechanism where both parties must "Confirm Deal" for a collaborative agreement.

## 3. Technical Requirements

### 3.1 Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS & Shadcn/UI for a premium, modern interface.
- **State Management**: React Hooks and Context for real-time responsiveness.
- **Animations**: Framer Motion / CSS Transitions for smooth interactions (particles, carousels).

### 3.2 Backend
- **Language**: Python 3.8+
- **Framework**: FastAPI (for high-performance asynchronous execution).
- **Communication Protocol**: REST API with background polling for chat (3s interval).

### 3.3 Database & Storage
- **Primary DB**: MongoDB Atlas (NoSQL) for user profiles and chat history.
- **Vector DB**: ChromaDB for storing and searching semantic embeddings of creator profiles.
- **Caching**: Local memory/Background tasks for high-performance matching.

### 3.4 AI Integration
- **Primary LLM**: Groq (Llama-3-8b-instant) for low-latency matching and generation.
- **Fallback LLM**: Hugging Face API (Mistral-7B).
- **Local Fallback**: `distilgpt2` for offline/low-resource environments.

## 4. Non-Functional Requirements
- **Scalability**: Deployable via AWS Amplify (Frontend) and Render (Backend).
- **Responsiveness**: Mobile-first design for the dashboard and landing pages.
- **Security**: Environment variable protection for all API keys and DB strings.
- **Performance**: Match results should be generated in under 5 seconds.
