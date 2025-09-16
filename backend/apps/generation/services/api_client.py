import json
import os
import logging
from enum import Enum
from typing import Any, Dict
from django.conf import settings
import google.generativeai as genai
from openai import OpenAI
from .base import BaseAIClient
from .dto import (
    SyllabusOut,
    TestsOut,
    ContentOut,
    FlashcardsOut,
)

# Configuration Keys (read from environment)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Initialize OpenAI Client (only if key provided)
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Configure Gemini API (only if key provided)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class Task(Enum):
    FLASHCARDS = "flashcards"
    SYLLABUS = "syllabus"
    TEST = "test"
    CONTENT = "content"
    QUIZ = "quiz"

class AIClient(BaseAIClient):
    def __init__(self, model: str, request=None):
        """
        Initialize the AI client with the chosen model.
        """
        self.model = model.lower()
        # Global/env-driven mock flag with per-request override header
        self._use_mock_env = os.getenv("USE_MOCK_AI", "false").lower() == "true"
        self._request = request
        self._logger = logging.getLogger(__name__)
    
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

    def _get_response_with_model(self, model: str, messages):
        if "gemini" in model:
            return self._call_gemini(messages[-1]['content'])
        elif "gpt" in model or "openai" in model:
            # Temporarily use provided model on-the-fly
            current = self.model
            try:
                self.model = model
                return self._call_gpt(messages)
            finally:
                self.model = current
        else:
            raise ValueError("Unsupported AI model. Choose either 'gemini' or 'gpt'.")

    def call(self, *, task: Task, payload: dict, mock_mode: bool | None = None):
        """Unified entrypoint used by services to call AI for a specific task.

        When mock mode is enabled (env USE_MOCK_AI=true, header X-Test-Mode: true, or mock_mode=True),
        returns schema-compliant mock data via the registry. Otherwise, delegates to task-specific
        real implementation.
        """
        # Determine whether to mock (precedence: explicit mock_mode > allowed header > env)
        allow_header = getattr(settings, "ALLOW_REQUEST_MOCK_HEADER", settings.DEBUG)
        header_mock = False
        if self._request:
            try:
                header_mock = self._request.headers.get('X-Test-Mode') == 'true'
            except Exception:
                header_mock = False
        header_allowed = bool(allow_header and (getattr(settings, "DEBUG", False) or (getattr(self._request, "user", None) and getattr(self._request.user, "is_staff", False))))
        effective_header_mock = bool(header_mock and header_allowed)
        use_mock = (mock_mode is True) or effective_header_mock or self._use_mock_env

        # Error simulation hook (deterministic failure testing)
        sim_error = (payload or {}).get("simulate_error")
        if not sim_error and self._request:
            try:
                sim_error = self._request.headers.get('X-Simulate-Error')
            except Exception:
                sim_error = None
        if sim_error:
            self._simulate_error(str(sim_error))

        if use_mock:
            from .mock_data.registry import MOCK_REGISTRY
            if task not in MOCK_REGISTRY:
                raise ValueError(f"No mock registered for task: {task}")
            data = MOCK_REGISTRY[task](payload)
            data = self._attach_provenance(task, data, mode="mock", provider="mock-registry")
            data = self._validate_and_dump(task, data)
            self._log_call(task, mode="mock", provider="mock-registry", ok=True)
            return data

        # Real implementations routed by task. These can be enhanced as needed.
        selected_model = self._effective_model_for_task(task)
        provider = self._provider_name_for_model(selected_model)
        if task is Task.SYLLABUS:
            data = self._call_llm_for_syllabus(payload, model_override=selected_model)
        elif task is Task.TEST:
            data = self._call_llm_for_test(payload, model_override=selected_model)
        elif task is Task.CONTENT:
            data = self._call_llm_for_content(payload, model_override=selected_model)
        elif task is Task.FLASHCARDS:
            data = self._call_llm_for_flashcards(payload, model_override=selected_model)
        elif task is Task.QUIZ:
            data = self._call_llm_for_quiz(payload, model_override=selected_model)
        else:
            raise NotImplementedError(f"Unsupported task: {task}")

        data = self._attach_provenance(task, data, mode="real", provider=provider)
        data = self._validate_and_dump(task, data)
        self._log_call(task, mode="real", provider=provider, ok=True)
        return data
    
    def _call_gemini(self, prompt):
        """
        Calls the Gemini API.
        """
        try:
            if not GEMINI_API_KEY:
                raise RuntimeError("GEMINI_API_KEY not configured")
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
            if not openai_client:
                raise RuntimeError("OPENAI_API_KEY not configured")
            completion = openai_client.chat.completions.create(
                model=self.model,
                messages=messages,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error with GPT API: {e}")
            return ""

    # Task-specific real-call helpers (basic placeholders using existing get_response)
    def _call_llm_for_syllabus(self, payload: dict, *, model_override: str | None = None) -> dict:
        prompt = payload.get("prompt") or f"Extract syllabus structure from the following content as JSON: {payload.get('content','')[:2000]}"
        messages = [self.format_message("user", prompt)]
        raw = self._get_response_with_model(model_override or self.model, messages)
        try:
            return json.loads(raw)
        except Exception:
            return {"title": payload.get("title") or "", "modules": [], "total_hours": 0, "bloom_levels": []}

    def _call_llm_for_test(self, payload: dict, *, model_override: str | None = None) -> dict:
        prompt = payload.get("prompt") or f"Extract exam items (MCQ and written) as JSON from: {payload.get('content','')[:2000]}"
        messages = [self.format_message("user", prompt)]
        raw = self._get_response_with_model(model_override or self.model, messages)
        try:
            return json.loads(raw)
        except Exception:
            return {"items": []}

    def _call_llm_for_content(self, payload: dict, *, model_override: str | None = None) -> dict:
        prompt = payload.get("prompt") or f"Summarize, extract keywords, entities, concepts, and sections as JSON from: {payload.get('content','')[:2000]}"
        messages = [self.format_message("user", prompt)]
        raw = self._get_response_with_model(model_override or self.model, messages)
        try:
            return json.loads(raw)
        except Exception:
            return {"summary": "", "keywords": [], "entities": [], "concepts": [], "sections": []}

    def _call_llm_for_flashcards(self, payload: dict, *, model_override: str | None = None) -> dict:
        prompt = payload.get("prompt") or f"Generate flashcards in JSON (question, answer, tags) from: {payload.get('content','')[:2000]}"
        messages = [self.format_message("user", prompt)]
        raw = self._get_response_with_model(model_override or self.model, messages)
        try:
            return json.loads(raw)
        except Exception:
            return {"cards": []}

    def _call_llm_for_quiz(self, payload: dict, *, model_override: str | None = None) -> dict:
        prompt = payload.get("prompt") or f"Generate quiz questions in JSON format from: {payload.get('content','')[:2000]}"
        messages = [self.format_message("user", prompt)]
        raw = self._get_response_with_model(model_override or self.model, messages)
        try:
            return json.loads(raw)
        except Exception:
            return {"items": []}

    def _validate_and_dump(self, task: Task, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if task is Task.SYLLABUS:
                return SyllabusOut.model_validate(data).model_dump()
            if task is Task.TEST:
                return TestsOut.model_validate(data).model_dump()
            if task is Task.CONTENT:
                return ContentOut.model_validate(data).model_dump()
            if task is Task.FLASHCARDS:
                return FlashcardsOut.model_validate(data).model_dump()
            if task is Task.QUIZ:
                return TestsOut.model_validate(data).model_dump()  # Use same schema as TEST
        except Exception as e:
            self._logger.warning("DTO validation failed for task=%s: %s", task, e)
            # Return minimally safe shape
            minimal = {
                Task.SYLLABUS: {"title": "", "modules": [], "total_hours": 0, "bloom_levels": []},
                Task.TEST: {"items": []},
                Task.CONTENT: {"summary": "", "keywords": [], "entities": [], "concepts": [], "sections": []},
                Task.FLASHCARDS: {"cards": []},
                Task.QUIZ: {"items": []},
            }
            return minimal.get(task, {})
        return data

    def _attach_provenance(self, task: Task, data: Dict[str, Any], *, mode: str, provider: str) -> Dict[str, Any]:
        schema_versions = {
            Task.SYLLABUS: "syllabus.v1",
            Task.TEST: "test.v1",
            Task.CONTENT: "content.v1",
            Task.FLASHCARDS: "flashcards.v1",
        }
        data = dict(data or {})
        data.setdefault("schema_version", schema_versions.get(task))
        data.setdefault("source_mode", mode)
        data.setdefault("provider", provider)
        return data

    def _provider_name(self) -> str:
        if "gemini" in self.model:
            return "gemini"
        if "gpt" in self.model or "openai" in self.model:
            return "openai"
        return self.model

    def _provider_name_for_model(self, model: str) -> str:
        if "gemini" in model:
            return "gemini"
        if "gpt" in model or "openai" in model:
            return "openai"
        return model

    def _effective_model_for_task(self, task: Task) -> str:
        try:
            mapping = getattr(settings, "AI_MODELS", None)
            if not mapping:
                return self.model
            conf = mapping.get(task.value)
            if not conf:
                return self.model
            return conf.get("model") or self.model
        except Exception:
            return self.model

    def _simulate_error(self, kind: str) -> None:
        kind = (kind or "").lower()
        if kind == "provider_timeout":
            raise TimeoutError("Simulated provider timeout")
        if kind == "invalid_json":
            raise ValueError("Simulated invalid JSON from provider")
        if kind == "rate_limited":
            raise RuntimeError("Simulated rate limit from provider")
        # Unknown kinds are ignored to avoid surprises

    def _log_call(self, task: Task, *, mode: str, provider: str, ok: bool) -> None:
        self._logger.info(
            "ai_call task=%s mode=%s provider=%s ok=%s",
            task.value,
            mode,
            provider,
            ok,
        )

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


