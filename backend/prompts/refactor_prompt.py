"""Refactor prompt template"""
from typing import List

def get_refactor_prompt(language: str, code: str, goals: List[str]) -> str:
    """Generate prompt for AI code refactoring."""
    goals_str = ", ".join(goals) if goals else "readability, performance, maintainability"

    return f"""You are a senior software architect specializing in code refactoring.
Refactor the following {language} code focusing specifically on these goals: {goals_str}.

Original Code:
```{language}
{code}
```

Refactoring Goals:
{goals_str}

Return your response in ONLY valid JSON with this EXACT structure:
{{
  "originalCode": {repr(code)},
  "refactoredCode": "The full cleanly refactored source code",
  "changes": [
    {{
      "type": "readability|performance|maintainability|duplication|logic",
      "description": "Specific refactoring description"
    }}
  ],
  "expectedBenefits": [
    "Benefit 1 (e.g., reduces time complexity from O(n^2) to O(n))",
    "Benefit 2 (e.g., improves readability by eliminating nested loops)"
  ]
}}
"""
