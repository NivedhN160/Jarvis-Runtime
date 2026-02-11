
import os
import chromadb
from openai import OpenAI, AsyncOpenAI
from typing import List, Dict, Any

# Ensure environment variables are loaded if this module is imported directly
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env', override=True)

class VectorStore:
    def __init__(self):
        # Initialize ChromaDB - Point to the shared DB in project root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        chroma_path = os.path.join(base_dir, "chroma_db")
        self.chroma_client = chromadb.PersistentClient(path=chroma_path)
        self.creator_collection = self.chroma_client.get_or_create_collection(name="creators")

        # AI Configuration
        # 1. Try to detect key type from environment or fallback
        FALLBACK_KEY = "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"
        
        hf_token = os.environ.get("HF_TOKEN")
        openai_key = os.environ.get("OPENAI_API_KEY")
        groq_key = os.environ.get("GROQ_API_KEY")
        
        if not hf_token and not openai_key and not groq_key:
            if FALLBACK_KEY.startswith("hf_"):
                hf_token = FALLBACK_KEY
            elif FALLBACK_KEY.startswith("gsk_"): 
                groq_key = FALLBACK_KEY
            elif FALLBACK_KEY.startswith("sk-"):
                openai_key = FALLBACK_KEY

        self.use_local_pipeline = False
        
        if groq_key:
            print(f"VectorStore: Using Groq API (Fast & Free Tier) with key {groq_key[:5]}...")
            self.client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=groq_key
            )
            self.async_client = AsyncOpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=groq_key
            )
            self.model = "llama-3.1-8b-instant" # Extremely fast
            
        elif hf_token:
            print(f"VectorStore: Using Hugging Face Router with token {hf_token[:5]}...")
            self.client = OpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=hf_token
            )
            self.async_client = AsyncOpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=hf_token
            )
            self.model = "mistralai/Mistral-7B-Instruct-v0.3" # Reliable free model
            
        elif openai_key:
            print(f"VectorStore: Using Standard OpenAI with key {openai_key[:5]}...")
            self.client = OpenAI(api_key=openai_key)
            self.async_client = AsyncOpenAI(api_key=openai_key)
            self.model = "gpt-4"
        else:
            print("VectorStore: No keys found. Initializing LOCAL Hugging Face Pipeline (Free/Offline)...")
            self._init_local_pipeline()

    def _init_local_pipeline(self):
        try:
            from transformers import pipeline
            # Using distilgpt2 for speed/size. User can swap for 'gpt2-medium' or better if they have resources.
            self.local_generator = pipeline('text-generation', model='distilgpt2') 
            self.use_local_pipeline = True
            self.client = None
            self.async_client = None
            print("VectorStore: Local pipeline initialized successfully.")
        except ImportError:
            print("VectorStore: ERROR - transformers or torch not installed. Please run `pip install transformers torch`.")
            self.use_local_pipeline = False # Cannot use local either
            # We don't set client to None here if it was already set (in case this is called as fallback)
        except Exception as e:
            print(f"VectorStore: Error initializing local pipeline: {e}")
            self.use_local_pipeline = False

    def ensure_local_pipeline(self):
        if not self.use_local_pipeline:
            print("VectorStore: API failed, attempting fallback to local pipeline...")
            self._init_local_pipeline()
            return self.use_local_pipeline
        return True

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
