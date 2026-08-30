"""Routes package"""
from .review import review_bp
from .explain import explain_bp
from .fix import fix_bp
from .history import history_bp
from .auth import auth_bp
from .compare import compare_bp
from .debug import debug_bp
from .refactor import refactor_bp
from .security import security_bp

__all__ = [
    'review_bp',
    'explain_bp',
    'fix_bp',
    'history_bp',
    'auth_bp',
    'compare_bp',
    'debug_bp',
    'refactor_bp',
    'security_bp'
]
