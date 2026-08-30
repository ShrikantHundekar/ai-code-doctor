"""Authentication routes"""
import re
from functools import wraps
from flask import Blueprint, request, jsonify, session
from database import db, get_user_by_email, get_user_by_id, create_user, User, Preference

auth_bp = Blueprint('auth', __name__)

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Password requirements
MIN_PASSWORD_LENGTH = 6


def validate_email(email):
    """Validate email format"""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email))


def validate_password(password):
    """Validate password meets minimum requirements"""
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
    return True, None


def validate_name(name):
    """Validate name"""
    if not name or not isinstance(name, str):
        return False, "Name is required."
    if len(name.strip()) < 2:
        return False, "Name must be at least 2 characters long."
    if len(name) > 120:
        return False, "Name is too long."
    return True, None


def login_required(f):
    """Decorator to require authentication for a route"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Authentication required. Please log in."}), 401
        user = get_user_by_id(user_id)
        if not user:
            session.clear()
            return jsonify({"error": "Session expired. Please log in again."}), 401
        # Attach user to request context
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """
    Register a new user.

    Request:
    {
        "name": "John",
        "email": "john@example.com",
        "password": "password"
    }

    Response:
    {
        "message": "Registration successful",
        "user": { "id": 1, "name": "John", "email": "john@example.com" }
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Validate name
    valid, error = validate_name(name)
    if not valid:
        return jsonify({"error": error}), 400

    # Validate email
    if not validate_email(email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    # Validate password
    valid, error = validate_password(password)
    if not valid:
        return jsonify({"error": error}), 400

    # Check if email already exists
    if get_user_by_email(email):
        return jsonify({"error": "An account with this email already exists."}), 409

    # Create user
    try:
        user = create_user(name, email, password)
        # Auto-login after registration
        session['user_id'] = user.id
        session.permanent = True

        return jsonify({
            "message": "Registration successful",
            "user": user.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"error": "Failed to create account. Please try again."}), 500


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    Login user.

    Request:
    {
        "email": "john@example.com",
        "password": "password"
    }

    Response:
    {
        "message": "Login successful",
        "user": { ... }
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    # Find user
    user = get_user_by_email(email)
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    # Set session
    session['user_id'] = user.id
    session.permanent = True

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict()
    }), 200


@auth_bp.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """
    Logout current user.

    Response:
    { "message": "Logout successful" }
    """
    session.clear()
    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """
    Get current authenticated user.

    Response:
    {
        "user": { ... }
    }
    """
    return jsonify({
        "user": request.current_user.to_dict()
    }), 200


@auth_bp.route('/api/auth/profile', methods=['PUT'])
@login_required
def update_profile():
    """
    Update user profile (name only).

    Request:
    {
        "name": "New Name"
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    name = data.get('name', '').strip()
    valid, error = validate_name(name)
    if not valid:
        return jsonify({"error": error}), 400

    user = request.current_user
    user.name = name
    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200


@auth_bp.route('/api/auth/account', methods=['DELETE'])
@login_required
def delete_account():
    """
    Delete user account and all associated reviews.
    """
    user = request.current_user
    try:
        # Delete user (cascade will delete reviews and preferences)
        db.session.delete(user)
        db.session.commit()
        session.clear()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete account. Please try again."}), 500


@auth_bp.route('/api/auth/preferences', methods=['GET'])
@login_required
def get_preferences():
    """Get user preferences"""
    user = request.current_user
    if not user.preferences:
        # Create default preferences
        prefs = Preference(user_id=user.id)
        db.session.add(prefs)
        db.session.commit()
    return jsonify(user.preferences.to_dict()), 200


@auth_bp.route('/api/auth/preferences', methods=['PUT'])
@login_required
def update_preferences():
    """
    Update user preferences.

    Request:
    {
        "defaultProvider": "openai",
        "defaultLanguage": "python",
        "theme": "dark"
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required."}), 400

    user = request.current_user
    if not user.preferences:
        user.preferences = Preference(user_id=user.id)

    if 'defaultProvider' in data:
        provider = data['defaultProvider'].lower()
        if provider in ['openai', 'claude', 'gemini']:
            user.preferences.default_provider = provider
    if 'defaultLanguage' in data:
        user.preferences.default_language = data['defaultLanguage']
    if 'theme' in data:
        user.preferences.theme = data['theme']

    db.session.commit()
    return jsonify(user.preferences.to_dict()), 200
