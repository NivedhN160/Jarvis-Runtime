import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import Column, Integer, String, Float, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import chromadb
from openai import OpenAI
from pydantic import BaseModel
SQLALCHEMY_DATABASE_URL = "sqlite:///./jarvis_runtime.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
chroma_client = chromadb.PersistentClient(path="./chroma_db")
creator_collection = chroma_client.get_or_create_collection(name="creators")

# AI Setup (gpt-oss-120b via Hugging Face Router)
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN")  # Set this in your environment
)


# --- 2. SQL MODELS ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    company_name = Column(String)
    budget = Column(Float)


Base.metadata.create_all(bind=engine)


# --- 3. PYDANTIC SCHEMAS (For API Inputs) ---
class CreatorIn(BaseModel):
    name: str
    tone: str  # e.g., "High-energy tech vlogger"
    platform: str  # e.g., "YouTube"
    avg_views: int


class MatchRequest(BaseModel):
    startup_description: str
    target_audience: str


# --- 4. BACKEND LOGIC ---
app = FastAPI(title="Jarvis Runtime: AI Matcher")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/onboard-creator")
async def add_creator(creator: CreatorIn):
    """Adds a creator to the Vector DB so the AI can 'search' their vibe."""
    creator_collection.add(
        documents=[f"{creator.name} is a {creator.tone} on {creator.platform}."],
        metadatas=[{"views": creator.avg_views, "name": creator.name}],
        ids=[creator.name]
    )
    return {"message": f"Creator {creator.name} indexed successfully."}


@app.post("/get-predictive-match")
async def analyze_matching(request: MatchRequest):
    """
    The Core Logic:
    1. Finds creators via Vector Search (Matching Contents).
    2. Uses gpt-oss-120b to provide Predictive Suggestions (AI Analysis).
    """
    # STEP 1: Vector Search for "Matching Content"
    search_results = creator_collection.query(
        query_texts=[request.startup_description],
        n_results=2
    )
    top_creators = search_results['documents'][0]
    prompt = f"""
    Reasoning: high
    Startup Goal: {request.startup_description}
    Target Audience: {request.target_audience}
    Potential Creators Found: {top_creators}
    """
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b:groq",
        messages=[{"role": "user", "content": prompt}]
    )
    return {
        "status": "Match Found",
        "matches": top_creators,
        "ai_prediction": completion.choices[0].message.content,
        "graph_hint": "Display growth curve based on view averages"
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)