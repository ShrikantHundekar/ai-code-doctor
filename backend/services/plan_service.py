"""AI Improvement Plan Generator"""
from typing import Dict, Any, List

def generate_improvement_plan(review_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate structured priority improvement plan from review results.

    Priorities:
    - Priority 1: Critical (Critical bugs & security flaws)
    - Priority 2: High (High severity bugs & medium security risks)
    - Priority 3: Medium (Medium/low bugs, complexity bottlenecks, readability)
    - Priority 4: Low (Style conventions, comments, minor refactoring)
    """
    plan = []

    # Check security issues
    security_issues = review_data.get('securityIssues', []) or review_data.get('issues', [])
    for issue in security_issues:
        sev = str(issue.get('severity', '')).lower()
        title = issue.get('title') or issue.get('category') or 'Security vulnerability'
        rec = issue.get('recommendation') or issue.get('description', '')
        if sev == 'critical':
            plan.append({
                "priority": 1,
                "priorityLabel": "Critical",
                "title": f"Fix critical security issue: {title}",
                "description": rec or "Remediate immediate vulnerability to prevent exploitation.",
                "category": "Security"
            })
        elif sev == 'high':
            plan.append({
                "priority": 2,
                "priorityLabel": "High",
                "title": f"Address security risk: {title}",
                "description": rec or "Apply recommended security safeguards.",
                "category": "Security"
            })
        elif sev in ['medium', 'low']:
            plan.append({
                "priority": 3,
                "priorityLabel": "Medium",
                "title": f"Improve security posture: {title}",
                "description": rec,
                "category": "Security"
            })

    # Check bugs
    bugs = review_data.get('bugs', [])
    for bug in bugs:
        sev = str(bug.get('severity', '')).lower()
        title = bug.get('title', 'Bug detected')
        fix = bug.get('fix') or bug.get('suggestedFix') or bug.get('explanation', '')
        if sev in ['critical', 'high']:
            plan.append({
                "priority": 1 if sev == 'critical' else 2,
                "priorityLabel": "Critical" if sev == 'critical' else "High",
                "title": f"Resolve {title}",
                "description": f"Apply fix: {fix}",
                "category": "Bug Fix"
            })
        elif sev == 'medium':
            plan.append({
                "priority": 3,
                "priorityLabel": "Medium",
                "title": f"Address {title}",
                "description": f"Suggested remediation: {fix}",
                "category": "Bug Fix"
            })
        else:
            plan.append({
                "priority": 4,
                "priorityLabel": "Low",
                "title": f"Minor fix: {title}",
                "description": f"Adjustment: {fix}",
                "category": "Bug Fix"
            })

    # Check warnings & complexity
    warnings = review_data.get('warnings', [])
    for warning in warnings:
        msg = warning.get('message', 'Warning')
        plan.append({
            "priority": 3,
            "priorityLabel": "Medium",
            "title": "Code Warning",
            "description": msg,
            "category": "Warning"
        })

    complexity = review_data.get('complexity', {})
    if isinstance(complexity, dict) and complexity.get('time') in ['O(n^2)', 'O(2^n)', 'O(n!)']:
        plan.append({
            "priority": 2,
            "priorityLabel": "High",
            "title": f"Optimize algorithm time complexity ({complexity.get('time')})",
            "description": complexity.get('explanation') or "Refactor nested loop or redundant iterations to improve scaling.",
            "category": "Performance"
        })

    # Add suggestions as Priority 4
    suggestions = review_data.get('suggestions', [])
    for sugg in suggestions:
        plan.append({
            "priority": 4,
            "priorityLabel": "Low",
            "title": "Code Quality Enhancement",
            "description": sugg,
            "category": "Suggestion"
        })

    # If empty, add default baseline recommendation
    if not plan:
        plan.append({
            "priority": 4,
            "priorityLabel": "Low",
            "title": "Maintain Code Hygiene",
            "description": "Ensure unit tests cover all boundary conditions and maintain clean documentation.",
            "category": "Best Practice"
        })

    # Sort by priority ascending (1 = Critical first)
    plan.sort(key=lambda x: x['priority'])
    return plan
