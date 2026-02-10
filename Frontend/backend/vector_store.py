
import os
import chromadb
from openai import OpenAI, AsyncOpenAI
from typing import List, Dict, Any

# Ensure environment variables are loaded if this module is imported directly
from dotenv import load_dotenv
load_dotenv()

class VectorStore:
    def __init__(self):
        # Initialize ChromaDB - Point to the shared DB in project root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        chroma_path = os.path.join(base_dir, "chroma_db")
        self.chroma_client = chromadb.PersistentClient(path=chroma_path)
        self.creator_collection = self.chroma_client.get_or_create_collection(name="creators")

        # Initialize AI Client (gpt-oss-120b via Hugging Face Router or fallback)
        hf_token = os.environ.get("HF_TOKEN")
        openai_key = os.environ.get("OPENAI_API_KEY")
        
        if hf_token:
            self.client = OpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=hf_token
            )
            self.model = "openai/gpt-oss-120b:groq" # Model from main.py
        elif openai_key:
            self.client = OpenAI(api_key=openai_key)
            self.model = "gpt-4"
        else:
            print("Warning: No AI API keys found. Vector Store AI features will be disabled.")
            self.client = None
            self.model = None
        
        # Async client for async operations if needed, though main.py used sync
        # We'll stick to sync for this part as in main.py, or adapt to async if server.py needs it.
        # Since server.py is async, blocking calls might be an issue. 
        # But chromadb is sync by default. We can run in executor if needed.

    def add_creator(self, creator_profile: Dict[str, Any]):
        """
        Adds a creator to the Vector DB.
        Expects a dictionary with keys: 'creator_name', 'bio', 'platforms', 'engagement_rate', 'id'
        """
        # Construct a description string similar to main.py
        # "Creator {name} is a {tone} on {platform}."
        # main.py used: f"{creator.name} is a {creator.tone} on {creator.platform}."
        
        description = f"{creator_profile.get('creator_name')} is a creator with bio: {creator_profile.get('bio')}. " \
                      f"Platforms: {', '.join(creator_profile.get('platforms', []))}."

        self.creator_collection.add(
            documents=[description],
            metadatas=[{
                "views": creator_profile.get("engagement_rate", 0), # Mapping engagement to view-like metric
                "name": creator_profile.get("creator_name"),
                "id": creator_profile.get("id")
            }],
            ids=[creator_profile.get("id")] # Use ID instead of name for uniqueness
        )
        return {"message": f"Creator {creator_profile.get('creator_name')} indexed successfully."}

    def search_creators(self, query_text: str, n_results: int = 5):
        """
        Vector Search for "Matching Content"
        """
        results = self.creator_collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results

    def get_predictive_match(self, startup_description: str, target_audience: str, top_creators: List[str]):
        """
        Uses LLM to provide Predictive Suggestions.
        """
        prompt = f"""
        Reasoning: high
        Startup Goal: {startup_description}
        Target Audience: {target_audience}
        Potential Creators Found: {top_creators}
        
        Analyze the fit and predict success.
        """
        
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return completion.choices[0].message.content

# Singleton instance
vector_store = VectorStore()
