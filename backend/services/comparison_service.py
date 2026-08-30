"""Comparison Service - Runs concurrent AI reviews across providers and computes comparison"""
import os
import concurrent.futures
from typing import Dict, Any, List, Optional
from config import Config
from ai import ProviderManager
from services.ai_service import ai_service
from services.comparison_engine import ComparisonEngine


class ComparisonService:
    """Orchestrates parallel multi-AI reviews and synthesizes comparisons."""

    @classmethod
    def _execute_single_provider(cls, provider_name: str, language: str, code: str) -> Dict[str, Any]:
        """Execute review for a single provider safely, capturing any failure."""
        try:
            review_result = ai_service.analyze_code(language=language, code=code, provider_name=provider_name)
            model_name = review_result.get('model', f"{provider_name}-model")
            return {
                "provider": provider_name,
                "model": model_name,
                "success": True,
                "review": review_result
            }
        except Exception as e:
            return {
                "provider": provider_name,
                "model": "unknown",
                "success": False,
                "error": str(e)
            }

    @classmethod
    def compare_code(cls, language: str, code: str, providers: List[str]) -> Dict[str, Any]:
        """Run parallel analysis across selected providers and compare results.

        Args:
            language: Programming language
            code: Source code
            providers: List of provider names (e.g. ['openai', 'claude', 'gemini'])

        Returns:
            Standardized multi-AI comparison response
        """
        # Validate provider list
        valid_providers = [p.lower().strip() for p in providers if p.lower().strip() in Config.SUPPORTED_PROVIDERS]
        if len(valid_providers) < 2:
            raise ValueError("Comparison requires at least 2 valid providers.")

        # Run concurrent requests
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(valid_providers)) as executor:
            future_to_provider = {
                executor.submit(cls._execute_single_provider, p, language, code): p
                for p in valid_providers
            }

            for future in concurrent.futures.as_completed(future_to_provider):
                res = future.result()
                results.append(res)

        # Sort results to match requested order
        provider_order = {p: i for i, p in enumerate(valid_providers)}
        results.sort(key=lambda r: provider_order.get(r.get('provider'), 99))

        # Check if all providers failed
        successful_count = sum(1 for r in results if r.get('success'))
        if successful_count == 0:
            raise RuntimeError("Unable to complete AI comparison. All selected providers failed.")

        # Synthesize cross-provider comparison
        comparison = ComparisonEngine.synthesize_comparison(results)

        return {
            "mode": "comparison",
            "language": language,
            "results": results,
            "comparison": comparison
        }


comparison_service = ComparisonService()
