import os

# Get the directory of the current file
_PROMPTS_DIR = os.path.dirname(os.path.abspath(__file__))

def _load_prompt(file_name):
    """A helper function to load a prompt from the prompts directory."""
    file_path = os.path.join(_PROMPTS_DIR, 'prompts', file_name)
    with open(file_path, 'r') as f:
        return f.read()

# Load prompts into constants
SYLLABUS_EXTRACTOR_PROMPT = _load_prompt('syllabus_extractor.txt') 