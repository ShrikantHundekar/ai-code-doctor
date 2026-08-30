"""AI Code Doctor - Main Flask Application (Phase 6)"""
import os
from datetime import timedelta
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from config import Config
from database import init_db
from ai import ProviderManager

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production-please')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'

# Enable CORS with credentials support
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS(app,
     resources={r"/api/*": {"origins": [FRONTEND_URL, "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]}},
     supports_credentials=True)

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[],
    storage_uri="memory://"
)

# Initialize database
init_db(app)

# Register blueprints
from routes import (
    review_bp,
    explain_bp,
    fix_bp,
    history_bp,
    auth_bp,
    compare_bp,
    debug_bp,
    refactor_bp,
    security_bp
)
app.register_blueprint(review_bp)
app.register_blueprint(explain_bp)
app.register_blueprint(fix_bp)
app.register_blueprint(history_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(compare_bp)
app.register_blueprint(debug_bp)
app.register_blueprint(refactor_bp)
app.register_blueprint(security_bp)

# Apply rate limiting to AI endpoints
ai_rate_limit = os.getenv('AI_RATE_LIMIT', '10/minute')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint (public)"""
    return jsonify({
        "status": "ok",
        "message": "AI Code Doctor backend is running",
        "version": "6.0.0"
    }), 200


@app.route('/api/providers', methods=['GET'])
def get_providers():
    """Get available AI providers (public)"""
    providers_info = ProviderManager.get_available_providers()
    providers_list = list(providers_info.values())
    return jsonify({
        "providers": providers_list,
        "default": Config.DEFAULT_AI_PROVIDER
    }), 200


# Security headers
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response


# Centralized error handling
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request. Please check your input."}), 400


@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Authentication required. Please log in."}), 401


@app.errorhandler(403)
def forbidden(error):
    return jsonify({"error": "Access denied."}), 403


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(409)
def conflict(error):
    return jsonify({"error": "Resource conflict. The resource already exists."}), 409


@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({
        "error": "Too many requests. Please slow down and try again later."
    }), 429


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "An unexpected server error occurred."}), 500


@app.errorhandler(503)
def service_unavailable(error):
    return jsonify({"error": "Service temporarily unavailable. Please try again later."}), 503


@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "name": "AI Code Doctor API",
        "version": "6.0.0",
        "status": "running",
        "endpoints": {
            "health": "GET /api/health",
            "providers": "GET /api/providers",
            "auth": {
                "register": "POST /api/auth/register",
                "login": "POST /api/auth/login",
                "logout": "POST /api/auth/logout",
                "me": "GET /api/auth/me"
            },
            "review": "POST /api/review",
            "compare": "POST /api/compare",
            "debug": "POST /api/debug",
            "explain": "POST /api/explain",
            "refactor": "POST /api/refactor",
            "security": "POST /api/security-scan",
            "fix": "POST /api/fix",
            "reviews": "GET /api/reviews",
            "review_by_id": "GET /api/reviews/<id>",
            "review_versions": "GET /api/reviews/<id>/versions",
            "compare_reviews": "GET /api/reviews/compare",
            "provider_stats": "GET /api/history/provider-stats",
            "delete_review": "DELETE /api/reviews/<id>",
            "dashboard_stats": "GET /api/dashboard/stats"
        }
    }), 200


# Apply rate limits
@app.before_request
def apply_rate_limits():
    """Apply rate limits to AI endpoints"""
    ai_endpoints = [
        'review.review_code',
        'compare.compare_code',
        'debug.debug_code',
        'explain.explain_code',
        'refactor.refactor_code',
        'security.security_scan',
        'fix.fix_code'
    ]
    if request.endpoint in ai_endpoints:
        try:
            limiter.limit(ai_rate_limit)(lambda: None)()
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Serve React frontend in production (built files from ../dist)
# ---------------------------------------------------------------------------
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')

if os.path.isdir(DIST_DIR):
    from flask import send_from_directory

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        """Serve React SPA — static files first, then index.html for client-side routing."""
        full_path = os.path.join(DIST_DIR, path)
        if path and os.path.isfile(full_path):
            return send_from_directory(DIST_DIR, path)
        return send_from_directory(DIST_DIR, 'index.html')


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV') == 'development' and os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    print("=" * 50)
    print("AI Code Doctor Backend - Phase 6")
    print("=" * 50)
    print(f"Available at: http://localhost:{port}")
    print(f"API Health Check: http://localhost:{port}/api/health")
    print(f"AI Mock Mode: {'ON' if Config.AI_MOCK_MODE else 'OFF'}")
    print(f"Default AI Provider: {Config.DEFAULT_AI_PROVIDER}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=port, debug=debug_mode)

