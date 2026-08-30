# AI Code Doctor API

## Overview
AI Code Doctor is an AI-powered code review and debugging platform. This is the Flask backend for Phase 2.

## Base URL
- Development: `http://localhost:5000`

## Health Check

### GET /api/health

Check if the backend is running.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Code Doctor backend is running"
}
```

## Code Review

### POST /api/review

Analyze submitted source code.

**Request:**
```json
{
  "language": "python",
  "code": "def find_average(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i]\n    return total / len(numbers)"
}
```

**Response:**
```json
{
  "score": 72,
  "summary": "The code contains issues that should be addressed.",
  "bugs": [
    {
      "line": 4,
      "severity": "HIGH",
      "title": "Index out of range",
      "explanation": "The code attempts to access an index outside the valid range of the list.",
      "problematicCode": "numbers[i + 1]",
      "fix": "numbers[i]"
    }
  ],
  "warnings": [
    {
      "line": 3,
      "severity": "MEDIUM",
      "message": "The function could benefit from type hints and docstring."
    }
  ],
  "securityIssues": [
    {
      "severity": "INFO",
      "title": "Code Security Review",
      "explanation": "No major security vulnerabilities detected in this code snippet.",
      "recommendation": "Always validate and sanitize user inputs in production."
    }
  ],
  "suggestions": [
    "Add comments to explain complex logic.",
    "Consider adding error handling for edge cases.",
    "Follow PEP 8 style guidelines for Python code."
  ],
  "complexity": {
    "time": "O(n)",
    "space": "O(1)",
    "explanation": "The algorithm's time complexity depends on the input size."
  },
  "quality": {
    "readability": 78,
    "maintainability": 75,
    "performance": 82,
    "security": 90
  },
  "fixedCode": "..."
}
```

**Error Response:**
```json
{
  "error": "Language is required."
}
```

## Code Explanation

### POST /api/explain

Explain the submitted source code.

**Request:**
```json
{
  "language": "python",
  "code": "numbers = [1, 2, 3]"
}
```

**Response:**
```json
{
  "language": "python",
  "explanation": "This code creates a list containing three numbers.",
  "steps": [
    {
      "line": 1,
      "explanation": "Creates a list containing three numbers."
    }
  ]
}
```

## Code Fix

### POST /api/fix

Generate a fixed version of the submitted code.

**Request:**
```json
{
  "language": "python",
  "code": "print(x)"
}
```

**Response:**
```json
{
  "fixedCode": "print('x')",
  "changes": [
    {
      "line": 1,
      "description": "Replaced undefined variable with a string."
    }
  ]
}
```

## Review History

### GET /api/reviews

Get all reviews (mock history).

**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "reviewName": "Python Login Bug",
      "language": "python",
      "score": 72,
      "bugCount": 2,
      "warningCount": 3,
      "date": "2026-08-30"
    },
    {
      "id": 2,
      "reviewName": "JavaScript Calculator",
      "language": "javascript",
      "score": 91,
      "bugCount": 0,
      "warningCount": 1,
      "date": "2026-08-29"
    }
  ]
}
```

### GET /api/reviews/<id>

Get a single review by ID.

**Response:**
```json
{
  "id": 1,
  "reviewName": "Python Login Bug",
  "language": "python",
  "score": 72,
  "bugCount": 2,
  "warningCount": 3,
  "date": "2026-08-30"
}
```

**Error Response:**
```json
{
  "error": "Review not found."
}
```

## Supported Languages

- python
- javascript
- java
- cpp
- csharp

## Error Handling

All errors return JSON in the following format:
```json
{
  "error": "Human-readable error message."
}
```

## Installation

```
cd backend
pip install -r requirements.txt
python app.py
```