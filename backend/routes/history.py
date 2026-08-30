"""History routes - protected, user-specific"""
from flask import Blueprint, request, jsonify
from database import (
    get_user_reviews,
    get_review_by_id,
    delete_review,
    get_user_stats,
    get_review_versions,
    get_user_provider_stats,
    compare_two_reviews
)
from routes.auth import login_required

history_bp = Blueprint('history', __name__)


@history_bp.route('/api/reviews', methods=['GET'])
@login_required
def get_reviews():
    """
    Get current user's reviews with filtering, search, pagination, and analysis type.
    """
    search = request.args.get('search', '').strip() or None
    language = request.args.get('language', '').strip() or None
    provider = request.args.get('provider', '').strip() or None
    analysis_type = request.args.get('analysis_type', '').strip() or None
    sort = request.args.get('sort', 'newest').strip()
    page = int(request.args.get('page', 1))
    limit = min(int(request.args.get('limit', 10)), 100)

    try:
        result = get_user_reviews(
            user_id=request.current_user.id,
            search=search,
            language=language,
            provider=provider,
            analysis_type=analysis_type,
            sort=sort,
            page=page,
            limit=limit
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Unable to fetch reviews: {e}"}), 500


@history_bp.route('/api/reviews/<int:review_id>', methods=['GET'])
@login_required
def get_review(review_id):
    """Get a single review (only if owned by current user)"""
    review = get_review_by_id(review_id, request.current_user.id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    return jsonify(review.to_dict()), 200


@history_bp.route('/api/reviews/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review_route(review_id):
    """Delete a review (only if owned by current user)"""
    if delete_review(review_id, request.current_user.id):
        return jsonify({"message": "Review deleted successfully"}), 200
    return jsonify({"error": "Review not found"}), 404


@history_bp.route('/api/reviews/<int:review_id>/versions', methods=['GET'])
@login_required
def get_versions(review_id):
    """Get version timeline for a review chain."""
    versions = get_review_versions(review_id, request.current_user.id)
    return jsonify({"versions": versions}), 200


@history_bp.route('/api/reviews/compare', methods=['GET'])
@login_required
def compare_reviews_endpoint():
    """Compare two reviews owned by the current user."""
    id1 = request.args.get('id1', type=int)
    id2 = request.args.get('id2', type=int)

    if not id1 or not id2:
        return jsonify({"error": "Both id1 and id2 parameters are required."}), 400

    comparison = compare_two_reviews(id1, id2, request.current_user.id)
    if not comparison:
        return jsonify({"error": "One or both reviews were not found or not owned by you."}), 404

    return jsonify(comparison), 200


@history_bp.route('/api/history/provider-stats', methods=['GET'])
@login_required
def get_provider_stats_endpoint():
    """Get logged-in user's historical AI provider performance statistics."""
    try:
        stats = get_user_provider_stats(request.current_user.id)
        return jsonify({"stats": stats}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to calculate provider statistics: {e}"}), 500


@history_bp.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    """Get dashboard statistics for current user"""
    try:
        stats = get_user_stats(request.current_user.id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": "Unable to fetch dashboard statistics."}), 500
