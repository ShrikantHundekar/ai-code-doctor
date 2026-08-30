"""Database package"""
from .models import db, User, Review, Preference
from .db import (
    init_db,
    get_user_by_email,
    get_user_by_id,
    create_user,
    save_review,
    save_comparison_review,
    get_user_reviews,
    get_review_by_id,
    delete_review,
    get_review_versions,
    get_user_provider_stats,
    compare_two_reviews,
    get_user_stats
)

__all__ = [
    'db',
    'User',
    'Review',
    'Preference',
    'init_db',
    'get_user_by_email',
    'get_user_by_id',
    'create_user',
    'save_review',
    'save_comparison_review',
    'get_user_reviews',
    'get_review_by_id',
    'delete_review',
    'get_review_versions',
    'get_user_provider_stats',
    'compare_two_reviews',
    'get_user_stats'
]
