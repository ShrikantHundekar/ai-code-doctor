"""Debug prompt template"""

def get_debug_prompt(language: str, code: str, error: str, stack_trace: str = "") -> str:
    """Generate prompt for AI code debugging."""
    stack_trace_section = f"\n\nStack Trace:\n{stack_trace}" if stack_trace else ""

    return f"""You are an expert software debugger.
Analyze the following {language} code and the associated error.

Code:
```{language}
{code}
```

Error:
{error}{stack_trace_section}

Perform deep root cause analysis and provide a complete fix.

Return your response in ONLY valid JSON with this EXACT structure:
{{
  "errorExplanation": "Detailed explanation of why this error occurred in the context of the code",
  "rootCause": "Concise statement of the fundamental underlying cause",
  "solution": "Step-by-step technical explanation of how to resolve the issue",
  "fixedCode": "Full corrected code snippet resolving the bug without introducing regressions",
  "changes": [
    "1. Description of specific change 1 made in the code",
    "2. Description of specific change 2 made in the code"
  ]
}}
"""
