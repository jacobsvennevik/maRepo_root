import json
import google.generativeai as genai
from openai import OpenAI

# Configuration Keys
GEMINI_API_KEY = "AIzaSyC_98PLPHHj6uTXq7SsDLsFWNrrRve08QI"
OPENAI_API_KEY = "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"

# Initialize OpenAI Client
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

class AIClient:
    def __init__(self, model: str):
        """
        Initialize the AI client with the chosen model.
        """
        self.model = model.lower()
    
    def format_message(self, role, content):
        """
        Formats messages for API requests.
        """
        return {"role": role, "content": content}

    def get_response(self, messages):
        """
        Calls the appropriate AI API based on the selected model.
        """
        if "gemini" in self.model:
            return self._call_gemini(messages[-1]['content'])
        elif "gpt" in self.model:
            return self._call_gpt(messages)
        else:
            raise ValueError("Unsupported AI model. Choose either 'gemini' or 'gpt'.")
    
    def _call_gemini(self, prompt):
        """
        Calls the Gemini API.
        """
        try:
            chat = genai.GenerativeModel(self.model).start_chat()
            response = chat.send_message(prompt)
            return response.text
        except Exception as e:
            print(f"Error with Gemini API: {e}")
            return ""
    
    def _call_gpt(self, messages):
        """
        Calls the OpenAI GPT API.
        """
        try:
            completion = openai_client.chat.completions.create(
                model=self.model,
                messages=messages,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error with GPT API: {e}")
            return ""

# Example Usage
if __name__ == "__main__":
    ai_client = AIClient(model="gemini-2.0-flash")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    response = ai_client.get_response(messages)
    print(response)


