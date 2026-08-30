"""Explain routes - protected"""
from flask import Blueprint, request, jsonify
from utils.validators import validate_explain_request
from services.ai_service import ai_service
from routes.auth import login_required

explain_bp = Blueprint('explain', __name__)


@explain_bp.route('/api/explain', methods=['POST'])
@login_required
def explain_code():
    """
    Explain code (authenticated).

    Request:
    {
        "language": "python",
        "code": "...",
        "level": "beginner|intermediate|advanced", // optional
        "provider": "openai" // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    is_valid, error_msg = validate_explain_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    language = data['language'].lower()
    code = data['code']
    provider_name = data.get('provider')
    level = data.get('level', 'intermediate')

    try:
        result = ai_service.explain_code(
            language=language,
            code=code,
            provider_name=provider_name,
            level=level
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred during explanation: {e}"}), 500

    return jsonify(result), 200
