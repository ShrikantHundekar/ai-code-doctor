"""Refactor routes - protected"""
from flask import Blueprint, request, jsonify
from utils.validators import validate_refactor_request
from services.ai_service import ai_service
from routes.auth import login_required

refactor_bp = Blueprint('refactor', __name__)


@refactor_bp.route('/api/refactor', methods=['POST'])
@login_required
def refactor_code():
    """
    Refactor code according to specified goals (authenticated).

    Request:
    {
        "language": "python",
        "code": "...",
        "goals": ["readability", "performance", "maintainability"],
        "provider": "openai" // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    is_valid, error_msg = validate_refactor_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    language = data['language'].lower()
    code = data['code']
    goals = data.get('goals')
    provider_name = data.get('provider')

    try:
        result = ai_service.refactor_code(
            language=language,
            code=code,
            goals=goals,
            provider_name=provider_name
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred during refactoring: {e}"}), 500

    return jsonify(result), 200
