"""Response validation utilities for AI responses"""
from typing import Dict, Any, List, Optional


class ResponseValidationError(Exception):
    """Raised when AI response validation fails."""
    pass


def validate_review_response(response: Dict[str, Any]) -> None:
    """Validate that a review response contains all required fields."""
    required_fields = [
        'score',
        'summary',
        'bugs',
        'warnings',
        'securityIssues',
        'suggestions',
        'complexity',
        'quality',
        'fixedCode'
    ]

    missing_fields = [field for field in required_fields if field not in response]

    if missing_fields:
        raise ResponseValidationError(
            f"AI response missing required fields: {', '.join(missing_fields)}"
        )

    # Validate score
    if not isinstance(response['score'], (int, float)) or not (0 <= response['score'] <= 100):
        raise ResponseValidationError("Score must be a number between 0 and 100")
    response['score'] = int(response['score'])

    # Validate arrays
    array_fields = ['bugs', 'warnings', 'securityIssues', 'suggestions']
    for field in array_fields:
        if not isinstance(response[field], list):
            raise ResponseValidationError(f"'{field}' must be an array")

    # Validate complexity
    if not isinstance(response['complexity'], dict):
        raise ResponseValidationError("Complexity must be an object")

    complexity_required = ['time', 'space']
    for field in complexity_required:
        if field not in response['complexity']:
            raise ResponseValidationError(f"Complexity missing field: {field}")

    # Validate quality
    if not isinstance(response['quality'], dict):
        raise ResponseValidationError("Quality must be an object")

    quality_required = ['readability', 'maintainability', 'performance', 'security']
    for field in quality_required:
        if field not in response['quality']:
            raise ResponseValidationError(f"Quality missing field: {field}")
        if not isinstance(response['quality'][field], (int, float)) or not (0 <= response['quality'][field] <= 100):
            raise ResponseValidationError(f"Quality.{field} must be a number between 0 and 100")

    # Validate fixedCode is a string
    if not isinstance(response['fixedCode'], str):
        raise ResponseValidationError("fixedCode must be a string")


def validate_explain_response(response: Dict[str, Any]) -> None:
    """Validate that an explain response contains required fields."""
    if 'explanation' not in response and 'summary' not in response:
        raise ResponseValidationError("Explain response must contain 'explanation' or 'summary'")

    if 'steps' in response and not isinstance(response['steps'], list):
        raise ResponseValidationError("Steps must be an array")

    if 'lineExplanations' in response and not isinstance(response['lineExplanations'], list):
        raise ResponseValidationError("lineExplanations must be an array")


def validate_fix_response(response: Dict[str, Any]) -> None:
    """Validate that a fix response contains all required fields."""
    if 'fixedCode' not in response or not isinstance(response['fixedCode'], str):
        raise ResponseValidationError("fixedCode must be a string")

    if 'changes' not in response or not isinstance(response['changes'], list):
        raise ResponseValidationError("Changes must be an array")


def validate_debug_response(response: Dict[str, Any]) -> None:
    """Validate that a debug response contains all required fields."""
    required = ['rootCause', 'fixedCode']
    missing = [f for f in required if f not in response]
    if missing:
        raise ResponseValidationError(f"Debug response missing required fields: {', '.join(missing)}")

    if not isinstance(response['fixedCode'], str):
        raise ResponseValidationError("fixedCode must be a string")


def validate_refactor_response(response: Dict[str, Any]) -> None:
    """Validate that a refactor response contains all required fields."""
    if 'refactoredCode' not in response or not isinstance(response['refactoredCode'], str):
        raise ResponseValidationError("refactoredCode must be a string")

    if 'changes' not in response or not isinstance(response['changes'], list):
        raise ResponseValidationError("changes must be an array")


def validate_security_response(response: Dict[str, Any]) -> None:
    """Validate that a security response contains all required fields."""
    if 'issues' not in response or not isinstance(response['issues'], list):
        raise ResponseValidationError("issues must be an array")

    if 'overallRisk' not in response:
        response['overallRisk'] = 'medium'