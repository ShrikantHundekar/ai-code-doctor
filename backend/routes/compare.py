"""Multi-AI Comparison routes - protected"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.validators import validate_compare_request
from services.comparison_service import comparison_service
from database import save_comparison_review
from routes.auth import login_required

compare_bp = Blueprint('compare', __name__)


@compare_bp.route('/api/compare', methods=['POST'])
@login_required
def compare_code():
    """
    Compare code analysis across multiple AI providers (authenticated).

    Request:
    {
        "language": "python",
        "code": "...",
        "providers": ["openai", "claude", "gemini"],
        "title": "Multi-AI Comparison" // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    is_valid, error_msg = validate_compare_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    language = data['language'].lower()
    code = data['code']
    providers = data['providers']
    title = data.get('title', '').strip()

    if not title:
        timestamp = datetime.now().strftime("%b %d, %Y")
        title = f"{language.capitalize()} Multi-AI Review - {timestamp}"

    try:
        comparison_response = comparison_service.compare_code(
            language=language,
            code=code,
            providers=providers
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred during multi-AI comparison: {e}"}), 500

    # Save to database
    try:
        saved_review = save_comparison_review(
            user_id=request.current_user.id,
            title=title,
            language=language,
            code=code,
            compare_result=comparison_response,
            parent_review_id=data.get('parentReviewId')
        )
        comparison_response['id'] = saved_review.id
        comparison_response['title'] = saved_review.title
    except Exception as e:
        # If saving fails, still return comparison output
        print(f"Warning: Failed to save comparison review: {e}")

    return jsonify(comparison_response), 200
