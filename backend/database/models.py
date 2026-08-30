"""Database models using SQLAlchemy"""
import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reviews = db.relationship('Review', backref='user', lazy=True, cascade='all, delete-orphan')
    preferences = db.relationship('Preference', backref='user', uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert to dictionary (exclude sensitive fields)"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'totalReviews': len(self.reviews)
        }


class Review(db.Model):
    """Review model for code reviews, multi-AI comparisons, and analysis modes"""
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    provider = db.Column(db.String(50))
    model = db.Column(db.String(100))
    code = db.Column(db.Text, nullable=False)
    fixed_code = db.Column(db.Text)
    score = db.Column(db.Integer)
    summary = db.Column(db.Text)
    bugs = db.Column(db.Text)  # JSON string
    warnings = db.Column(db.Text)  # JSON string
    security_issues = db.Column(db.Text)  # JSON string
    suggestions = db.Column(db.Text)  # JSON string
    complexity = db.Column(db.Text)  # JSON string
    quality = db.Column(db.Text)  # JSON string
    review_result = db.Column(db.Text)  # Full JSON result

    # Phase 6 Extended Fields
    analysis_type = db.Column(db.String(50), default='single', index=True)
    providers_used = db.Column(db.Text)  # JSON string list e.g. ["openai", "claude"]
    comparison_result = db.Column(db.Text)  # JSON string of comparison summary
    parent_review_id = db.Column(db.Integer, nullable=True, index=True)
    version = db.Column(db.Integer, default=1)
    improvement_plan = db.Column(db.Text)  # JSON string of structured priority plan

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary for API response"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'language': self.language,
            'provider': self.provider,
            'model': self.model,
            'score': self.score,
            'summary': self.summary,
            'bugs': json.loads(self.bugs) if self.bugs else [],
            'warnings': json.loads(self.warnings) if self.warnings else [],
            'securityIssues': json.loads(self.security_issues) if self.security_issues else [],
            'suggestions': json.loads(self.suggestions) if self.suggestions else [],
            'complexity': json.loads(self.complexity) if self.complexity else {},
            'quality': json.loads(self.quality) if self.quality else {},
            'code': self.code,
            'fixedCode': self.fixed_code,
            'analysisType': self.analysis_type or 'single',
            'providersUsed': json.loads(self.providers_used) if self.providers_used else [],
            'comparisonResult': json.loads(self.comparison_result) if self.comparison_result else None,
            'parentReviewId': self.parent_review_id,
            'version': self.version or 1,
            'improvementPlan': json.loads(self.improvement_plan) if self.improvement_plan else [],
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

    def to_summary(self):
        """Summary version for list views"""
        return {
            'id': self.id,
            'title': self.title,
            'language': self.language,
            'provider': self.provider,
            'model': self.model,
            'score': self.score,
            'analysisType': self.analysis_type or 'single',
            'providersUsed': json.loads(self.providers_used) if self.providers_used else [],
            'parentReviewId': self.parent_review_id,
            'version': self.version or 1,
            'bugCount': len(json.loads(self.bugs)) if self.bugs else 0,
            'warningCount': len(json.loads(self.warnings)) if self.warnings else 0,
            'date': self.created_at.isoformat() if self.created_at else None,
            'status': 'completed'
        }


class Preference(db.Model):
    """User preferences"""
    __tablename__ = 'preferences'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    default_provider = db.Column(db.String(50), default='openai')
    default_language = db.Column(db.String(50), default='python')
    theme = db.Column(db.String(20), default='dark')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'defaultProvider': self.default_provider,
            'defaultLanguage': self.default_language,
            'theme': self.theme
        }
