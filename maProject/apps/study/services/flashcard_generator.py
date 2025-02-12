import json
import google.generativeai as genai
from openai import OpenAI
import re
import csv
import datetime
import os
import sys

# Add parent directories to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from maProject.apps.study.services.pdf_reader import read_pdf
    from maProject.apps.study.services.api_client import AIClient
except ModuleNotFoundError as e:
    print(f"Module import error: {e}. Check if the paths are correct.")
    sys.exit(1)

MODEL = "gemini-2.0-flash"

def parse_flashcards(content):
    """
    Parses flashcards from AI-generated content.
    """
    flashcard_formats = [
        r'(?i)(?:front(?:\s+of\s+card)?\s*:\s*(.+?))'
        r'(?:(?:back(?:\s+of\s+card)?\s*:\s*(.+?))?(?=front(?:\s+of\s+card)?\s*:|\Z))'
    ]
    flashcards_raw = []
    for regex in flashcard_formats:
        flashcards_raw = re.findall(regex, content, re.DOTALL)
        if flashcards_raw:
            break

    flashcards = [(front.strip(), back.strip() if back else "") for front, back in flashcards_raw]
    return flashcards

def export_to_csv(flashcards, output_file):
    """
    Exports flashcards to a CSV file.
    """
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Front', 'Back'])
        for front, back in flashcards:
            writer.writerow([front, back])

def get_auto_output_filename(extension):
    """
    Generates a timestamped filename.
    """
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"flashcards_{now}.{extension}"

def generate_flashcards(user_text, model):
    """
    Generates flashcards using the specified AI model.
    """
    ai_client = AIClient(model)
    prompt = (
        "Convert the following text into flashcards. Each flashcard should have a front and a back. "
        "Use the format:\n"
        "Front: <question>\n"
        "Back: <answer>\n\n"
        "Text:\n" + user_text
    )
    messages = [ai_client.format_message("user", prompt)]
    response = ai_client.get_response(messages)
    return parse_flashcards(response)

if __name__ == "__main__":
    pdf_path = "All_notes_Mod2_copy.pdf"
    model = "gemini-2.0-flash"
    if os.path.exists(pdf_path):
        user_text = read_pdf(pdf_path)
        flashcards = generate_flashcards(user_text, MODEL)
        if flashcards:
            output_file = get_auto_output_filename("csv")
            export_to_csv(flashcards, output_file)
            print(f"Flashcards saved to {output_file}")
    else:
        print(f"Error: PDF file '{pdf_path}' not found.")
