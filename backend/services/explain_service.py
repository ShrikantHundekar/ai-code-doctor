from typing import Dict, Any, List

def generate_explanation(code: str, language: str, level: str = "intermediate") -> Dict[str, Any]:
    """Generate mock explanation supporting skill levels and line-by-line breakdown."""
    code_lines = code.strip().split('\n')
    steps = []
    line_explanations = []

    level = (level or "intermediate").lower()

    for i, raw_line in enumerate(code_lines, 1):
        line = raw_line.strip()
        if not line:
            continue

        exp = _explain_line(line, language, level)
        steps.append({
            "line": i,
            "explanation": exp
        })
        line_explanations.append({
            "line": i,
            "code": raw_line,
            "explanation": exp
        })

    purpose = _extract_function_purpose(code)
    if level == "beginner":
        overall = f"This code is designed to help with {purpose}. It processes your data step-by-step using fundamental programming blocks like variables and loops."
        summary = f"A straightforward program that accomplishes {purpose} using simple control flow."
    elif level == "advanced":
        overall = f"This module implements an algorithmic routine for {purpose}. It executes with linear O(n) or constant O(1) auxiliary characteristics, managing state mutations and return boundaries."
        summary = f"Algorithmic execution path for {purpose} with deterministic branch analysis."
    else: # intermediate
        overall = f"This {language} function performs {purpose}. It initializes state variables, iterates over the input collections, and calculates the final return value."
        summary = f"Function implementation for {purpose} with structured control flow."

    return {
        "language": language,
        "level": level,
        "summary": summary,
        "explanation": overall,
        "steps": steps,
        "lineExplanations": line_explanations
    }


def _explain_line(line: str, language: str, level: str) -> str:
    """Generate level-appropriate line explanation."""
    if "def " in line:
        func = line.split("def ")[1].split("(")[0]
        if level == "beginner":
            return f"Creates a reusable function named '{func}'."
        elif level == "advanced":
            return f"Declares function signature '{func}' with frame allocation on invocation stack."
        return f"Defines a function named '{func}' with input parameters."

    elif "for " in line:
        if level == "beginner":
            return "Repeats a set of actions for each item in a list or sequence."
        elif level == "advanced":
            return "Iterates sequence using standard iterator protocol with O(n) traversal bounds."
        return "Loops through items in the sequence."

    elif "return " in line:
        if level == "beginner":
            return "Sends the final computed answer back and ends the function."
        elif level == "advanced":
            return "Returns evaluated expression to calling context, unwinding current frame."
        return "Returns the calculated value from the function."

    elif "total" in line and "=" in line:
        if level == "beginner":
            return "Sets up or updates an accumulator variable named 'total'."
        return "Updates the running sum variable 'total'."

    elif "=" in line:
        return "Initializes or updates a variable with a new value."

    return "Executes this operational statement."


def _extract_function_purpose(code: str) -> str:
    if "average" in code.lower() or "mean" in code.lower():
        return "calculating the numerical average of a list"
    elif "calculate" in code.lower() or "compute" in code.lower():
        return "performing arithmetic calculations"
    elif "sort" in code.lower():
        return "sorting and ordering data"
    elif "find" in code.lower() or "search" in code.lower():
        return "searching for specific elements"
    return "processing and transforming input data"
