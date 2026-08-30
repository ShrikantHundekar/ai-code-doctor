from config import Config

def _validate_common_code(data):
    if not data:
        return False, "Request body is required."

    if 'language' not in data:
        return False, "Language is required."

    if 'code' not in data:
        return False, "Code is required."

    code = data.get('code', '')
    if not code or not code.strip():
        return False, "Code cannot be empty."

    language = data.get('language', '').lower()
    if language not in Config.SUPPORTED_LANGUAGES:
        return False, f"Unsupported programming language. Supported: {', '.join(Config.SUPPORTED_LANGUAGES)}"

    if len(code) > Config.MAX_CODE_LENGTH:
        return False, f"Code exceeds the maximum allowed size of {Config.MAX_CODE_LENGTH} characters."

    provider = data.get('provider')
    if provider and provider.lower() not in Config.SUPPORTED_PROVIDERS:
        return False, f"Unsupported AI provider: {provider}. Supported: {', '.join(Config.SUPPORTED_PROVIDERS)}"

    return True, None


def validate_review_request(data):
    """Validate review request data."""
    return _validate_common_code(data)


def validate_explain_request(data):
    """Validate explain request data."""
    is_valid, msg = _validate_common_code(data)
    if not is_valid:
        return False, msg

    level = data.get('level')
    if level and level.lower() not in ['beginner', 'intermediate', 'advanced']:
        return False, "Invalid explanation level. Supported: beginner, intermediate, advanced."

    return True, None


def validate_fix_request(data):
    """Validate fix request data."""
    return _validate_common_code(data)


def validate_debug_request(data):
    """Validate debug request data."""
    is_valid, msg = _validate_common_code(data)
    if not is_valid:
        return False, msg

    if 'error' not in data or not str(data.get('error', '')).strip():
        return False, "Error message is required for debugging."

    return True, None


def validate_refactor_request(data):
    """Validate refactor request data."""
    is_valid, msg = _validate_common_code(data)
    if not is_valid:
        return False, msg

    goals = data.get('goals')
    if goals is not None and not isinstance(goals, list):
        return False, "Goals must be a list of strings."

    return True, None


def validate_security_request(data):
    """Validate security scan request data."""
    return _validate_common_code(data)


def validate_compare_request(data):
    """Validate multi-AI compare request data."""
    is_valid, msg = _validate_common_code(data)
    if not is_valid:
        return False, msg

    providers = data.get('providers')
    if not providers or not isinstance(providers, list):
        return False, "providers field must be a list of provider names."

    if len(providers) < 2:
        return False, "Multi-AI comparison requires at least 2 providers."

    max_providers = getattr(Config, 'MAX_PROVIDERS_PER_COMPARISON', 3)
    if len(providers) > max_providers:
        return False, f"At most {max_providers} providers can be compared simultaneously."

    for p in providers:
        if not isinstance(p, str) or p.lower() not in Config.SUPPORTED_PROVIDERS:
            return False, f"Invalid provider '{p}'. Supported: {', '.join(Config.SUPPORTED_PROVIDERS)}"

    if len(set(p.lower() for p in providers)) != len(providers):
        return False, "Duplicate providers in comparison list."

    return True, None
