import pytest
from unittest.mock import MagicMock, patch
from ..vector_store import get_vector_store
import os
from inspect import signature
from chromadb.api.types import EmbeddingFunction

class MockEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input):
        return [[0.1] * 1536] * len(input)

    def name(self):
        return "openai"

@pytest.fixture
def mock_chromadb_client():
    with patch('chromadb.PersistentClient') as mock_client:
        mock_collection = MagicMock()
        mock_client.return_value.get_or_create_collection.return_value = mock_collection
        yield mock_client

@pytest.fixture
def mock_openai_ef():
    with patch('chromadb.utils.embedding_functions.OpenAIEmbeddingFunction') as mock_ef:
        mock_ef.return_value = MockEmbeddingFunction()
        yield mock_ef

@pytest.fixture(autouse=True)
def mock_env_vars():
    with patch.dict('os.environ', {
        'CHROMA_OPENAI_API_KEY': 'test_key',
        'OPENAI_API_KEY': 'test_key',
        'OPENAI_EMBEDDING_MODEL': 'text-embedding-3-small'
    }):
        yield

def test_get_vector_store(mock_chromadb_client, mock_openai_ef):
    """Test that the vector store is initialized correctly."""
    collection = get_vector_store("test_collection")
    
    assert collection is not None
    mock_chromadb_client.return_value.get_or_create_collection.assert_called_once_with(
        name="test_collection",
        embedding_function=mock_openai_ef.return_value
    ) 