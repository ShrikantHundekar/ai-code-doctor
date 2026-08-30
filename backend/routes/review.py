"""Review routes - protected, user-specific"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.validators import validate_review_request
from services.ai_service import ai_service
from services.plan_service import generate_improvement_plan
from database import save_review, get_review_by_id
from routes.auth import login_required

review_bp = Blueprint('review', __name__)


@review_bp.route('/api/review', methods=['POST'])
@login_required
def review_code():
    """
    Analyze submitted source code (authenticated).

    Request:
    {
        "language": "python",
        "code": "...",
        "provider": "openai",  // optional
        "title": "My Review",  // optional
        "parentReviewId": 12,  // optional for versioning
        "version": 2           // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    # Validate the request
    is_valid, error_msg = validate_review_request(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    # Extract parameters
    language = data['language'].lower()
    code = data['code']
    provider_name = data.get('provider')
    title = data.get('title', '').strip()
    parent_review_id = data.get('parentReviewId')
    version = data.get('version')

    # If parentReviewId is given, resolve parent and determine version
    if parent_review_id:
        parent = get_review_by_id(parent_review_id, request.current_user.id)
        if parent:
            if not version:
                version = (parent.version or 1) + 1
            if not title:
                title = f"{parent.title} (v{version})"
        else:
            parent_review_id = None
            version = 1

    if not version:
        version = 1

    # Default title
    if not title:
        timestamp = datetime.now().strftime("%b %d, %Y")
        title = f"{language.capitalize()} Code Review - {timestamp}"

    # Use AI service to analyze code
    try:
        result = ai_service.analyze_code(language, code, provider_name)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred during analysis: {e}"}), 500

    # Attach improvement plan
    improvement_plan = generate_improvement_plan(result)
    result['improvementPlan'] = improvement_plan
    result['version'] = version
    result['parentReviewId'] = parent_review_id

    # Save review to database
    try:
        review = save_review(
            user_id=request.current_user.id,
            title=title,
            language=language,
            code=code,
            ai_result=result,
            parent_review_id=parent_review_id,
            version=version,
            analysis_type='single'
        )
        result['id'] = review.id
        result['title'] = review.title
    except Exception as e:
        return jsonify({"error": "Unable to save your review. Please try again."}), 500

    return jsonify(result), 200
