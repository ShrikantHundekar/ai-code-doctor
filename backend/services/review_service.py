import random
from typing import Dict, Any

def generate_review(code: str, language: str) -> Dict[str, Any]:
    """
    Generate a mock AI review for the submitted code.
    In Phase 3, this will be replaced with Claude API calls.
    """
    code_lines = code.split('\n')
    code_length = len(code)

    # Mock analysis based on language and code characteristics
    score = random.randint(60, 95)
    bugs = []
    warnings = []
    security_issues = []
    suggestions = []

    # Simple pattern-based mock analysis
    if language == "python":
        if "for" in code and "range" in code and "+ 1" in code:
            bugs.append({
                "line": code.index("for") + 1 if "for" in code else 3,
                "severity": "HIGH",
                "title": "Index out of range",
                "explanation": "The code attempts to access an index outside the valid range of the list.",
                "problematicCode": "numbers[i + 1]",
                "fix": "numbers[i]"
            })
            score = 72

        if "def" in code and "(" in code and ")" in code:
            warnings.append({
                "line": 1,
                "severity": "MEDIUM",
                "message": "The function could benefit from type hints and docstring."
            })

        if len(code_lines) > 5:
            suggestions.append("Add input validation to handle edge cases.")
            suggestions.append("Consider using list comprehensions for simpler loops.")

        if "print" in code:
            warnings.append({
                "line": code.count("\n") + 1,
                "severity": "LOW",
                "message": "Consider using logging instead of print for production code."
            })

    elif language == "javascript":
        if "var " in code:
            bugs.append({
                "line": 1,
                "severity": "MEDIUM",
                "title": "Use of var keyword",
                "explanation": "Consider using let or const instead of var for better scoping.",
                "problematicCode": "var x",
                "fix": "const x or let x"
            })

        if "==" in code and "===" not in code:
            warnings.append({
                "line": 1,
                "severity": "LOW",
                "message": "Consider using strict equality (===) instead of loose equality (==)."
            })

        if "function" in code:
            suggestions.append("Consider using arrow functions for shorter syntax.")

    # Add common security suggestion
    security_issues.append({
        "severity": "INFO",
        "title": "Code Security Review",
        "explanation": "No major security vulnerabilities detected in this code snippet.",
        "recommendation": "Always validate and sanitize user inputs in production."
    })

    # Add common suggestions
    if not suggestions:
        suggestions = [
            "Add comments to explain complex logic.",
            "Consider adding error handling for edge cases.",
            "Follow PEP 8 style guidelines for Python code."
        ]

    # Generate mock fixed code (simplified version of original)
    fixed_code = code
    if language == "python" and "range(len(" in code:
        fixed_code = code.replace("range(len(numbers) + 1)", "range(len(numbers))")
        fixed_code = fixed_code.replace("return total / len(numbers)", "if not numbers:\n    return 0\n    return total / len(numbers)")

    # Build quality metrics
    quality = {
        "readability": min(100, max(0, score + random.randint(-10, 10))),
        "maintainability": min(100, max(0, score + random.randint(-15, 15))),
        "performance": min(100, max(0, score + random.randint(-10, 10))),
        "security": min(100, max(0, score + random.randint(-5, 15)))
    }

    return {
        "score": score,
        "summary": "The code contains " + ("issues" if bugs else "some improvement opportunities") + " that should be addressed.",
        "bugs": bugs,
        "warnings": warnings,
        "securityIssues": security_issues,
        "suggestions": suggestions,
        "complexity": {
            "time": "O(n)" if "for" in code or "while" in code else "O(1)",
            "space": "O(1)" if "new" not in code.lower() else "O(n)",
            "explanation": "The algorithm's time complexity depends on the input size."
        },
        "quality": quality,
        "fixedCode": fixed_code
    }
