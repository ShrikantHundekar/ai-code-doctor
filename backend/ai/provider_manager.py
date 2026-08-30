"""Provider Manager - Factory for AI providers"""
import os
from typing import Dict, Any, Optional
from .base_provider import BaseAIProvider
from .openai_provider import OpenAIProvider
from .claude_provider import ClaudeProvider
from .gemini_provider import GeminiProvider


class ProviderManager:
    """Manages AI provider selection and instantiation."""

    _providers: Dict[str, type] = {
        'openai': OpenAIProvider,
        'claude': ClaudeProvider,
        'gemini': GeminiProvider,
    }

    _instances: Dict[str, BaseAIProvider] = {}

    @classmethod
    def get_provider(cls, provider_name: str) -> BaseAIProvider:
        """Get a provider instance by name.

        Args:
            provider_name: Name of the provider ('openai', 'claude', 'gemini')

        Returns:
            Provider instance

        Raises:
            ValueError: If provider is not supported
            EnvironmentError: If provider API key is not configured
        """
        provider_name = provider_name.lower().strip()

        if provider_name not in cls._providers:
            raise ValueError(f"Unsupported AI provider: {provider_name}. "
                           f"Supported: {list(cls._providers.keys())}")

        # Return cached instance if available
        if provider_name in cls._instances:
            return cls._instances[provider_name]

        # Create new instance
        provider_class = cls._providers[provider_name]
        provider = provider_class()

        # Check if API key is configured
        if not provider.is_configured():
            raise EnvironmentError(
                f"The selected AI provider '{provider_name}' is not configured. "
                f"Please set the appropriate API key environment variable."
            )

        cls._instances[provider_name] = provider
        return provider

    @classmethod
    def is_provider_available(cls, provider_name: str) -> bool:
        """Check if a provider is available and configured.

        Args:
            provider_name: Name of the provider

        Returns:
            True if provider is available, False otherwise
        """
        try:
            provider = cls.get_provider(provider_name)
            return provider.is_configured()
        except (ValueError, EnvironmentError):
            return False

    @classmethod
    def get_available_providers(cls) -> Dict[str, Dict[str, Any]]:
        """Get information about all available providers.

        Returns:
            Dictionary mapping provider names to their info
        """
        providers = {}
        for name in cls._providers.keys():
            provider = cls._providers[name]
            try:
                is_available = cls.is_provider_available(name)
                providers[name] = {
                    'id': name,
                    'name': name.capitalize(),
                    'available': is_available
                }
            except Exception:
                providers[name] = {
                    'id': name,
                    'name': name.capitalize(),
                    'available': False
                }
        return providers

    @classmethod
    def get_default_provider(cls) -> str:
        """Get the default provider from environment or config."""
        return os.getenv('DEFAULT_AI_PROVIDER', 'openai').lower()

    @classmethod
    def clear_cache(cls) -> None:
        """Clear cached provider instances."""
        cls._instances.clear()