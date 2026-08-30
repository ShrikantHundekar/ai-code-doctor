"""Security prompt template"""

def get_security_prompt(language: str, code: str) -> str:
    """Generate prompt for AI security vulnerability analysis."""
    return f"""You are a professional application security engineer.
Perform an in-depth security scan of the following {language} code.

Scan specifically for:
- Hardcoded secrets and credentials
- SQL injection / NoSQL injection
- Command injection / shell execution flaws
- Unsafe input handling / XSS
- Authentication & authorization flaws
- Insecure dependencies / outdated patterns
- Unsafe file operations & path traversal
- Dangerous deserialization / eval / code execution
- Memory safety or resource leaks

Code:
```{language}
{code}
```

Return your response in ONLY valid JSON with this EXACT structure:
{{
  "overallRisk": "low|medium|high|critical",
  "summary": "High-level summary of the security posture and findings",
  "issues": [
    {{
      "severity": "critical|high|medium|low|info",
      "category": "e.g. SQL Injection, Hardcoded Secret, Insecure Input",
      "line": 1,
      "description": "Clear explanation of the vulnerability",
      "impact": "Potential security impact if exploited",
      "recommendation": "Specific remediation step"
    }}
  ]
}}
"""
