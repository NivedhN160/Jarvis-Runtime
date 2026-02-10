from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
from openai import AsyncOpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str  # "startup" or "creator"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CollabRequestCreate(BaseModel):
    title: str
    description: str
    budget: float
    target_platform: str  # "Instagram", "YouTube", "Both"
    content_type: str  # "Vlog", "Short Film", "Any"

class CollabRequest(CollabRequestCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    startup_id: str
    startup_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreatorProfileCreate(BaseModel):
    bio: str
    content_types: List[str]  # ["Vlog", "Short Film", "Tutorial"]
    platforms: List[str]  # ["Instagram", "YouTube"]
    portfolio_links: List[str]

class CreatorProfile(CreatorProfileCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    creator_name: str
    creator_email: str
    instagram_followers: int = 0
    youtube_subscribers: int = 0
    engagement_rate: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    collab_request_id: str
    creator_profile_id: str
    score: float
    ai_analysis: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsResponse(BaseModel):
    total_requests: int
    total_creators: int
    total_matches: int
    avg_match_score: float

# Auth endpoints
@api_router.post("/auth/signup", response_model=User)
async def signup(user: UserCreate):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    user_obj = User(**user.model_dump(exclude={"password"}))
    
    doc = user_obj.model_dump()
    doc['password'] = hashed_pw.decode('utf-8')
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "role": user['role']
    }

# Collaboration Request endpoints
@api_router.post("/collabs", response_model=CollabRequest)
async def create_collab_request(collab: CollabRequestCreate, user_id: str, user_name: str):
    collab_obj = CollabRequest(
        **collab.model_dump(),
        startup_id=user_id,
        startup_name=user_name
    )
    
    doc = collab_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.collab_requests.insert_one(doc)
    return collab_obj

@api_router.get("/collabs", response_model=List[CollabRequest])
async def get_collab_requests(startup_id: Optional[str] = None):
    query = {"startup_id": startup_id} if startup_id else {}
    requests = await db.collab_requests.find(query, {"_id": 0}).to_list(100)
    
    for req in requests:
        if isinstance(req['created_at'], str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
    
    return requests

# Creator Profile endpoints
@api_router.post("/profiles", response_model=CreatorProfile)
async def create_creator_profile(profile: CreatorProfileCreate, user_id: str, user_name: str, user_email: str):
    existing = await db.creator_profiles.find_one({"creator_id": user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    # Mock social media stats
    import random
    profile_obj = CreatorProfile(
        **profile.model_dump(),
        creator_id=user_id,
        creator_name=user_name,
        creator_email=user_email,
        instagram_followers=random.randint(5000, 100000),
        youtube_subscribers=random.randint(10000, 500000),
        engagement_rate=round(random.uniform(2.5, 8.5), 2)
    )
    
    doc = profile_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.creator_profiles.insert_one(doc)
    return profile_obj

@api_router.get("/profiles", response_model=List[CreatorProfile])
async def get_creator_profiles(creator_id: Optional[str] = None):
    query = {"creator_id": creator_id} if creator_id else {}
    profiles = await db.creator_profiles.find(query, {"_id": 0}).to_list(100)
    
    for profile in profiles:
        if isinstance(profile['created_at'], str):
            profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    
    return profiles

@api_router.get("/profiles/{profile_id}", response_model=CreatorProfile)
async def get_creator_profile(profile_id: str):
    profile = await db.creator_profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if isinstance(profile['created_at'], str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    
    return profile

# AI Matching endpoint
@api_router.post("/match/{collab_id}")
async def generate_matches(collab_id: str):
    collab = await db.collab_requests.find_one({"id": collab_id}, {"_id": 0})
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration request not found")
    
    creators = await db.creator_profiles.find({}, {"_id": 0}).to_list(100)
    if not creators:
        return {"matches": [], "message": "No creator profiles available"}
    
    # AI matching using OpenAI GPT-4
    api_key = os.environ.get('OPENAI_API_KEY')
    client = AsyncOpenAI(api_key=api_key)
    
    matches = []
    for creator in creators[:5]:  # Analyze top 5 creators
        prompt = f"""Analyze this match:
        
Collaboration Request:
- Title: {collab['title']}
- Description: {collab['description']}
- Budget: ${collab['budget']}
- Target Platform: {collab['target_platform']}
- Content Type: {collab['content_type']}

Creator Profile:
- Name: {creator['creator_name']}
- Bio: {creator['bio']}
- Content Types: {', '.join(creator['content_types'])}
- Platforms: {', '.join(creator['platforms'])}
- Instagram Followers: {creator['instagram_followers']}
- YouTube Subscribers: {creator['youtube_subscribers']}
- Engagement Rate: {creator['engagement_rate']}%

Provide a match score (0-100) and brief analysis (max 100 words). Format: SCORE:XX|ANALYSIS:your analysis"""
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI expert in matching brands with content creators. Analyze the collaboration request and creator profiles to find the best matches."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            response_text = response.choices[0].message.content
            
            # Parse response
            if "SCORE:" in response_text and "ANALYSIS:" in response_text:
                score_part = response_text.split("ANALYSIS:")[0].split("SCORE:")[1].strip()
                analysis_part = response_text.split("ANALYSIS:")[1].strip()
                score = float(score_part.split("|")[0].strip())
                
                match_obj = MatchResult(
                    collab_request_id=collab_id,
                    creator_profile_id=creator['id'],
                    score=score,
                    ai_analysis=analysis_part
                )
                
                match_doc = match_obj.model_dump()
                match_doc['created_at'] = match_doc['created_at'].isoformat()
                await db.matches.insert_one(match_doc)
                
                matches.append({
                    "creator": creator,
                    "score": score,
                    "analysis": analysis_part
                })
        except Exception as e:
            logging.error(f"Error analyzing creator {creator['id']}: {e}")
            continue
    
    # Sort by score
    matches.sort(key=lambda x: x['score'], reverse=True)
    return {"matches": matches[:3], "total_analyzed": len(creators)}

@api_router.get("/matches/{collab_id}")
async def get_matches(collab_id: str):
    matches = await db.matches.find({"collab_request_id": collab_id}, {"_id": 0}).to_list(100)
    
    result = []
    for match in matches:
        creator = await db.creator_profiles.find_one({"id": match['creator_profile_id']}, {"_id": 0})
        if creator:
            result.append({
                "creator": creator,
                "score": match['score'],
                "analysis": match['ai_analysis']
            })
    
    result.sort(key=lambda x: x['score'], reverse=True)
    return {"matches": result}

# Analytics endpoint
@api_router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    total_requests = await db.collab_requests.count_documents({})
    total_creators = await db.creator_profiles.count_documents({})
    total_matches = await db.matches.count_documents({})
    
    matches = await db.matches.find({}, {"_id": 0, "score": 1}).to_list(1000)
    avg_score = sum(m['score'] for m in matches) / len(matches) if matches else 0
    
    return AnalyticsResponse(
        total_requests=total_requests,
        total_creators=total_creators,
        total_matches=total_matches,
        avg_match_score=round(avg_score, 2)
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
