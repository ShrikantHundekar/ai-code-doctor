"""Database initialization and helpers"""
import os
import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from .models import db, User, Review, Preference

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///ai_code_doctor.db')


def _migrate_sqlite_schema(app):
    """Ensure SQLite table has the Phase 6 columns without breaking existing data."""
    try:
        with app.app_context():
            with db.engine.connect() as conn:
                res = conn.execute(text("PRAGMA table_info(reviews)"))
                columns = [row[1] for row in res.fetchall()]
                
                new_columns = [
                    ("analysis_type", "TEXT DEFAULT 'single'"),
                    ("providers_used", "TEXT"),
                    ("comparison_result", "TEXT"),
                    ("parent_review_id", "INTEGER"),
                    ("version", "INTEGER DEFAULT 1"),
                    ("improvement_plan", "TEXT")
                ]
                for col_name, col_def in new_columns:
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE reviews ADD COLUMN {col_name} {col_def}"))
                conn.commit()
    except Exception as e:
        print(f"Notice during schema migration: {e}")


def init_db(app):
    """Initialize database with Flask app"""
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    db.init_app(app)

    with app.app_context():
        db.create_all()
        _migrate_sqlite_schema(app)
        print(f"Database initialized: {DATABASE_URL}")


def get_user_by_email(email):
    """Get user by email"""
    return User.query.filter_by(email=email.lower()).first()


def get_user_by_id(user_id):
    """Get user by ID"""
    return db.session.get(User, user_id)


def create_user(name, email, password):
    """Create a new user"""
    user = User(name=name, email=email.lower())
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Create default preferences
    prefs = Preference(user_id=user.id)
    db.session.add(prefs)
    db.session.commit()

    return user


def save_review(user_id, title, language, code, ai_result, parent_review_id=None, version=1, analysis_type='single'):
    """Save a review to the database with improvement plan and versioning support."""
    from services.plan_service import generate_improvement_plan

    improvement_plan = generate_improvement_plan(ai_result)

    review = Review(
        user_id=user_id,
        title=title,
        language=language,
        code=code,
        provider=ai_result.get('provider', 'unknown'),
        model=ai_result.get('model', 'unknown'),
        score=ai_result.get('score', 0),
        summary=ai_result.get('summary', ''),
        bugs=json.dumps(ai_result.get('bugs', [])),
        warnings=json.dumps(ai_result.get('warnings', [])),
        security_issues=json.dumps(ai_result.get('securityIssues', [])),
        suggestions=json.dumps(ai_result.get('suggestions', [])),
        complexity=json.dumps(ai_result.get('complexity', {})),
        quality=json.dumps(ai_result.get('quality', {})),
        fixed_code=ai_result.get('fixedCode', ''),
        analysis_type=analysis_type,
        parent_review_id=parent_review_id,
        version=version,
        improvement_plan=json.dumps(improvement_plan),
        review_result=json.dumps(ai_result)
    )

    db.session.add(review)
    db.session.commit()

    return review


def save_comparison_review(user_id, title, language, code, compare_result, parent_review_id=None):
    """Save a multi-AI comparison to the database."""
    comparison = compare_result.get('comparison', {})
    results = compare_result.get('results', [])

    best_provider = comparison.get('bestProvider', 'multi-ai')
    avg_score = comparison.get('averageScore', 0)
    summary = comparison.get('summary', '')

    providers_used = [r.get('provider') for r in results if r.get('provider')]

    # Synthesize bugs from best or all
    all_bugs = []
    for r in results:
        if r.get('success') and r.get('review', {}).get('bugs'):
            all_bugs.extend(r['review']['bugs'])

    review = Review(
        user_id=user_id,
        title=title,
        language=language,
        code=code,
        provider=f"Multi-AI ({len(providers_used)})",
        model=f"Comparison: {', '.join(providers_used)}",
        score=avg_score,
        summary=summary,
        bugs=json.dumps(all_bugs),
        warnings=json.dumps([]),
        security_issues=json.dumps([]),
        suggestions=json.dumps([comparison.get('recommendation', '')]),
        complexity=json.dumps(comparison.get('complexityComparison', {})),
        quality=json.dumps({}),
        fixed_code=comparison.get('suggestedFixes', {}).get(best_provider, ''),
        analysis_type='comparison',
        providers_used=json.dumps(providers_used),
        comparison_result=json.dumps(comparison),
        parent_review_id=parent_review_id,
        version=1,
        review_result=json.dumps(compare_result)
    )

    db.session.add(review)
    db.session.commit()

    return review


def get_user_reviews(user_id, search=None, language=None, provider=None,
                      analysis_type=None, sort='newest', page=1, limit=10):
    """Get reviews for a specific user with filtering and pagination"""
    query = Review.query.filter_by(user_id=user_id)

    # Search filter
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            db.or_(
                Review.title.ilike(search_term),
                Review.language.ilike(search_term),
                Review.provider.ilike(search_term)
            )
        )

    # Language filter
    if language and language != 'all':
        query = query.filter(Review.language == language)

    # Provider filter
    if provider and provider != 'all':
        query = query.filter(Review.provider == provider)

    # Analysis type filter
    if analysis_type and analysis_type != 'all':
        query = query.filter(Review.analysis_type == analysis_type)

    # Sorting
    if sort == 'highest':
        query = query.order_by(Review.score.desc())
    elif sort == 'lowest':
        query = query.order_by(Review.score.asc())
    elif sort == 'oldest':
        query = query.order_by(Review.created_at.asc())
    else:  # newest
        query = query.order_by(Review.created_at.desc())

    # Pagination
    total = query.count()
    reviews = query.offset((page - 1) * limit).limit(limit).all()

    return {
        'reviews': [r.to_summary() for r in reviews],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': (total + limit - 1) // limit
    }


def get_review_by_id(review_id, user_id):
    """Get a specific review, ensuring it belongs to the user"""
    return Review.query.filter_by(id=review_id, user_id=user_id).first()


def delete_review(review_id, user_id):
    """Delete a review, ensuring ownership"""
    review = get_review_by_id(review_id, user_id)
    if not review:
        return False
    db.session.delete(review)
    db.session.commit()
    return True


def get_review_versions(review_id, user_id):
    """Get all versions in a review lineage for the user."""
    target_review = get_review_by_id(review_id, user_id)
    if not target_review:
        return []

    # Find root review
    root_id = target_review.parent_review_id if target_review.parent_review_id else target_review.id

    # Retrieve all reviews matching root or child
    chain = Review.query.filter(
        Review.user_id == user_id,
        db.or_(Review.id == root_id, Review.parent_review_id == root_id)
    ).order_by(Review.version.asc(), Review.created_at.asc()).all()

    return [r.to_dict() for r in chain]


def get_user_provider_stats(user_id):
    """Get user's personal provider historical review stats."""
    reviews = Review.query.filter_by(user_id=user_id).all()
    stats = {
        'openai': {'reviews': 0, 'totalScore': 0, 'averageScore': 0},
        'claude': {'reviews': 0, 'totalScore': 0, 'averageScore': 0},
        'gemini': {'reviews': 0, 'totalScore': 0, 'averageScore': 0},
        'comparison': {'reviews': 0, 'totalScore': 0, 'averageScore': 0}
    }

    for rev in reviews:
        ptype = (rev.provider or '').lower()
        if 'openai' in ptype:
            key = 'openai'
        elif 'claude' in ptype:
            key = 'claude'
        elif 'gemini' in ptype:
            key = 'gemini'
        elif rev.analysis_type == 'comparison' or 'multi' in ptype:
            key = 'comparison'
        else:
            continue

        stats[key]['reviews'] += 1
        stats[key]['totalScore'] += (rev.score or 0)

    for k, v in stats.items():
        if v['reviews'] > 0:
            v['averageScore'] = round(v['totalScore'] / v['reviews'])

    return stats


def compare_two_reviews(id1, id2, user_id):
    """Compare two reviews and calculate deltas for score, bugs, security, quality."""
    rev1 = get_review_by_id(id1, user_id)
    rev2 = get_review_by_id(id2, user_id)

    if not rev1 or not rev2:
        return None

    r1_dict = rev1.to_dict()
    r2_dict = rev2.to_dict()

    score_diff = (r2_dict.get('score', 0) or 0) - (r1_dict.get('score', 0) or 0)
    bug_diff = len(r2_dict.get('bugs', [])) - len(r1_dict.get('bugs', []))
    security_diff = len(r2_dict.get('securityIssues', [])) - len(r1_dict.get('securityIssues', []))

    q1 = r1_dict.get('quality', {})
    q2 = r2_dict.get('quality', {})
    quality_diff = {
        metric: (q2.get(metric, 0) or 0) - (q1.get(metric, 0) or 0)
        for metric in ['readability', 'maintainability', 'performance', 'security']
    }

    return {
        "reviewA": r1_dict,
        "reviewB": r2_dict,
        "delta": {
            "score": score_diff,
            "bugs": bug_diff,
            "security": security_diff,
            "quality": quality_diff,
            "improved": score_diff >= 0
        }
    }


def get_user_stats(user_id):
    """Get dashboard statistics for a user"""
    reviews = Review.query.filter_by(user_id=user_id).all()

    if not reviews:
        return {
            'totalReviews': 0,
            'totalBugs': 0,
            'averageScore': 0,
            'criticalIssues': 0
        }

    total_reviews = len(reviews)
    total_bugs = 0
    critical_issues = 0
    score_sum = 0

    for review in reviews:
        if review.score:
            score_sum += review.score
        if review.bugs:
            bugs = json.loads(review.bugs)
            total_bugs += len(bugs)
            for bug in bugs:
                if isinstance(bug, dict) and bug.get('severity', '').lower() in ['high', 'critical']:
                    critical_issues += 1

    return {
        'totalReviews': total_reviews,
        'totalBugs': total_bugs,
        'averageScore': round(score_sum / total_reviews) if total_reviews > 0 else 0,
        'criticalIssues': critical_issues
    }
