"""Security analysis service for identifying code vulnerabilities"""
from typing import Dict, Any, List

def generate_security_analysis(code: str, language: str) -> Dict[str, Any]:
    """Generate deterministic mock security analysis."""
    issues = []
    overall_risk = "low"

    # Pattern checks
    code_lower = code.lower()

    if "api_key" in code_lower or "secret" in code_lower or "password" in code_lower and ("=" in code or ":" in code):
        issues.append({
            "severity": "critical",
            "category": "Hardcoded Secrets",
            "line": 1,
            "description": "Potential hardcoded credential or secret detected in source code.",
            "impact": "Exposure of sensitive credentials leading to unauthorized account or system access.",
            "recommendation": "Store credentials in environment variables or a dedicated secrets manager (e.g. AWS Secrets Manager, HashiCorp Vault)."
        })
        overall_risk = "critical"

    if "eval(" in code_lower or "exec(" in code_lower:
        issues.append({
            "severity": "critical",
            "category": "Dangerous Dynamic Execution",
            "line": 1,
            "description": "Direct use of dynamic code execution (eval/exec) on potentially untrusted input.",
            "impact": "Arbitrary code execution and remote system compromise.",
            "recommendation": "Refactor to use static dispatch, AST parsing, or strict JSON deserialization."
        })
        overall_risk = "critical"

    if "select " in code_lower and ("where" in code_lower or "%" in code or "f\"" in code or "f'" in code):
        issues.append({
            "severity": "high",
            "category": "SQL Injection",
            "line": 1,
            "description": "SQL query formed by dynamic string formatting or interpolation.",
            "impact": "Unauthorized database reads, data exfiltration, or table modification/dropping.",
            "recommendation": "Use parameterized queries or ORM query builders with prepared statements."
        })
        if overall_risk != "critical":
            overall_risk = "high"

    if "/ 0" in code_lower or "len(" in code and "/" in code and "if not" not in code_lower:
        issues.append({
            "severity": "medium",
            "category": "Input Validation & Denial of Service",
            "line": 1,
            "description": "Division operation performed without prior check for zero-length collections or zero divisors.",
            "impact": "Unhandled runtime exception causing unexpected process termination or service crash.",
            "recommendation": "Validate that the denominator or collection length is strictly greater than 0 before division."
        })
        if overall_risk == "low":
            overall_risk = "medium"

    if not issues:
        issues.append({
            "severity": "info",
            "category": "Baseline Audit",
            "line": 1,
            "description": "No critical vulnerabilities (injection, hardcoded secrets, unsafe deserialization) detected in this snippet.",
            "impact": "Low risk profile for scanned scope.",
            "recommendation": "Continue following secure coding practices, maintain dependency audits, and perform automated SAST/DAST testing."
        })
        summary = "No major vulnerabilities identified. Code follows standard secure coding practices."
    else:
        summary = f"Identified {len(issues)} potential security concern(s). Overall risk assessed as {overall_risk.upper()}."

    return {
        "overallRisk": overall_risk,
        "summary": summary,
        "issues": issues
    }
