# pdf_service/classification.py

"""
Uses language models to classify and extract structured data from text chunks.
"""
import os
from openai import OpenAI
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from typing import Optional

from .prompts import SYLLABUS_EXTRACTOR_PROMPT
from .models import Syllabus

load_dotenv()

# Load the prompt from the txt file and set the input variable name to "text"
prompt_template = PromptTemplate(
    template=SYLLABUS_EXTRACTOR_PROMPT,
    input_variables=["text"]
)

def classify_syllabus(text: str) -> Optional[Syllabus]:
    """
    Uses an OpenAI model to classify the text and extract syllabus information.
    """
    # Create a ChatOpenAI model instance
    model = ChatOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name="gpt-3.5-turbo",
        temperature=0
    )
    
    # The parser will format the output according to the Pydantic model
    parser = PydanticOutputParser(pydantic_object=Syllabus)

    # The chain combines the prompt, the model, and the parser
    chain = prompt_template | model | parser

    try:
        # Invoke the chain with the document text using the correct variable name
        completion = chain.invoke({"text": text})
        return completion
    except Exception as e:
        # This could be a Pydantic validation error, an API error, etc.
        print(f"Failed to classify text: {e}")
        return None 