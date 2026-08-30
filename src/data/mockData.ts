import type { Language, ReviewResult, ReviewHistoryItem } from '../types';

export const defaultPythonCode = `def find_average(numbers):
    total = 0
    for i in range(len(numbers) + 1):
        total += numbers[i]
    return total / len(numbers)

numbers = [10, 20, 30]
print(find_average(numbers))
`;

export const pythonFixedCode = `def find_average(numbers):
    if not numbers:
        return 0
    total = 0
    for number in numbers:
        total += number
    return total / len(numbers)

numbers = [10, 20, 30]
print(find_average(numbers))
`;

export const mockPythonReview: ReviewResult = {
  id: 'python-1',
  language: 'python',
  score: 72,
  bugs: [
    {
      id: 1,
      severity: 'high',
      line: 4,
      title: 'Index Out of Range',
      description: 'The loop uses `range(len(numbers) + 1)`, which causes the program to access an index that does not exist.',
      problematicCode: 'for i in range(len(numbers) + 1):\n    total += numbers[i]',
      suggestedFix: 'for i in range(len(numbers)):\n    total += numbers[i]',
    },
    {
      id: 2,
      severity: 'medium',
      line: 7,
      title: 'Possible Division by Zero',
      description: 'The function attempts to divide by the length of the list. If an empty list is provided, this will cause a ZeroDivisionError.',
      problematicCode: 'return total / len(numbers)',
      suggestedFix: 'if not numbers:\n    return 0\nreturn total / len(numbers)',
    },
  ],
  warnings: [
    { id: 1, line: 3, message: 'The loop can be simplified by directly iterating over the list.', severity: 'low' },
    { id: 2, line: 1, message: 'The function does not validate input.', severity: 'info' },
    { id: 3, line: 1, message: 'Variable naming could be improved.', severity: 'info' },
  ],
  securityIssues: [
    { id: 1, severity: 'info', title: 'Input Validation', description: 'Consider validating function inputs before processing them.' },
  ],
  suggestions: [
    'Use direct iteration instead of indexing.',
    'Validate input before processing.',
    'Consider using Python\'s built-in `sum()` function.',
    'Add type hints for better documentation.',
  ],
  complexity: {
    time: 'O(n)',
    timeExplanation: 'The function iterates through the list once.',
    space: 'O(1)',
    spaceExplanation: 'No additional data structures proportional to input size are created.',
  },
  qualityMetrics: { readability: 78, maintainability: 75, performance: 82, security: 90 },
  originalCode: defaultPythonCode,
  fixedCode: pythonFixedCode,
  codeLines: 12,
  createdAt: 'Today',
  reviewName: 'Python Average Function',
};

export const mockJavaScriptReview: ReviewResult = {
  id: 'js-1',
  language: 'javascript',
  score: 91,
  bugs: [],
  warnings: [{ id: 1, line: 5, message: 'Consider using strict equality (===).', severity: 'low' }],
  securityIssues: [],
  suggestions: ['Add JSDoc comments.', 'Consider destructuring for cleaner parameters.'],
  complexity: { time: 'O(n)', timeExplanation: 'Processes each element once.', space: 'O(n)', spaceExplanation: 'New array created.' },
  qualityMetrics: { readability: 88, maintainability: 92, performance: 90, security: 95 },
  originalCode: 'function doubleNumbers(arr) {\n  return arr.map(x => x * 2);\n}\nconsole.log(doubleNumbers([1, 2, 3]));',
  fixedCode: 'function doubleNumbers(arr) {\n  return arr.map(x => x * 2);\n}\nconsole.log(doubleNumbers([1, 2, 3]));',
  codeLines: 4,
  createdAt: 'Yesterday',
  reviewName: 'JavaScript Calculator',
};

export const mockReviewHistory: ReviewHistoryItem[] = [
  { id: '1', title: 'Python Login Bug', language: 'python', score: 72, bugCount: 3, warningCount: 2, date: 'Today', status: 'completed' },
  { id: '2', title: 'JavaScript Calculator', language: 'javascript', score: 91, bugCount: 0, warningCount: 1, date: 'Yesterday', status: 'completed' },
  { id: '3', title: 'Array Processing', language: 'python', score: 85, bugCount: 1, warningCount: 1, date: '2 days ago', status: 'completed' },
  { id: '4', title: 'Data Parser', language: 'java', score: 68, bugCount: 4, warningCount: 3, date: '3 days ago', status: 'completed' },
  { id: '5', title: 'C++ Sorting Algorithm', language: 'cpp', score: 78, bugCount: 2, warningCount: 2, date: '4 days ago', status: 'completed' },
  { id: '6', title: 'C# API Client', language: 'csharp', score: 88, bugCount: 1, warningCount: 1, date: '5 days ago', status: 'completed' },
];

export function getMockReviewForLanguage(language: string): ReviewResult {
  switch (language) {
    case 'python': return mockPythonReview;
    case 'javascript': return mockJavaScriptReview;
    default: return { ...mockPythonReview, id: `${language}-${Date.now()}`, language: language as Language };
  }
}

export function getReviewHistory(): ReviewHistoryItem[] {
  return mockReviewHistory;
}
