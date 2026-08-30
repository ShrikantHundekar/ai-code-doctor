"""Base AI Provider Interface"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List


class BaseAIProvider(ABC):
    """Abstract base class for AI providers.

    All AI providers (OpenAI, Claude, Gemini) must implement this interface.
    This ensures a consistent API regardless of the underlying provider.
    """

    @abstractmethod
    def analyze_code(self, language: str, code: str) -> Dict[str, Any]:
        """Analyze code and return review results."""
        pass

    @abstractmethod
    def explain_code(self, language: str, code: str, level: str = "intermediate") -> Dict[str, Any]:
        """Explain the submitted code."""
        pass

    @abstractmethod
    def fix_code(self, language: str, code: str) -> Dict[str, Any]:
        """Generate fixed version of the code."""
        pass

    @abstractmethod
    def debug_code(self, language: str, code: str, error: str, stack_trace: str = "") -> Dict[str, Any]:
        """Debug code based on error and optional stack trace."""
        pass

    @abstractmethod
    def refactor_code(self, language: str, code: str, goals: Optional[List[str]] = None) -> Dict[str, Any]:
        """Refactor code according to specified goals."""
        pass

    @abstractmethod
    def security_scan(self, language: str, code: str) -> Dict[str, Any]:
        """Perform security scan on code."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if provider API key is set."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider name (e.g., 'openai', 'claude', 'gemini')."""
        pass

    @property
    @abstractmethod
    def model(self) -> str:
        """Return the model name used by this provider."""
        pass