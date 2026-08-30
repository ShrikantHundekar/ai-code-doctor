"""Security routes - protected"""
from flask import Blueprint, request, jsonify
from utils.validators import validate_security_request
from services.ai_service import ai_service
from routes.auth import login_required

security_bp = Blueprint('security', __name__)


@security_bp.route('/api/security-scan', methods=['POST'])
@login_required
def security_scan():
    """
    Perform security vulnerability scan on code (authenticated).

    Request:
    {
        "language": "python",
        "code": "...",
        "provider": "openai" // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    is_valid, error_msg = validate_security_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    language = data['language'].lower()
    code = data['code']
    provider_name = data.get('provider')

    try:
        result = ai_service.security_scan(
            language=language,
            code=code,
            provider_name=provider_name
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred during security scan: {e}"}), 500

    return jsonify(result), 200
