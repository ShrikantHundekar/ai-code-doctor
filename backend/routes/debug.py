"""Debug routes - protected"""
from flask import Blueprint, request, jsonify
from utils.validators import validate_debug_request
from services.ai_service import ai_service
from routes.auth import login_required

debug_bp = Blueprint('debug', __name__)


@debug_bp.route('/api/debug', methods=['POST'])
@login_required
def debug_code():
    """
    Debug code and error (authenticated).

    Request:
    {
        "language": "python",
        "code": "...",
        "error": "IndexError: list index out of range",
        "stackTrace": "...", // optional
        "provider": "openai" // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    is_valid, error_msg = validate_debug_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    language = data['language'].lower()
    code = data['code']
    error = data['error']
    stack_trace = data.get('stackTrace', '')
    provider_name = data.get('provider')

    try:
        result = ai_service.debug_code(
            language=language,
            code=code,
            error=error,
            stack_trace=stack_trace,
            provider_name=provider_name
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred during debugging: {e}"}), 500

    return jsonify(result), 200
