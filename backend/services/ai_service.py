"""AI Service - Abstraction layer for AI providers"""
import os
from typing import Dict, Any, Optional, List
from config import Config
from ai import ProviderManager, BaseAIProvider
from utils.response_validator import (
    validate_review_response,
    validate_explain_response,
    validate_fix_response,
    validate_debug_response,
    validate_refactor_response,
    validate_security_response
)


class AIService:
    """Service layer that abstracts AI provider calls."""

    def __init__(self):
        self._provider: Optional[BaseAIProvider] = None

    def _get_provider(self, provider_name: Optional[str] = None) -> BaseAIProvider:
        """Get provider instance."""
        if provider_name is None:
            provider_name = Config.DEFAULT_AI_PROVIDER
        return ProviderManager.get_provider(provider_name)

    def analyze_code(self, language: str, code: str, provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Analyze code using the specified provider."""
        provider_name = provider_name or Config.DEFAULT_AI_PROVIDER

        # Mock mode or fallback when provider not configured
        if os.getenv('AI_MOCK_MODE', 'false').lower() == 'true' or not ProviderManager.is_provider_available(provider_name):
            from services.review_service import generate_review
            res = generate_review(code, language)
            res['provider'] = provider_name
            res['model'] = f"{provider_name}-mock-v6"
            return res

        provider = self._get_provider(provider_name)
        result = provider.analyze_code(language, code)

        try:
            validate_review_response(result)
        except Exception as e:
            raise RuntimeError(f"AI returned an invalid review response format: {e}")

        return result

    def explain_code(self, language: str, code: str, provider_name: Optional[str] = None, level: str = "intermediate") -> Dict[str, Any]:
        """Explain code using the specified provider."""
        provider_name = provider_name or Config.DEFAULT_AI_PROVIDER

        if os.getenv('AI_MOCK_MODE', 'false').lower() == 'true' or not ProviderManager.is_provider_available(provider_name):
            from services.explain_service import generate_explanation
            res = generate_explanation(code, language, level)
            res['provider'] = provider_name
            res['model'] = f"{provider_name}-mock-v6"
            return res

        provider = self._get_provider(provider_name)
        result = provider.explain_code(language, code, level)

        try:
            validate_explain_response(result)
        except Exception as e:
            raise RuntimeError(f"AI returned an invalid explanation response format: {e}")

        return result

    def fix_code(self, language: str, code: str, provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Fix code using the specified provider."""
        provider_name = provider_name or Config.DEFAULT_AI_PROVIDER

        if os.getenv('AI_MOCK_MODE', 'false').lower() == 'true' or not ProviderManager.is_provider_available(provider_name):
            from services.fix_service import generate_fix
            res = generate_fix(code, language)
            res['provider'] = provider_name
            res['model'] = f"{provider_name}-mock-v6"
            return res

        provider = self._get_provider(provider_name)
        result = provider.fix_code(language, code)

        try:
            validate_fix_response(result)
        except Exception as e:
            raise RuntimeError(f"AI returned an invalid fix response format: {e}")

        return result

    def debug_code(self, language: str, code: str, error: str, stack_trace: str = "", provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Debug code using the specified provider."""
        provider_name = provider_name or Config.DEFAULT_AI_PROVIDER

        if os.getenv('AI_MOCK_MODE', 'false').lower() == 'true' or not ProviderManager.is_provider_available(provider_name):
            from services.debug_service import generate_debug_analysis
            res = generate_debug_analysis(code, language, error, stack_trace)
            res['provider'] = provider_name
            res['model'] = f"{provider_name}-mock-v6"
            return res

        provider = self._get_provider(provider_name)
        result = provider.debug_code(language, code, error, stack_trace)

        try:
            validate_debug_response(result)
        except Exception as e:
            raise RuntimeError(f"AI returned an invalid debug response format: {e}")

        return result

    def refactor_code(self, language: str, code: str, goals: Optional[List[str]] = None, provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Refactor code using the specified provider."""
        provider_name = provider_name or Config.DEFAULT_AI_PROVIDER

        if os.getenv('AI_MOCK_MODE', 'false').lower() == 'true' or not ProviderManager.is_provider_available(provider_name):
            from services.refactor_service import generate_refactor_analysis
            res = generate_refactor_analysis(code, language, goals)
            res['provider'] = provider_name
            res['model'] = f"{provider_name}-mock-v6"
            return res

        provider = self._get_provider(provider_name)
        result = provider.refactor_code(language, code, goals)

        try:
            validate_refactor_response(result)
        except Exception as e:
            raise RuntimeError(f"AI returned an invalid refactor response format: {e}")

        return result

    def security_scan(self, language: str, code: str, provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Perform security scan using the specified provider."""
        provider_name = provider_name or Config.DEFAULT_AI_PROVIDER

        if os.getenv('AI_MOCK_MODE', 'false').lower() == 'true' or not ProviderManager.is_provider_available(provider_name):
            from services.security_service import generate_security_analysis
            res = generate_security_analysis(code, language)
            res['provider'] = provider_name
            res['model'] = f"{provider_name}-mock-v6"
            return res

        provider = self._get_provider(provider_name)
        result = provider.security_scan(language, code)

        try:
            validate_security_response(result)
        except Exception as e:
            raise RuntimeError(f"AI returned an invalid security scan response format: {e}")

        return result

    def get_available_providers(self) -> Dict[str, Any]:
        """Get information about available providers."""
        return {
            'providers': ProviderManager.get_available_providers(),
            'default': Config.DEFAULT_AI_PROVIDER
        }

    def is_provider_available(self, provider_name: str) -> bool:
        """Check if a provider is available and configured."""
        return ProviderManager.is_provider_available(provider_name)


# Global service instance
ai_service = AIService()