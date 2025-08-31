import json
import google.generativeai as genai
from openai import OpenAI
from .base import BaseAIClient

# Configuration Keys
GEMINI_API_KEY = "AIzaSyC_98PLPHHj6uTXq7SsDLsFWNrrRve08QI"
OPENAI_API_KEY = "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"

# Initialize OpenAI Client
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

class AIClient(BaseAIClient):
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

    def generate_meta(self, project_content: str, model: str = "gpt-4") -> dict:
        """
        Generate smart metadata for a project using AI.
        
        Args:
            project_content: The project content to analyze
            model: AI model to use (default: gpt-4, fallback: gemini-2.0-flash)
            
        Returns:
            dict: Generated metadata with keys: ai_generated_tags, content_summary, difficulty_level
        """
        try:
            # Try GPT-4 first
            ai_client = AIClient(model=model)
        except Exception:
            # Fallback to Gemini
            ai_client = AIClient(model="gemini-2.0-flash")
        
        prompt = f"""
        Analyze the following project content and return a JSON object with the following structure:
        {{
            "ai_generated_tags": ["tag1", "tag2", "tag3"],
            "content_summary": "Brief summary of the project content",
            "difficulty_level": "beginner|intermediate|advanced"
        }}
        
        Project Content:
        {project_content[:4000]}  # Limit content length
        
        Return ONLY the JSON object, no additional text.
        """
        
        messages = [ai_client.format_message("user", prompt)]
        
        try:
            response = ai_client.get_response(messages)
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                meta_data = json.loads(json_str)
                
                # Validate required keys
                required_keys = ["ai_generated_tags", "content_summary", "difficulty_level"]
                for key in required_keys:
                    if key not in meta_data:
                        meta_data[key] = [] if key == "ai_generated_tags" else "Not specified"
                
                return meta_data
            else:
                # Fallback response if JSON parsing fails
                return {
                    "ai_generated_tags": ["ai-analysis"],
                    "content_summary": "AI analysis failed to generate summary",
                    "difficulty_level": "intermediate"
                }
                
        except Exception as e:
            print(f"Error generating metadata: {e}")
            return {
                "ai_generated_tags": ["error"],
                "content_summary": "Failed to generate metadata",
                "difficulty_level": "intermediate"
            }

# Example Usage
if __name__ == "__main__":
    ai_client = AIClient(model="gemini-2.0-flash")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    response = ai_client.get_response(messages)
    print(response)


