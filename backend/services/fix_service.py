from typing import Dict, Any, List

def generate_fix(code: str, language: str) -> Dict[str, Any]:
    """
    Generate a mock fix for the submitted code.
    In Phase 3, this will be replaced with Claude API calls.
    """
    code_lines = code.strip().split('\n')
    fixed_lines = []
    changes = []

    # Apply simple mock fixes based on language and patterns
    for i, line in enumerate(code_lines, 1):
        original_line = line
        fixed_line = line

        # Python-specific fixes
        if language == "python":
            # Fix common issues
            if "range(len(" in line and "+ 1)" in line:
                fixed_line = line.replace("range(len(", "range(len(").replace(") + 1)", ")")
                changes.append({
                    "line": i,
                    "description": "Removed + 1 from range to prevent index out of bounds."
                })
            elif "range(len(" in line and " + 1)" in line:
                fixed_line = line.replace("range(len(", "range(len(").replace(") + 1)", ")")
                changes.append({
                    "line": i,
                    "description": "Removed + 1 from range to prevent index out of bounds."
                })

            # Fix missing input validation
            if "def " in line and "(" in line and "if not" not in line:
                # Add simple validation hint
                changes.append({
                    "line": i,
                    "description": "Added suggestion to validate input parameters."
                })

            # Fix potential division by zero
            if "/" in line and "len(" in line and "if" not in line:
                # Find the function this line belongs to
                fixed_line = line
                changes.append({
                    "line": i,
                    "description": "Added check for empty collection to prevent division by zero."
                })

        # JavaScript-specific fixes
        elif language == "javascript":
            if "var " in line:
                fixed_line = line.replace("var ", "const ")
                changes.append({
                    "line": i,
                    "description": "Replaced var with const for better scoping."
                })
            elif "function(" in line:
                fixed_line = line.replace("function(", "function (")
                changes.append({
                    "line": i,
                    "description": "Added space after function keyword for better readability."
                })

        # Java-specific fixes
        elif language == "java":
            if "System.out.println" in line:
                fixed_line = line.replace("System.out.println", "logger.info")
                changes.append({
                    "line": i,
                    "description": "Replaced System.out.println with logger for production code."
                })

        fixed_lines.append(fixed_line)

    # If no specific changes were made, add some generic suggestions
    if not changes:
        changes.append({
            "line": 1,
            "description": "Code structure looks good. Consider adding comments and documentation."
        })

        # Add generic improvements to the fixed code
        if language == "python" and "def " in code:
            fixed_lines.insert(0, "# TODO: Add docstring and type hints")
            changes[0]["description"] = "Added placeholder for documentation."

    fixed_code = "\n".join(fixed_lines)

    return {
        "fixedCode": fixed_code,
        "changes": changes
    }
