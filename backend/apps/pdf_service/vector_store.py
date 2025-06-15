# pdf_service/vector_store.py

"""
Manages the vector store for embedding and persisting text chunks.
Uses ChromaDB as the backend.
"""
import os
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

load_dotenv()

# This will persist data to disk in the `chroma_data` directory.
client = chromadb.PersistentClient(path="chroma_data")

def get_vector_store(collection_name: str = "default_collection"):
    """
    Retrieves or creates a ChromaDB collection to act as the vector store.
    The embedding function is initialized here to avoid import-time side effects.
    """
    # Set up the embedding function using OpenAI
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    )
    
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=openai_ef
    )
    return collection