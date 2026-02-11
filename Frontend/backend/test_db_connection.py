
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load env
env_path = Path(".env")
load_dotenv(dotenv_path=env_path, override=True)

async def check_db():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    print(f"Testing connection to: {mongo_url}")
    
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB!")
        
        # Check if users collection exists and has data
        db = client[os.environ.get('DB_NAME', 'test_database')]
        user_count = await db.users.count_documents({})
        print(f"Users found in DB: {user_count}")
        
    except Exception as e:
        print(f"FAILURE: Could not connect to MongoDB. Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
