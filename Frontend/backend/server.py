from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from pydantic import BaseModel, Field, ConfigDict, EmailStr, AliasChoices
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import bcrypt
from openai import AsyncOpenAI
import asyncio
from vector_store import vector_store

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
db = client[os.environ.get('DB_NAME', 'test_database')]

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"VALIDATION ERROR: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

api_router = APIRouter(prefix="/api")

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        print("Connected to MongoDB successfully!")
    except Exception as e:
        print(f"DATABASE ERROR: Failed to connect to MongoDB: {e}")
        print("Please ensure MongoDB Server is installed and running, or MONGO_URL in .env is correct.")

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
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    collab_request_id: str
    creator_profile_id: str
    score: float
    analysis: str = Field(validation_alias=AliasChoices('analysis', 'ai_analysis'))
    startup_id: str = "Unknown"
    startup_name: str = "Unknown"
    creator_id: str = "Unknown"
    creator_name: str = "Unknown"
    collab_title: str = "Unknown"
    status: str = "suggested"  # suggested, contacted, confirmed
    startup_agreed: bool = False
    creator_agreed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchUpdate(BaseModel):
    status: Optional[str] = None
    startup_agreed: Optional[bool] = None
    creator_agreed: Optional[bool] = None

class AnalyticsResponse(BaseModel):
    total_requests: int
    total_creators: int
    total_matches: int
    avg_match_score: float

# ... (Previous endpoints)

@api_router.get("/matches", response_model=List[MatchResult])
async def get_matches(creator_id: Optional[str] = None, startup_id: Optional[str] = None):
    query = {}
    if creator_id:
        query["creator_id"] = creator_id
    if startup_id:
        query["startup_id"] = startup_id
    
    matches = await db.matches.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for m in matches:
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return matches

@api_router.get("/matches/{match_id}", response_model=MatchResult)
async def get_match(match_id: str):
    match = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if isinstance(match['created_at'], str):
        match['created_at'] = datetime.fromisoformat(match['created_at'])
    return match

@api_router.put("/matches/{match_id}", response_model=MatchResult)
async def update_match(match_id: str, update: MatchUpdate):
    match = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    update_data = update.model_dump(exclude_unset=True)
    
    # Check for confirmation logic
    if update.startup_agreed is True:
        update_data['startup_agreed'] = True
        if match.get('creator_agreed'):
            update_data['status'] = 'confirmed'
            
    if update.creator_agreed is True:
        update_data['creator_agreed'] = True
        if match.get('startup_agreed'):
            update_data['status'] = 'confirmed'
            
    if update.status:
        update_data['status'] = update.status
        
    await db.matches.update_one({"id": match_id}, {"$set": update_data})
    
    updated_match = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if isinstance(updated_match['created_at'], str):
        updated_match['created_at'] = datetime.fromisoformat(updated_match['created_at'])
        
    return updated_match

@api_router.get("/health")
async def health_check():
    try:
        await client.admin.command('ping')
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}

# Auth endpoints


# Content & Chat Models
class ContentPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    creator_name: str
    title: str
    description: str
    content_type: str  # Video, Blog, Image
    url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DirectMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: str
    sender_name: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# --- Content Endpoints ---
@api_router.post("/content", response_model=ContentPost)
async def create_content(post: ContentPost):
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.content_posts.insert_one(doc)
    return post

@api_router.get("/content", response_model=List[ContentPost])
async def get_content_feed(creator_id: Optional[str] = None):
    query = {"creator_id": creator_id} if creator_id else {}
    posts = await db.content_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    return posts

@api_router.delete("/content/{post_id}")
async def delete_content(post_id: str):
    result = await db.content_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": "deleted"}

# --- Account & Request Deletion ---
@api_router.delete("/users/{user_id}")
async def delete_account(user_id: str):
    # Delete match history, content, profile, and user record
    await db.users.delete_one({"id": user_id})
    await db.creator_profiles.delete_one({"creator_id": user_id})
    await db.collab_requests.delete_many({"startup_id": user_id})
    await db.content_posts.delete_many({"creator_id": user_id})
    await db.matches.delete_many({"$or": [{"creator_profile_id": user_id}, {"startup_id": user_id}]})
    return {"status": "account_deleted"}

@api_router.delete("/collabs/{collab_id}")
async def delete_collab_request(collab_id: str):
    # Delete the collaboration request
    result = await db.collab_requests.delete_one({"id": collab_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collaboration request not found")
    
    # Also delete any matches associated with this collaboration request
    await db.matches.delete_many({"collab_request_id": collab_id})
    
    return {"status": "deleted", "collab_id": collab_id}

# --- Ephemeral Chat (48h Auto-Delete Logic) ---
@api_router.post("/chat/messages", response_model=DirectMessage)
async def send_direct_message(msg: DirectMessage):
    doc = msg.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.direct_messages.insert_one(doc)
    return msg

@api_router.get("/chat/messages/{match_id}", response_model=List[DirectMessage])
async def get_chat_history(match_id: str):
    # Calculate 48 hours ago
    cutoff = datetime.now(timezone.utc) - await asyncio.to_thread(lambda: __import__('datetime').timedelta(hours=48))
    
    # Logic to ACTUALLY delete old messages (lazy deletion)
    # Convert cutoff to string for comparison if stored as ISO string, 
    # but simplest is to filter in Python or use $gt query if indexed correctly.
    # We'll fetch all and filter in app logic for simplicity in this prototype, 
    # but ideally use a TTL index in MongoDB: db.direct_messages.create_index("timestamp", expireAfterSeconds=172800)
    
    messages = await db.direct_messages.find({"match_id": match_id}, {"_id": 0}).sort("timestamp", 1).to_list(500)
    
    valid_messages = []
    ids_to_delete = []
    
    cutoff_iso = cutoff.isoformat()
    
    for msg in messages:
        if msg['timestamp'] < cutoff_iso:
            ids_to_delete.append(msg['id'])
        else:
            if isinstance(msg['timestamp'], str):
                msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
            valid_messages.append(msg)
            
    # Clean up old messages
    if ids_to_delete:
         await db.direct_messages.delete_many({"id": {"$in": ids_to_delete}})
         
    return valid_messages

# --- AI Match Content ---
@api_router.post("/ai/match-content")
async def analyze_content_match(content: ContentPost, startup_id: str):
    """
    Matches a specific piece of content against a startup's active requests.
    """
    requests = await db.collab_requests.find({"startup_id": startup_id}, {"_id": 0}).to_list(10)
    
    if not requests:
        return {"match": False, "reason": "No active requests found for this startup."}

    req_summary = "\n".join([f"- {r['title']} ({r['content_type']})" for r in requests])
    
    prompt = f"""Analyze if this content piece matches any of the startup's requests.
    
    Content:
    Title: {content.title}
    Type: {content.content_type}
    Desc: {content.description}
    
    Startup Requests:
    {req_summary}
    
    If it's a good match for ANY request, return 'MATCH: <Request Title> | REASON: <Short reason>'.
    If not, return 'NO MATCH | REASON: <Short reason>'.
    """
    
    try:
        if vector_store.use_local_pipeline:
             # Fallback simple
             generated = await asyncio.to_thread(vector_store.local_generator, prompt, max_new_tokens=100)
             return {"result": generated[0]['generated_text']}

        response = await vector_store.async_client.chat.completions.create(
            model=vector_store.model,
            messages=[{"role": "system", "content": "You are a content matchmaker."}, {"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=60
        )
        return {"result": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"result": "Error analyzing match."}


# Actionable login/signup endpoints
@api_router.post("/auth/signup", response_model=User)
async def signup(user: UserCreate):
    logger.info(f"Signup attempt for email: {user.email}")
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        logger.warning(f"Signup failed: Email {user.email} already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        user_obj = User(**user.model_dump(exclude={"password"}))
        
        doc = user_obj.model_dump()
        doc['password'] = hashed_pw.decode('utf-8')
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.users.insert_one(doc)
        logger.info(f"User created successfully: {user.email}")
        return user_obj
    except Exception as e:
        logger.error(f"Signup error for {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    try:
        logger.info(f"Login attempt for email: {credentials.email}")
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
        if not user:
            logger.warning(f"Login failed: User {credentials.email} not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        try:
            if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
                logger.warning(f"Login failed: Invalid password for {credentials.email}")
                raise HTTPException(status_code=401, detail="Invalid credentials")
        except Exception as e:
            logger.error(f"Login password check error for {credentials.email}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
        
        logger.info(f"Login successful for {credentials.email}")
        return {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login system error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed due to server error: {str(e)}")

# Collaboration Request endpoints
@api_router.post("/collabs", response_model=CollabRequest)
async def create_collab_request(collab: CollabRequestCreate, user_id: str, user_name: str):
    try:
        logger.info(f"Received collab request from {user_name} ({user_id})")
        collab_obj = CollabRequest(
            **collab.model_dump(),
            startup_id=user_id,
            startup_name=user_name
        )
        
        doc = collab_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.collab_requests.insert_one(doc)
        logger.info(f"Created collab request: {collab_obj.id}")
        return collab_obj
    except Exception as e:
        logger.error(f"CRITICAL ERROR creating collab: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@api_router.get("/collabs", response_model=List[CollabRequest])
async def get_collab_requests(startup_id: Optional[str] = None):
    try:
        query = {"startup_id": startup_id} if startup_id else {}
        logger.info(f"Fetching collabs with query: {query}")
        requests = await db.collab_requests.find(query, {"_id": 0}).to_list(100)
        
        for req in requests:
            if isinstance(req['created_at'], str):
                req['created_at'] = datetime.fromisoformat(req['created_at'])
        
        return requests
    except Exception as e:
        logger.error(f"Error fetching collabs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
    
    # Link to Vector Store (main.py logic)
    try:
        # Run sync vector store add in thread pool to avoid blocking
        await asyncio.to_thread(vector_store.add_creator, doc)
    except Exception as e:
        logger.error(f"Failed to add creator to vector store: {e}")
        
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

@api_router.post("/interest/{collab_id}", response_model=MatchResult)
async def express_interest(collab_id: str, creator_id: str):
    # Fetch collab and profile to get names/ids
    collab = await db.collab_requests.find_one({"id": collab_id}, {"_id": 0})
    profile = await db.creator_profiles.find_one({"creator_id": creator_id}, {"_id": 0})
    
    if not collab or not profile:
        raise HTTPException(status_code=404, detail="Collab or Profile not found")

    # Check if match already exists - use profile['id'] which is the creator_profile_id
    existing = await db.matches.find_one({"collab_request_id": collab_id, "creator_profile_id": profile['id']}, {"_id": 0})
    if existing:
        if isinstance(existing['created_at'], str):
            existing['created_at'] = datetime.fromisoformat(existing['created_at'])
        return existing
    
    # Create new match
    match_obj = MatchResult(
        collab_request_id=collab_id,
        creator_profile_id=profile['id'],
        startup_id=collab['startup_id'],
        startup_name=collab['startup_name'],
        creator_id=creator_id,
        creator_name=profile['creator_name'],
        collab_title=collab['title'],
        score=100.0, 
        analysis="Creator expressed direct interest.",
        status="contacted",
        creator_agreed=True
    )
    
    doc = match_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.matches.insert_one(doc)
    
    return match_obj

# AI Matching endpoint
@api_router.post("/match/{collab_id}")
async def generate_matches(collab_id: str):
    collab = await db.collab_requests.find_one({"id": collab_id}, {"_id": 0})
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration request not found")
    
    creators = await db.creator_profiles.find({}, {"_id": 0}).to_list(100)
    if not creators:
        return {"matches": [], "message": "No creator profiles available"}
    
    # AI matching using Vector Search + LLM (Linked from main.py)
    
    # 1. Use Vector Search to find relevant creators
    query_text = f"{collab['title']} - {collab['description']} ({collab['target_platform']})"
    try:
        # Run sync search in thread pool
        search_results = await asyncio.to_thread(vector_store.search_creators, query_text, n_results=5)
        
        # Extract creator IDs from metadata if available, or handle documents
        # The vector_store.add_creator uses 'id' as the ID in add
        potential_creator_ids = search_results['ids'][0] if search_results['ids'] else []
        
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        potential_creator_ids = []

    # 2. Fetch full profiles for the found IDs
    if potential_creator_ids:
        creators = await db.creator_profiles.find({"id": {"$in": potential_creator_ids}}, {"_id": 0}).to_list(100)
    else:
        # Fallback to fetching all if vector search fails or returns nothing (cold start)
        creators = await db.creator_profiles.find({}, {"_id": 0}).to_list(100)

    if not creators:
        return {"matches": [], "message": "No creator profiles available"}
    
    matches = []
    
    # AI matching using Vector Search + LLM (Linked from vector_store)
    
    if not vector_store.async_client and not vector_store.use_local_pipeline:
        return {"matches": [], "message": "AI service not configured. Please set HF_TOKEN or OPENAI_API_KEY."}

    for creator in creators:
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
            if vector_store.use_local_pipeline:
                # Use local HF pipeline
                # Run CPU/GPU bound task in thread pool
                generated = await asyncio.to_thread(
                    vector_store.local_generator, 
                    prompt, 
                    max_new_tokens=100, 
                    num_return_sequences=1
                )
                response_text = generated[0]['generated_text']
                # Local models might repeat input, so strip it if needed or just use as is
            else:
                response = await vector_store.async_client.chat.completions.create(
                    model=vector_store.model,
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
                    startup_id=collab['startup_id'],
                    startup_name=collab['startup_name'],
                    creator_id=creator['creator_id'],
                    creator_name=creator['creator_name'],
                    collab_title=collab['title'],
                    score=score,
                    analysis=analysis_part
                )
                
                match_doc = match_obj.model_dump()
                match_doc['created_at'] = match_doc['created_at'].isoformat()
                await db.matches.insert_one(match_doc)
                
                # Create a response object that includes the MatchResult data AND the creator info
                full_match = match_obj.model_dump()
                full_match['creator'] = creator
                
                matches.append(full_match)
        except Exception as e:
            logging.error(f"Error analyzing creator {creator['id']}: {e}")
            continue
    
    # Sort by score
    matches.sort(key=lambda x: x['score'], reverse=True)
    return {"matches": matches, "total_analyzed": len(creators)}

# AI Generation endpoint
class GenerateDescriptionRequest(BaseModel):
    title: str
    platform: str
    content_type: str

@api_router.post("/ai/generate-description")
async def generate_description(request: GenerateDescriptionRequest):
    if not vector_store.async_client and not vector_store.use_local_pipeline:
        raise HTTPException(status_code=500, detail="AI service not configured. Please check your .env file.")
        
    prompt = f"""Write a compelling collaboration description for a startup looking for creators.
    Title: {request.title}
    Platform: {request.platform}
    Type: {request.content_type}
    
    Keep it professional, exciting, and under 50 words."""

    try:
        if vector_store.use_local_pipeline:
             # Run CPU/GPU bound task in thread pool
            generated = await asyncio.to_thread(
                vector_store.local_generator, 
                prompt, 
                max_new_tokens=50, 
                num_return_sequences=1
            )
            # Simple cleanup for smaller models
            text = generated[0]['generated_text']
            # If model repeats prompt, remove it
            if text.startswith(prompt):
                text = text[len(prompt):]
            return {"description": text.strip()}

        response = await vector_store.async_client.chat.completions.create(
            model=vector_store.model,
            messages=[
                {"role": "system", "content": "You are a creative marketing assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )
        return {"description": response.choices[0].message.content.strip()}
    except Exception as e:
        error_detail = str(e)
        logger.error(f"AI generation failed: {error_detail}")
        
        # Try fallback to local pipeline
        logger.info("Attempting fallback to local pipeline...")
        if vector_store.ensure_local_pipeline() and vector_store.use_local_pipeline:
             try:
                # Run CPU/GPU bound task in thread pool
                generated = await asyncio.to_thread(
                    vector_store.local_generator, 
                    prompt, 
                    max_new_tokens=50, 
                    num_return_sequences=1
                )
                text = generated[0]['generated_text']
                if text.startswith(prompt):
                    text = text[len(prompt):]
                return {"description": text.strip()}
             except Exception as local_e:
                logger.error(f"Local AI generation failed: {local_e}")
        
        if "401" in error_detail or "Unauthorized" in error_detail:
            raise HTTPException(status_code=401, detail="Invalid AI API Key. Please check your token.")
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {error_detail}")

@api_router.post("/ai/external-suggestions")
async def suggest_external_creators(request: GenerateDescriptionRequest):
    """
    Suggests real-world creators (outside the app) based on the niche.
    """
    prompt = f"""Identify 3-5 popular real-world content creators/vloggers who would be perfect for this campaign:
    Title: {request.title}
    Platform: {request.platform}
    Type: {request.content_type}
    
    Return a list with Name, Platform, and a 1-sentence reason.
    Format:
    1. Name (Platform): Reason
    """

    try:
        response = await vector_store.async_client.chat.completions.create(
            model=vector_store.model,
            messages=[
                {"role": "system", "content": "You are a marketing expert knowledgeable about social media influencers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return {"suggestions": response.choices[0].message.content.strip()}
    except Exception as e:
        # Fallback to local
        if vector_store.ensure_local_pipeline():
             generated = await asyncio.to_thread(vector_store.local_generator, prompt, max_new_tokens=200)
             return {"suggestions": generated[0]['generated_text']}
        raise HTTPException(status_code=500, detail="AI Service Unavailable")

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = [] # Optional history

@api_router.post("/ai/chat")
async def chat_with_ai(request: ChatRequest):
    """
    General chatbot endpoint.
    """
    prompt = request.message
    messages = []
    
    # Check if history already has a system prompt
    has_system = False
    if request.history:
        for msg in request.history:
            if msg.get('role') == 'system':
                has_system = True
                break
    
    if not has_system:
        messages.append({"role": "system", "content": "You are a helpful assistant for the Mat-Cha collaboration platform."})
    
    if request.history:
        messages.extend(request.history)
    
    messages.append({"role": "user", "content": prompt})

    try:
        if vector_store.use_local_pipeline:
            # Simple local generation (chat format not fully supported by distilgpt2 but we can try)
            full_prompt = f"User: {prompt}\nAssistant:"
            generated = await asyncio.to_thread(
                vector_store.local_generator, 
                full_prompt, 
                max_new_tokens=100, 
                num_return_sequences=1
            )
            text = generated[0]['generated_text']
            # naive splitting
            if "Assistant:" in text:
                text = text.split("Assistant:")[1]
            return {"response": text.strip()}

        # API Call
        response = await vector_store.async_client.chat.completions.create(
            model=vector_store.model,
            messages=messages,
            temperature=0.7,
            max_tokens=800  # Increased for content generation
        )
        return {"response": response.choices[0].message.content.strip()}
        
    except Exception as e:
        logger.error(f"Chat generation failed: {e}")
        # Fallback
        if vector_store.ensure_local_pipeline():
             try:
                full_prompt = f"User: {prompt}\nAssistant:"
                generated = await asyncio.to_thread(
                    vector_store.local_generator, 
                    full_prompt, 
                    max_new_tokens=250 # Increased for local too
                )
                text = generated[0]['generated_text']
                if "Assistant:" in text:
                    text = text.split("Assistant:")[1]
                return {"response": text.strip()}
             except Exception as local_e:
                 logger.error(f"Local chat failed: {local_e}")
        
        raise HTTPException(status_code=500, detail="Chat unavailable")

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

@app.get("/")
async def root():
    return {"message": "Jarvis Runtime Backend is running"}

app.include_router(api_router)

# CORS Configuration
# For production, set CORS_ORIGINS in Render to your Amplify URL (e.g., https://main.xxx.amplifyapp.com)
origins = os.environ.get("CORS_ORIGINS", "*").split(",")
# Clean whitespace
origins = [o.strip() for o in origins]

# Always include localhost variations
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in origins:
    origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
