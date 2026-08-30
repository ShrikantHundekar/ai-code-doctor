"""Comprehensive automated test suite for AI Code Doctor Phase 6"""
import unittest
import json
import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.models import db, User, Review
from services.comparison_engine import ComparisonEngine
from services.comparison_service import comparison_service


class Phase6TestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False

    def setUp(self):
        self.app = app.test_client()

        with app.app_context():
            user = User.query.filter_by(email="test_phase6@example.com").first()
            if not user:
                user = User(name="Tester", email="test_phase6@example.com")
                user.set_password("Password123!")
                db.session.add(user)
                db.session.commit()
            self.user_id = user.id

        # Login session
        with self.app.session_transaction() as sess:
            sess['user_id'] = self.user_id

    def tearDown(self):
        with app.app_context():
            # Clean up reviews created during test
            Review.query.filter_by(user_id=self.user_id).delete()
            db.session.commit()

    # 1. Health & Providers
    def test_health_check(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['version'], '6.0.0')

    def test_get_providers(self):
        response = self.app.get('/api/providers')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('providers', data)
        p_ids = [p['id'] for p in data['providers']]
        self.assertIn('openai', p_ids)
        self.assertIn('claude', p_ids)
        self.assertIn('gemini', p_ids)

    # 2. Single AI Review + Improvement Plan + Versioning
    def test_single_review_with_improvement_plan(self):
        payload = {
            "language": "python",
            "code": "def calc(x):\n    return x + 1",
            "provider": "openai"
        }
        response = self.app.post('/api/review', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('score', data)
        self.assertIn('improvementPlan', data)
        self.assertIn('version', data)
        self.assertEqual(data['version'], 1)

    def test_review_versioning_chain(self):
        # Version 1
        res1 = self.app.post('/api/review', json={
            "language": "python",
            "code": "def calc(x):\n    return x + 1"
        })
        d1 = res1.get_json()
        r1_id = d1['id']

        # Version 2
        res2 = self.app.post('/api/review', json={
            "language": "python",
            "code": "def calc(x: int) -> int:\n    return x + 1",
            "parentReviewId": r1_id
        })
        d2 = res2.get_json()
        self.assertEqual(d2['version'], 2)
        self.assertEqual(d2['parentReviewId'], r1_id)

        # Retrieve versions timeline
        v_res = self.app.get(f'/api/reviews/{r1_id}/versions')
        self.assertEqual(v_res.status_code, 200)
        v_data = v_res.get_json()
        self.assertEqual(len(v_data['versions']), 2)

    # 3. Multi-AI Comparison Tests
    def test_multi_ai_compare_two_providers(self):
        payload = {
            "language": "python",
            "code": "def calculate_average(numbers):\n    total = 0\n    for i in range(len(numbers) + 1):\n        total += numbers[i]\n    return total / len(numbers)",
            "providers": ["openai", "claude"]
        }
        response = self.app.post('/api/compare', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['mode'], 'comparison')
        self.assertEqual(len(data['results']), 2)
        self.assertIn('comparison', data)
        comp = data['comparison']
        self.assertIn('bestProvider', comp)
        self.assertIn('averageScore', comp)
        self.assertIn('agreementPercentage', comp)
        self.assertIn('recommendation', comp)

    def test_multi_ai_compare_three_providers(self):
        payload = {
            "language": "python",
            "code": "def calculate_average(numbers):\n    total = 0\n    for i in range(len(numbers) + 1):\n        total += numbers[i]\n    return total / len(numbers)",
            "providers": ["openai", "claude", "gemini"]
        }
        response = self.app.post('/api/compare', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['results']), 3)

    def test_multi_ai_validation_errors(self):
        # Less than 2 providers
        res1 = self.app.post('/api/compare', json={
            "language": "python",
            "code": "def test(): pass",
            "providers": ["openai"]
        })
        self.assertEqual(res1.status_code, 400)

        # Invalid provider name
        res2 = self.app.post('/api/compare', json={
            "language": "python",
            "code": "def test(): pass",
            "providers": ["openai", "invalid_ai"]
        })
        self.assertEqual(res2.status_code, 400)

    # 4. Debugging Tests
    def test_debug_endpoint_valid(self):
        payload = {
            "language": "python",
            "code": "def div(a, b):\n    return a / b",
            "error": "ZeroDivisionError: division by zero",
            "stackTrace": "line 2 in div\nZeroDivisionError"
        }
        response = self.app.post('/api/debug', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('rootCause', data)
        self.assertIn('fixedCode', data)
        self.assertIn('changes', data)

    def test_debug_endpoint_missing_error(self):
        payload = {
            "language": "python",
            "code": "def div(a, b):\n    return a / b"
        }
        response = self.app.post('/api/debug', json=payload)
        self.assertEqual(response.status_code, 400)

    # 5. Explain Endpoint Tests
    def test_explain_levels(self):
        for lvl in ['beginner', 'intermediate', 'advanced']:
            payload = {
                "language": "python",
                "code": "def calculate_average(numbers):\n    return sum(numbers) / len(numbers)",
                "level": lvl
            }
            response = self.app.post('/api/explain', json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertIn('summary', data)
            self.assertIn('explanation', data)

    # 6. Refactor Endpoint Tests
    def test_refactor_goals(self):
        payload = {
            "language": "python",
            "code": "def calculate_average(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i]\n    return total / len(numbers)",
            "goals": ["readability", "performance"]
        }
        response = self.app.post('/api/refactor', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('refactoredCode', data)
        self.assertIn('changes', data)
        self.assertIn('expectedBenefits', data)

    # 7. Security Scan Tests
    def test_security_scan_injection(self):
        payload = {
            "language": "python",
            "code": "import sqlite3\ndef find(name):\n    query = f'SELECT * FROM users WHERE name = {name}'\n    cursor.execute(query)"
        }
        response = self.app.post('/api/security-scan', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('overallRisk', data)
        self.assertIn('issues', data)

    # 8. Provider Stats & Comparison Endpoint
    def test_provider_stats_and_diff(self):
        # Create 2 reviews
        r1 = self.app.post('/api/review', json={
            "language": "python",
            "code": "x = 1"
        }).get_json()

        r2 = self.app.post('/api/review', json={
            "language": "python",
            "code": "x: int = 1"
        }).get_json()

        # Check compare reviews endpoint
        c_res = self.app.get(f'/api/reviews/compare?id1={r1["id"]}&id2={r2["id"]}')
        self.assertEqual(c_res.status_code, 200)
        c_data = c_res.get_json()
        self.assertIn('delta', c_data)

        # Check provider stats endpoint
        stats_res = self.app.get('/api/history/provider-stats')
        self.assertEqual(stats_res.status_code, 200)
        stats_data = stats_res.get_json()
        self.assertIn('stats', stats_data)


if __name__ == '__main__':
    unittest.main()
