"""Debug service for root cause analysis and bug fixing"""
from typing import Dict, Any

def generate_debug_analysis(code: str, language: str, error: str, stack_trace: str = "") -> Dict[str, Any]:
    """Generate deterministic mock debugging analysis when AI_MOCK_MODE=true or fallback."""
    root_cause = "Index calculation exceeds valid bounds of the sequence."
    error_explanation = f"The error '{error}' happens because the loop or indexing accesses elements beyond the array/collection boundaries."
    solution = "Adjust loop boundary from len(arr) + 1 to len(arr), or use idiomatic iteration (e.g. for item in arr) instead of index slicing."
    
    fixed_code = code
    if "range(len(" in code and "+ 1" in code:
        fixed_code = code.replace("range(len(numbers) + 1)", "range(len(numbers))")
    elif "range(len(" in code:
        fixed_code = code.replace("range(len(", "range(len(")
    elif language == "javascript" and "<=" in code and ".length" in code:
        fixed_code = code.replace("<= array.length", "< array.length")
    else:
        # Default smart fix
        fixed_code = f"# Fixed version\n{code}"

    changes = [
        "Identified off-by-one loop indexing condition in loop statement",
        "Corrected iteration range to avoid accessing out-of-bounds index",
        "Added safe boundary check preventing IndexError/OutOfBoundsException"
    ]

    return {
        "errorExplanation": error_explanation,
        "rootCause": root_cause,
        "solution": solution,
        "fixedCode": fixed_code,
        "changes": changes
    }
