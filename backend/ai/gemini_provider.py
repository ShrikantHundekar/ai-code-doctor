"""Gemini Provider Implementation"""
import os
import json
from typing import Dict, Any, Optional, List
from .base_provider import BaseAIProvider
from prompts.review_prompt import get_review_prompt
from prompts.explain_prompt import get_explain_prompt
from prompts.fix_prompt import get_fix_prompt
from prompts.debug_prompt import get_debug_prompt
from prompts.refactor_prompt import get_refactor_prompt
from prompts.security_prompt import get_security_prompt


class GeminiProvider(BaseAIProvider):
    """Google Gemini provider implementation."""

    def __init__(self):
        self._api_key: Optional[str] = None
        self._model: str = os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')

    @property
    def provider_name(self) -> str:
        return 'gemini'

    @property
    def model(self) -> str:
        return self._model

    def is_configured(self) -> bool:
        """Check if Gemini API key is configured."""
        return bool(os.getenv('GEMINI_API_KEY'))

    def _get_api_key(self) -> str:
        """Get and cache API key."""
        if not self._api_key:
            self._api_key = os.getenv('GEMINI_API_KEY')
        if not self._api_key:
            raise EnvironmentError("GEMINI_API_KEY is not set")
        return self._api_key

    def _call_api(self, prompt: str) -> str:
        """Make API call to Gemini."""
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._get_api_key())

            model = genai.GenerativeModel(self._model)

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 4000,
                    "response_mime_type": "application/json"
                }
            )

            return response.text if response.text else ""

        except ImportError:
            raise ImportError("Google GenerativeAI SDK not installed. Run: pip install google-generativeai")
        except Exception as e:
            if "authentication" in str(e).lower() or "api_key" in str(e).lower() or "permission" in str(e).lower():
                raise EnvironmentError("Gemini authentication failed. Check your API key.")
            raise

    def _extract_json(self, response: str) -> Dict[str, Any]:
        """Extract and parse JSON from API response."""
        response = response.strip()

        if response.startswith('```'):
            lines = response.split('\n')
            json_lines = [l for l in lines if not l.startswith('```') and not l.startswith('json')]
            response = '\n'.join(json_lines)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = response[start:end]
                return json.loads(json_str)
            raise ValueError("Could not extract JSON from Gemini response")

    def analyze_code(self, language: str, code: str) -> Dict[str, Any]:
        """Analyze code using Gemini."""
        prompt = get_review_prompt(language, code)
        response = self._call_api(prompt)
        result = self._extract_json(response)
        result['provider'] = self.provider_name
        result['model'] = self.model
        return result

    def explain_code(self, language: str, code: str, level: str = "intermediate") -> Dict[str, Any]:
        """Explain code using Gemini."""
        prompt = get_explain_prompt(language, code, level)
        response = self._call_api(prompt)
        result = self._extract_json(response)
        result['provider'] = self.provider_name
        result['model'] = self.model
        return result

    def fix_code(self, language: str, code: str) -> Dict[str, Any]:
        """Fix code using Gemini."""
        prompt = get_fix_prompt(language, code)
        response = self._call_api(prompt)
        result = self._extract_json(response)
        result['provider'] = self.provider_name
        result['model'] = self.model
        return result

    def debug_code(self, language: str, code: str, error: str, stack_trace: str = "") -> Dict[str, Any]:
        """Debug code using Gemini."""
        prompt = get_debug_prompt(language, code, error, stack_trace)
        response = self._call_api(prompt)
        result = self._extract_json(response)
        result['provider'] = self.provider_name
        result['model'] = self.model
        return result

    def refactor_code(self, language: str, code: str, goals: Optional[List[str]] = None) -> Dict[str, Any]:
        """Refactor code using Gemini."""
        prompt = get_refactor_prompt(language, code, goals or ["readability", "performance", "maintainability"])
        response = self._call_api(prompt)
        result = self._extract_json(response)
        result['provider'] = self.provider_name
        result['model'] = self.model
        return result

    def security_scan(self, language: str, code: str) -> Dict[str, Any]:
        """Perform security scan using Gemini."""
        prompt = get_security_prompt(language, code)
        response = self._call_api(prompt)
        result = self._extract_json(response)
        result['provider'] = self.provider_name
        result['model'] = self.model
        return result