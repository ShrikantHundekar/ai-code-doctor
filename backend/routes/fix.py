"""Fix routes - protected"""
from flask import Blueprint, request, jsonify
from utils.validators import validate_fix_request
from services.ai_service import ai_service
from routes.auth import login_required

fix_bp = Blueprint('fix', __name__)


@fix_bp.route('/api/fix', methods=['POST'])
@login_required
def fix_code():
    """Fix code (authenticated)"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    is_valid, error_msg = validate_fix_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    language = data['language'].lower()
    code = data['code']
    provider_name = data.get('provider')

    try:
        result = ai_service.fix_code(language, code, provider_name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred during fix"}), 500

    return jsonify(result), 200


@fix_bp.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404


@fix_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405
