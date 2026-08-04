import { Problem } from '../types';

/**
 * Custom Basic problems for display in Dashboard.
 * These come from basic.json and are stored in the DB with leetcodeIds 6001-6294.
 * Each entry has a languageId so they appear when that language is selected.
 */
export const BASIC_PROBLEMS: Problem[] = [
  {
    id: 6001, title: 'Return Negative Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its negative counterpart. If the number is already negative or zero, return it as is.',
    examples: [{ input: 'n = 5', output: '-5', explanation: '5 becomes -5' }],
    starterCode: { JavaScript: 'function returnNegative(n) {\n  // your code here\n}', Python: 'def return_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int returnNegative(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int returnNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '-5' }],
    language: 'JavaScript'
  },
  {
    id: 6002, title: 'Return Negative Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its negative counterpart.',
    examples: [{ input: 'n = 5', output: '-5', explanation: '5 becomes -5' }],
    starterCode: { JavaScript: 'function returnNegative(n) {\n  // your code here\n}', Python: 'def return_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int returnNegative(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int returnNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '-5' }],
    language: 'Python'
  },
  {
    id: 6003, title: 'Return Negative Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its negative counterpart.',
    examples: [{ input: 'n = 5', output: '-5', explanation: '5 becomes -5' }],
    starterCode: { JavaScript: 'function returnNegative(n) {\n  // your code here\n}', Python: 'def return_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int returnNegative(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int returnNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '-5' }],
    language: 'Java'
  },
  {
    id: 6004, title: 'Return Negative Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its negative counterpart.',
    examples: [{ input: 'n = 5', output: '-5', explanation: '5 becomes -5' }],
    starterCode: { JavaScript: 'function returnNegative(n) {\n  // your code here\n}', Python: 'def return_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int returnNegative(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int returnNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '-5' }],
    language: 'Cpp'
  },
  {
    id: 6011, title: 'Remainder of Division', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two positive integers dividend and divisor, return the remainder when dividing.',
    examples: [{ input: 'dividend = 5, divisor = 2', output: '1', explanation: '5 / 2 = 2 remainder 1' }],
    starterCode: { JavaScript: 'function remainder(dividend, divisor) {\n  // your code here\n}', Python: 'def remainder(dividend, divisor):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int remainder(int dividend, int divisor) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int remainder(int dividend, int divisor) {\n    // your code here\n}' },
    testcases: [{ input: '5, 2', expectedOutput: '1' }],
    language: 'JavaScript'
  },
  {
    id: 6012, title: 'Remainder of Division', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two positive integers dividend and divisor, return the remainder when dividing.',
    examples: [{ input: 'dividend = 5, divisor = 2', output: '1', explanation: '5 / 2 = 2 remainder 1' }],
    starterCode: { JavaScript: 'function remainder(dividend, divisor) {\n  // your code here\n}', Python: 'def remainder(dividend, divisor):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int remainder(int dividend, int divisor) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int remainder(int dividend, int divisor) {\n    // your code here\n}' },
    testcases: [{ input: '5, 2', expectedOutput: '1' }],
    language: 'Python'
  },
  {
    id: 6013, title: 'Remainder of Division', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two positive integers dividend and divisor, return the remainder when dividing.',
    examples: [{ input: 'dividend = 5, divisor = 2', output: '1', explanation: '5 / 2 = 2 remainder 1' }],
    starterCode: { JavaScript: 'function remainder(dividend, divisor) {\n  // your code here\n}', Python: 'def remainder(dividend, divisor):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int remainder(int dividend, int divisor) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int remainder(int dividend, int divisor) {\n    // your code here\n}' },
    testcases: [{ input: '5, 2', expectedOutput: '1' }],
    language: 'Java'
  },
  {
    id: 6014, title: 'Remainder of Division', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two positive integers dividend and divisor, return the remainder when dividing.',
    examples: [{ input: 'dividend = 5, divisor = 2', output: '1', explanation: '5 / 2 = 2 remainder 1' }],
    starterCode: { JavaScript: 'function remainder(dividend, divisor) {\n  // your code here\n}', Python: 'def remainder(dividend, divisor):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int remainder(int dividend, int divisor) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int remainder(int dividend, int divisor) {\n    // your code here\n}' },
    testcases: [{ input: '5, 2', expectedOutput: '1' }],
    language: 'Cpp'
  },
  {
    id: 6021, title: 'Minutes to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer minutes, convert it to seconds.',
    examples: [{ input: 'minutes = 1', output: '60', explanation: '1 minute = 60 seconds' }],
    starterCode: { JavaScript: 'function minutesToSeconds(minutes) {\n  // your code here\n}', Python: 'def minutes_to_seconds(minutes):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int minutesToSeconds(int minutes) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int minutesToSeconds(int minutes) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '60' }],
    language: 'JavaScript'
  },
  {
    id: 6022, title: 'Minutes to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer minutes, convert it to seconds.',
    examples: [{ input: 'minutes = 1', output: '60', explanation: '1 minute = 60 seconds' }],
    starterCode: { JavaScript: 'function minutesToSeconds(minutes) {\n  // your code here\n}', Python: 'def minutes_to_seconds(minutes):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int minutesToSeconds(int minutes) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int minutesToSeconds(int minutes) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '60' }],
    language: 'Python'
  },
  {
    id: 6023, title: 'Minutes to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer minutes, convert it to seconds.',
    examples: [{ input: 'minutes = 1', output: '60', explanation: '1 minute = 60 seconds' }],
    starterCode: { JavaScript: 'function minutesToSeconds(minutes) {\n  // your code here\n}', Python: 'def minutes_to_seconds(minutes):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int minutesToSeconds(int minutes) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int minutesToSeconds(int minutes) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '60' }],
    language: 'Java'
  },
  {
    id: 6024, title: 'Minutes to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer minutes, convert it to seconds.',
    examples: [{ input: 'minutes = 1', output: '60', explanation: '1 minute = 60 seconds' }],
    starterCode: { JavaScript: 'function minutesToSeconds(minutes) {\n  // your code here\n}', Python: 'def minutes_to_seconds(minutes):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int minutesToSeconds(int minutes) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int minutesToSeconds(int minutes) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '60' }],
    language: 'Cpp'
  },
  {
    id: 6031, title: 'Calculate Total Edge Count', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given triangle count, calculate total edges (count * 3).',
    examples: [{ input: 'count = 1', output: '3', explanation: '1 triangle has 3 edges' }],
    starterCode: { JavaScript: 'function totalEdges(count) {\n  // your code here\n}', Python: 'def total_edges(count):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int totalEdges(int count) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int totalEdges(int count) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3' }],
    language: 'JavaScript'
  },
  {
    id: 6032, title: 'Calculate Total Edge Count', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given triangle count, calculate total edges (count * 3).',
    examples: [{ input: 'count = 1', output: '3', explanation: '1 triangle has 3 edges' }],
    starterCode: { JavaScript: 'function totalEdges(count) {\n  // your code here\n}', Python: 'def total_edges(count):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int totalEdges(int count) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int totalEdges(int count) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3' }],
    language: 'Python'
  },
  {
    id: 6033, title: 'Calculate Total Edge Count', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given triangle count, calculate total edges (count * 3).',
    examples: [{ input: 'count = 1', output: '3', explanation: '1 triangle has 3 edges' }],
    starterCode: { JavaScript: 'function totalEdges(count) {\n  // your code here\n}', Python: 'def total_edges(count):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int totalEdges(int count) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int totalEdges(int count) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3' }],
    language: 'Java'
  },
  {
    id: 6034, title: 'Calculate Total Edge Count', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given triangle count, calculate total edges (count * 3).',
    examples: [{ input: 'count = 1', output: '3', explanation: '1 triangle has 3 edges' }],
    starterCode: { JavaScript: 'function totalEdges(count) {\n  // your code here\n}', Python: 'def total_edges(count):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int totalEdges(int count) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int totalEdges(int count) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3' }],
    language: 'Cpp'
  },
  {
    id: 6041, title: 'String Length', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return the length of a given string.',
    examples: [{ input: 's = "hello"', output: '5', explanation: 'hello has 5 characters' }],
    starterCode: { JavaScript: 'function stringLength(s) {\n  // your code here\n}', Python: 'def string_length(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int stringLength(String s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int stringLength(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"hello"', expectedOutput: '5' }],
    language: 'JavaScript'
  },
  {
    id: 6042, title: 'String Length', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return the length of a given string.',
    examples: [{ input: 's = "hello"', output: '5', explanation: 'hello has 5 characters' }],
    starterCode: { JavaScript: 'function stringLength(s) {\n  // your code here\n}', Python: 'def string_length(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int stringLength(String s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int stringLength(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"hello"', expectedOutput: '5' }],
    language: 'Python'
  },
  {
    id: 6043, title: 'String Length', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return the length of a given string.',
    examples: [{ input: 's = "hello"', output: '5', explanation: 'hello has 5 characters' }],
    starterCode: { JavaScript: 'function stringLength(s) {\n  // your code here\n}', Python: 'def string_length(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int stringLength(String s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int stringLength(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"hello"', expectedOutput: '5' }],
    language: 'Java'
  },
  {
    id: 6044, title: 'String Length', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return the length of a given string.',
    examples: [{ input: 's = "hello"', output: '5', explanation: 'hello has 5 characters' }],
    starterCode: { JavaScript: 'function stringLength(s) {\n  // your code here\n}', Python: 'def string_length(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int stringLength(String s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int stringLength(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"hello"', expectedOutput: '5' }],
    language: 'Cpp'
  },
  {
    id: 6051, title: 'Square of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its square.',
    examples: [{ input: 'n = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function square(n) {\n  // your code here\n}', Python: 'def square(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int square(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int square(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'JavaScript'
  },
  {
    id: 6052, title: 'Square of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its square.',
    examples: [{ input: 'n = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function square(n) {\n  // your code here\n}', Python: 'def square(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int square(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int square(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'Python'
  },
  {
    id: 6053, title: 'Square of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its square.',
    examples: [{ input: 'n = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function square(n) {\n  // your code here\n}', Python: 'def square(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int square(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int square(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'Java'
  },
  {
    id: 6054, title: 'Square of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given an integer n, return its square.',
    examples: [{ input: 'n = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function square(n) {\n  // your code here\n}', Python: 'def square(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int square(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int square(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'Cpp'
  },
  {
    id: 6061, title: 'Is Number Even', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is even, false otherwise.',
    examples: [{ input: 'n = 4', output: 'true', explanation: '4 is divisible by 2' }],
    starterCode: { JavaScript: 'function isEven(n) {\n  // your code here\n}', Python: 'def is_even(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEven(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEven(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: 'true' }],
    language: 'JavaScript'
  },
  {
    id: 6062, title: 'Is Number Even', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is even, false otherwise.',
    examples: [{ input: 'n = 4', output: 'true', explanation: '4 is divisible by 2' }],
    starterCode: { JavaScript: 'function isEven(n) {\n  // your code here\n}', Python: 'def is_even(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEven(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEven(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: 'true' }],
    language: 'Python'
  },
  {
    id: 6063, title: 'Is Number Even', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is even, false otherwise.',
    examples: [{ input: 'n = 4', output: 'true', explanation: '4 is divisible by 2' }],
    starterCode: { JavaScript: 'function isEven(n) {\n  // your code here\n}', Python: 'def is_even(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEven(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEven(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: 'true' }],
    language: 'Java'
  },
  {
    id: 6064, title: 'Is Number Even', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is even, false otherwise.',
    examples: [{ input: 'n = 4', output: 'true', explanation: '4 is divisible by 2' }],
    starterCode: { JavaScript: 'function isEven(n) {\n  // your code here\n}', Python: 'def is_even(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEven(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEven(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: 'true' }],
    language: 'Cpp'
  },
  {
    id: 6071, title: 'Hours to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given hours, convert to seconds.',
    examples: [{ input: 'hours = 1', output: '3600', explanation: '1 hour = 3600 seconds' }],
    starterCode: { JavaScript: 'function hoursToSeconds(hours) {\n  // your code here\n}', Python: 'def hours_to_seconds(hours):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int hoursToSeconds(int hours) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int hoursToSeconds(int hours) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3600' }],
    language: 'JavaScript'
  },
  {
    id: 6072, title: 'Hours to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given hours, convert to seconds.',
    examples: [{ input: 'hours = 1', output: '3600', explanation: '1 hour = 3600 seconds' }],
    starterCode: { JavaScript: 'function hoursToSeconds(hours) {\n  // your code here\n}', Python: 'def hours_to_seconds(hours):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int hoursToSeconds(int hours) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int hoursToSeconds(int hours) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3600' }],
    language: 'Python'
  },
  {
    id: 6073, title: 'Hours to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given hours, convert to seconds.',
    examples: [{ input: 'hours = 1', output: '3600', explanation: '1 hour = 3600 seconds' }],
    starterCode: { JavaScript: 'function hoursToSeconds(hours) {\n  // your code here\n}', Python: 'def hours_to_seconds(hours):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int hoursToSeconds(int hours) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int hoursToSeconds(int hours) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3600' }],
    language: 'Java'
  },
  {
    id: 6074, title: 'Hours to Seconds', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given hours, convert to seconds.',
    examples: [{ input: 'hours = 1', output: '3600', explanation: '1 hour = 3600 seconds' }],
    starterCode: { JavaScript: 'function hoursToSeconds(hours) {\n  // your code here\n}', Python: 'def hours_to_seconds(hours):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int hoursToSeconds(int hours) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int hoursToSeconds(int hours) {\n    // your code here\n}' },
    testcases: [{ input: '1', expectedOutput: '3600' }],
    language: 'Cpp'
  },
  {
    id: 6081, title: 'Sum of Two Numbers', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their sum.',
    examples: [{ input: 'a = 2, b = 3', output: '5', explanation: '2 + 3 = 5' }],
    starterCode: { JavaScript: 'function sum(a, b) {\n  // your code here\n}', Python: 'def sum(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int sum(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int sum(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '2, 3', expectedOutput: '5' }],
    language: 'JavaScript'
  },
  {
    id: 6082, title: 'Sum of Two Numbers', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their sum.',
    examples: [{ input: 'a = 2, b = 3', output: '5', explanation: '2 + 3 = 5' }],
    starterCode: { JavaScript: 'function sum(a, b) {\n  // your code here\n}', Python: 'def sum(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int sum(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int sum(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '2, 3', expectedOutput: '5' }],
    language: 'Python'
  },
  {
    id: 6083, title: 'Sum of Two Numbers', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their sum.',
    examples: [{ input: 'a = 2, b = 3', output: '5', explanation: '2 + 3 = 5' }],
    starterCode: { JavaScript: 'function sum(a, b) {\n  // your code here\n}', Python: 'def sum(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int sum(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int sum(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '2, 3', expectedOutput: '5' }],
    language: 'Java'
  },
  {
    id: 6084, title: 'Sum of Two Numbers', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their sum.',
    examples: [{ input: 'a = 2, b = 3', output: '5', explanation: '2 + 3 = 5' }],
    starterCode: { JavaScript: 'function sum(a, b) {\n  // your code here\n}', Python: 'def sum(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int sum(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int sum(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '2, 3', expectedOutput: '5' }],
    language: 'Cpp'
  },
  {
    id: 6091, title: 'Find Next Character', difficulty: 'Basic', acceptance: '95%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a character c, return the next character in alphabet.',
    examples: [{ input: 'c = "a"', output: 'b', explanation: 'Next after a is b' }],
    starterCode: { JavaScript: 'function nextChar(c) {\n  // your code here\n}', Python: 'def next_char(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char nextChar(char c) {\n        // your code here\n        return c;\n    }\n}', Cpp: 'char nextChar(char c) {\n    // your code here\n}' },
    testcases: [{ input: '"a"', expectedOutput: 'b' }],
    language: 'JavaScript'
  },
  {
    id: 6092, title: 'Find Next Character', difficulty: 'Basic', acceptance: '95%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a character c, return the next character in alphabet.',
    examples: [{ input: 'c = "a"', output: 'b', explanation: 'Next after a is b' }],
    starterCode: { JavaScript: 'function nextChar(c) {\n  // your code here\n}', Python: 'def next_char(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char nextChar(char c) {\n        // your code here\n        return c;\n    }\n}', Cpp: 'char nextChar(char c) {\n    // your code here\n}' },
    testcases: [{ input: '"a"', expectedOutput: 'b' }],
    language: 'Python'
  },
  {
    id: 6093, title: 'Find Next Character', difficulty: 'Basic', acceptance: '95%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a character c, return the next character in alphabet.',
    examples: [{ input: 'c = "a"', output: 'b', explanation: 'Next after a is b' }],
    starterCode: { JavaScript: 'function nextChar(c) {\n  // your code here\n}', Python: 'def next_char(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char nextChar(char c) {\n        // your code here\n        return c;\n    }\n}', Cpp: 'char nextChar(char c) {\n    // your code here\n}' },
    testcases: [{ input: '"a"', expectedOutput: 'b' }],
    language: 'Java'
  },
  {
    id: 6094, title: 'Find Next Character', difficulty: 'Basic', acceptance: '95%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a character c, return the next character in alphabet.',
    examples: [{ input: 'c = "a"', output: 'b', explanation: 'Next after a is b' }],
    starterCode: { JavaScript: 'function nextChar(c) {\n  // your code here\n}', Python: 'def next_char(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char nextChar(char c) {\n        // your code here\n        return c;\n    }\n}', Cpp: 'char nextChar(char c) {\n    // your code here\n}' },
    testcases: [{ input: '"a"', expectedOutput: 'b' }],
    language: 'Cpp'
  },
  {
    id: 6101, title: 'Find Absolute Difference', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return absolute difference.',
    examples: [{ input: 'a = 5, b = 8', output: '3', explanation: '|5 - 8| = 3' }],
    starterCode: { JavaScript: 'function absDiff(a, b) {\n  // your code here\n}', Python: 'def abs_diff(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int absDiff(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int absDiff(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 8', expectedOutput: '3' }],
    language: 'JavaScript'
  },
  {
    id: 6102, title: 'Find Absolute Difference', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return absolute difference.',
    examples: [{ input: 'a = 5, b = 8', output: '3', explanation: '|5 - 8| = 3' }],
    starterCode: { JavaScript: 'function absDiff(a, b) {\n  // your code here\n}', Python: 'def abs_diff(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int absDiff(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int absDiff(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 8', expectedOutput: '3' }],
    language: 'Python'
  },
  {
    id: 6103, title: 'Find Absolute Difference', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return absolute difference.',
    examples: [{ input: 'a = 5, b = 8', output: '3', explanation: '|5 - 8| = 3' }],
    starterCode: { JavaScript: 'function absDiff(a, b) {\n  // your code here\n}', Python: 'def abs_diff(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int absDiff(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int absDiff(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 8', expectedOutput: '3' }],
    language: 'Java'
  },
  {
    id: 6104, title: 'Find Absolute Difference', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return absolute difference.',
    examples: [{ input: 'a = 5, b = 8', output: '3', explanation: '|5 - 8| = 3' }],
    starterCode: { JavaScript: 'function absDiff(a, b) {\n  // your code here\n}', Python: 'def abs_diff(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int absDiff(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int absDiff(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 8', expectedOutput: '3' }],
    language: 'Cpp'
  },
  {
    id: 6111, title: 'Count Array Elements', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Array'], companies: [],
    description: 'Given an array, return the number of elements.',
    examples: [{ input: 'arr = [1, 2, 3]', output: '3', explanation: 'The array has 3 elements' }],
    starterCode: { JavaScript: 'function countElements(arr) {\n  // your code here\n}', Python: 'def count_elements(arr):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int countElements(int[] arr) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int countElements(std::vector<int>& arr) {\n    // your code here\n}' },
    testcases: [{ input: '[1, 2, 3]', expectedOutput: '3' }],
    language: 'JavaScript'
  },
  {
    id: 6112, title: 'Count Array Elements', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Array'], companies: [],
    description: 'Given an array, return the number of elements.',
    examples: [{ input: 'arr = [1, 2, 3]', output: '3', explanation: 'The array has 3 elements' }],
    starterCode: { JavaScript: 'function countElements(arr) {\n  // your code here\n}', Python: 'def count_elements(arr):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int countElements(int[] arr) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int countElements(std::vector<int>& arr) {\n    // your code here\n}' },
    testcases: [{ input: '[1, 2, 3]', expectedOutput: '3' }],
    language: 'Python'
  },
  {
    id: 6113, title: 'Count Array Elements', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Array'], companies: [],
    description: 'Given an array, return the number of elements.',
    examples: [{ input: 'arr = [1, 2, 3]', output: '3', explanation: 'The array has 3 elements' }],
    starterCode: { JavaScript: 'function countElements(arr) {\n  // your code here\n}', Python: 'def count_elements(arr):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int countElements(int[] arr) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int countElements(std::vector<int>& arr) {\n    // your code here\n}' },
    testcases: [{ input: '[1, 2, 3]', expectedOutput: '3' }],
    language: 'Java'
  },
  {
    id: 6114, title: 'Count Array Elements', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Array'], companies: [],
    description: 'Given an array, return the number of elements.',
    examples: [{ input: 'arr = [1, 2, 3]', output: '3', explanation: 'The array has 3 elements' }],
    starterCode: { JavaScript: 'function countElements(arr) {\n  // your code here\n}', Python: 'def count_elements(arr):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int countElements(int[] arr) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int countElements(std::vector<int>& arr) {\n    // your code here\n}' },
    testcases: [{ input: '[1, 2, 3]', expectedOutput: '3' }],
    language: 'Cpp'
  },
  {
    id: 6121, title: 'String to Uppercase', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a lowercase string, convert to uppercase.',
    examples: [{ input: 's = "abc"', output: 'ABC', explanation: 'abc becomes ABC' }],
    starterCode: { JavaScript: 'function toUpperCase(s) {\n  // your code here\n}', Python: 'def to_uppercase(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String toUpperCase(String s) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string toUpperCase(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"abc"', expectedOutput: 'ABC' }],
    language: 'JavaScript'
  },
  {
    id: 6122, title: 'String to Uppercase', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a lowercase string, convert to uppercase.',
    examples: [{ input: 's = "abc"', output: 'ABC', explanation: 'abc becomes ABC' }],
    starterCode: { JavaScript: 'function toUpperCase(s) {\n  // your code here\n}', Python: 'def to_uppercase(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String toUpperCase(String s) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string toUpperCase(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"abc"', expectedOutput: 'ABC' }],
    language: 'Python'
  },
  {
    id: 6123, title: 'String to Uppercase', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a lowercase string, convert to uppercase.',
    examples: [{ input: 's = "abc"', output: 'ABC', explanation: 'abc becomes ABC' }],
    starterCode: { JavaScript: 'function toUpperCase(s) {\n  // your code here\n}', Python: 'def to_uppercase(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String toUpperCase(String s) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string toUpperCase(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"abc"', expectedOutput: 'ABC' }],
    language: 'Java'
  },
  {
    id: 6124, title: 'String to Uppercase', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a lowercase string, convert to uppercase.',
    examples: [{ input: 's = "abc"', output: 'ABC', explanation: 'abc becomes ABC' }],
    starterCode: { JavaScript: 'function toUpperCase(s) {\n  // your code here\n}', Python: 'def to_uppercase(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String toUpperCase(String s) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string toUpperCase(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"abc"', expectedOutput: 'ABC' }],
    language: 'Cpp'
  },
  {
    id: 6131, title: 'Cube Volumetric Calculation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side length s, compute volume (s^3).',
    examples: [{ input: 's = 2', output: '8', explanation: '2 * 2 * 2 = 8' }],
    starterCode: { JavaScript: 'function cubeVolume(s) {\n  // your code here\n}', Python: 'def cube_volume(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cubeVolume(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cubeVolume(int s) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'JavaScript'
  },
  {
    id: 6132, title: 'Cube Volumetric Calculation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side length s, compute volume (s^3).',
    examples: [{ input: 's = 2', output: '8', explanation: '2 * 2 * 2 = 8' }],
    starterCode: { JavaScript: 'function cubeVolume(s) {\n  // your code here\n}', Python: 'def cube_volume(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cubeVolume(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cubeVolume(int s) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'Python'
  },
  {
    id: 6133, title: 'Cube Volumetric Calculation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side length s, compute volume (s^3).',
    examples: [{ input: 's = 2', output: '8', explanation: '2 * 2 * 2 = 8' }],
    starterCode: { JavaScript: 'function cubeVolume(s) {\n  // your code here\n}', Python: 'def cube_volume(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cubeVolume(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cubeVolume(int s) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'Java'
  },
  {
    id: 6134, title: 'Cube Volumetric Calculation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side length s, compute volume (s^3).',
    examples: [{ input: 's = 2', output: '8', explanation: '2 * 2 * 2 = 8' }],
    starterCode: { JavaScript: 'function cubeVolume(s) {\n  // your code here\n}', Python: 'def cube_volume(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cubeVolume(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cubeVolume(int s) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'Cpp'
  },
  {
    id: 6141, title: 'Logical Inverse Flag', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given a boolean flag, return its logical opposite.',
    examples: [{ input: 'flag = true', output: 'false', explanation: 'Opposite of true is false' }],
    starterCode: { JavaScript: 'function inverseFlag(flag) {\n  // your code here\n}', Python: 'def inverse_flag(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean inverseFlag(boolean flag) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool inverseFlag(bool flag) {\n    // your code here\n}' },
    testcases: [{ input: 'true', expectedOutput: 'false' }],
    language: 'JavaScript'
  },
  {
    id: 6142, title: 'Logical Inverse Flag', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given a boolean flag, return its logical opposite.',
    examples: [{ input: 'flag = true', output: 'false', explanation: 'Opposite of true is false' }],
    starterCode: { JavaScript: 'function inverseFlag(flag) {\n  // your code here\n}', Python: 'def inverse_flag(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean inverseFlag(boolean flag) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool inverseFlag(bool flag) {\n    // your code here\n}' },
    testcases: [{ input: 'true', expectedOutput: 'false' }],
    language: 'Python'
  },
  {
    id: 6143, title: 'Logical Inverse Flag', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given a boolean flag, return its logical opposite.',
    examples: [{ input: 'flag = true', output: 'false', explanation: 'Opposite of true is false' }],
    starterCode: { JavaScript: 'function inverseFlag(flag) {\n  // your code here\n}', Python: 'def inverse_flag(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean inverseFlag(boolean flag) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool inverseFlag(bool flag) {\n    // your code here\n}' },
    testcases: [{ input: 'true', expectedOutput: 'false' }],
    language: 'Java'
  },
  {
    id: 6144, title: 'Logical Inverse Flag', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given a boolean flag, return its logical opposite.',
    examples: [{ input: 'flag = true', output: 'false', explanation: 'Opposite of true is false' }],
    starterCode: { JavaScript: 'function inverseFlag(flag) {\n  // your code here\n}', Python: 'def inverse_flag(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean inverseFlag(boolean flag) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool inverseFlag(bool flag) {\n    // your code here\n}' },
    testcases: [{ input: 'true', expectedOutput: 'false' }],
    language: 'Cpp'
  },
  {
    id: 6151, title: 'First Character Selection', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a non-empty string, return its first character.',
    examples: [{ input: 's = "apple"', output: 'a', explanation: 'First char of apple is a' }],
    starterCode: { JavaScript: 'function firstChar(s) {\n  // your code here\n}', Python: 'def first_char(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char firstChar(String s) {\n        // your code here\n        return s.charAt(0);\n    }\n}', Cpp: 'char firstChar(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"apple"', expectedOutput: 'a' }],
    language: 'JavaScript'
  },
  {
    id: 6152, title: 'First Character Selection', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a non-empty string, return its first character.',
    examples: [{ input: 's = "apple"', output: 'a', explanation: 'First char of apple is a' }],
    starterCode: { JavaScript: 'function firstChar(s) {\n  // your code here\n}', Python: 'def first_char(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char firstChar(String s) {\n        // your code here\n        return s.charAt(0);\n    }\n}', Cpp: 'char firstChar(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"apple"', expectedOutput: 'a' }],
    language: 'Python'
  },
  {
    id: 6153, title: 'First Character Selection', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a non-empty string, return its first character.',
    examples: [{ input: 's = "apple"', output: 'a', explanation: 'First char of apple is a' }],
    starterCode: { JavaScript: 'function firstChar(s) {\n  // your code here\n}', Python: 'def first_char(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char firstChar(String s) {\n        // your code here\n        return s.charAt(0);\n    }\n}', Cpp: 'char firstChar(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"apple"', expectedOutput: 'a' }],
    language: 'Java'
  },
  {
    id: 6154, title: 'First Character Selection', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given a non-empty string, return its first character.',
    examples: [{ input: 's = "apple"', output: 'a', explanation: 'First char of apple is a' }],
    starterCode: { JavaScript: 'function firstChar(s) {\n  // your code here\n}', Python: 'def first_char(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public char firstChar(String s) {\n        // your code here\n        return s.charAt(0);\n    }\n}', Cpp: 'char firstChar(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '"apple"', expectedOutput: 'a' }],
    language: 'Cpp'
  },
  {
    id: 6161, title: 'Value Multiplication', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their product.',
    examples: [{ input: 'a = 3, b = 4', output: '12', explanation: '3 * 4 = 12' }],
    starterCode: { JavaScript: 'function multiply(a, b) {\n  // your code here\n}', Python: 'def multiply(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int multiply(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int multiply(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '3, 4', expectedOutput: '12' }],
    language: 'JavaScript'
  },
  {
    id: 6162, title: 'Value Multiplication', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their product.',
    examples: [{ input: 'a = 3, b = 4', output: '12', explanation: '3 * 4 = 12' }],
    starterCode: { JavaScript: 'function multiply(a, b) {\n  // your code here\n}', Python: 'def multiply(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int multiply(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int multiply(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '3, 4', expectedOutput: '12' }],
    language: 'Python'
  },
  {
    id: 6163, title: 'Value Multiplication', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their product.',
    examples: [{ input: 'a = 3, b = 4', output: '12', explanation: '3 * 4 = 12' }],
    starterCode: { JavaScript: 'function multiply(a, b) {\n  // your code here\n}', Python: 'def multiply(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int multiply(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int multiply(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '3, 4', expectedOutput: '12' }],
    language: 'Java'
  },
  {
    id: 6164, title: 'Value Multiplication', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given two integers a and b, return their product.',
    examples: [{ input: 'a = 3, b = 4', output: '12', explanation: '3 * 4 = 12' }],
    starterCode: { JavaScript: 'function multiply(a, b) {\n  // your code here\n}', Python: 'def multiply(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int multiply(int a, int b) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int multiply(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '3, 4', expectedOutput: '12' }],
    language: 'Cpp'
  },
  {
    id: 6171, title: 'Is String Empty', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string returns true' }],
    starterCode: { JavaScript: 'function isEmpty(s) {\n  // your code here\n}', Python: 'def is_empty(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEmpty(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEmpty(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'JavaScript'
  },
  {
    id: 6172, title: 'Is String Empty', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string returns true' }],
    starterCode: { JavaScript: 'function isEmpty(s) {\n  // your code here\n}', Python: 'def is_empty(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEmpty(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEmpty(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'Python'
  },
  {
    id: 6173, title: 'Is String Empty', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string returns true' }],
    starterCode: { JavaScript: 'function isEmpty(s) {\n  // your code here\n}', Python: 'def is_empty(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEmpty(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEmpty(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'Java'
  },
  {
    id: 6174, title: 'Is String Empty', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string returns true' }],
    starterCode: { JavaScript: 'function isEmpty(s) {\n  // your code here\n}', Python: 'def is_empty(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEmpty(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEmpty(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'Cpp'
  },
  {
    id: 6181, title: 'Is Value Negative Check', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is negative, false otherwise.',
    examples: [{ input: 'n = -5', output: 'true', explanation: '-5 is negative' }],
    starterCode: { JavaScript: 'function isNegative(n) {\n  // your code here\n}', Python: 'def is_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isNegative(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '-5', expectedOutput: 'true' }],
    language: 'JavaScript'
  },
  {
    id: 6182, title: 'Is Value Negative Check', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is negative, false otherwise.',
    examples: [{ input: 'n = -5', output: 'true', explanation: '-5 is negative' }],
    starterCode: { JavaScript: 'function isNegative(n) {\n  // your code here\n}', Python: 'def is_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isNegative(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '-5', expectedOutput: 'true' }],
    language: 'Python'
  },
  {
    id: 6183, title: 'Is Value Negative Check', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is negative, false otherwise.',
    examples: [{ input: 'n = -5', output: 'true', explanation: '-5 is negative' }],
    starterCode: { JavaScript: 'function isNegative(n) {\n  // your code here\n}', Python: 'def is_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isNegative(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '-5', expectedOutput: 'true' }],
    language: 'Java'
  },
  {
    id: 6184, title: 'Is Value Negative Check', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if n is negative, false otherwise.',
    examples: [{ input: 'n = -5', output: 'true', explanation: '-5 is negative' }],
    starterCode: { JavaScript: 'function isNegative(n) {\n  // your code here\n}', Python: 'def is_negative(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isNegative(int n) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isNegative(int n) {\n    // your code here\n}' },
    testcases: [{ input: '-5', expectedOutput: 'true' }],
    language: 'Cpp'
  },
  {
    id: 6191, title: 'Value Increment', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 5', output: '6', explanation: '5 + 1 = 6' }],
    starterCode: { JavaScript: 'function increment(n) {\n  // your code here\n}', Python: 'def increment(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int increment(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int increment(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '6' }],
    language: 'JavaScript'
  },
  {
    id: 6192, title: 'Value Increment', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 5', output: '6', explanation: '5 + 1 = 6' }],
    starterCode: { JavaScript: 'function increment(n) {\n  // your code here\n}', Python: 'def increment(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int increment(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int increment(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '6' }],
    language: 'Python'
  },
  {
    id: 6193, title: 'Value Increment', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 5', output: '6', explanation: '5 + 1 = 6' }],
    starterCode: { JavaScript: 'function increment(n) {\n  // your code here\n}', Python: 'def increment(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int increment(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int increment(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '6' }],
    language: 'Java'
  },
  {
    id: 6194, title: 'Value Increment', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 5', output: '6', explanation: '5 + 1 = 6' }],
    starterCode: { JavaScript: 'function increment(n) {\n  // your code here\n}', Python: 'def increment(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int increment(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int increment(int n) {\n    // your code here\n}' },
    testcases: [{ input: '5', expectedOutput: '6' }],
    language: 'Cpp'
  },
  {
    id: 6201, title: 'Convert Celsius to Fahrenheit', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Convert Celsius to Fahrenheit.',
    examples: [{ input: 'c = 0', output: '32', explanation: '0°C = 32°F' }],
    starterCode: { JavaScript: 'function celsiusToFahrenheit(c) {\n  // your code here\n}', Python: 'def celsius_to_fahrenheit(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public double celsiusToFahrenheit(double c) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'double celsiusToFahrenheit(double c) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '32' }],
    language: 'JavaScript'
  },
  {
    id: 6202, title: 'Convert Celsius to Fahrenheit', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Convert Celsius to Fahrenheit.',
    examples: [{ input: 'c = 0', output: '32', explanation: '0°C = 32°F' }],
    starterCode: { JavaScript: 'function celsiusToFahrenheit(c) {\n  // your code here\n}', Python: 'def celsius_to_fahrenheit(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public double celsiusToFahrenheit(double c) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'double celsiusToFahrenheit(double c) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '32' }],
    language: 'Python'
  },
  {
    id: 6203, title: 'Convert Celsius to Fahrenheit', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Convert Celsius to Fahrenheit.',
    examples: [{ input: 'c = 0', output: '32', explanation: '0°C = 32°F' }],
    starterCode: { JavaScript: 'function celsiusToFahrenheit(c) {\n  // your code here\n}', Python: 'def celsius_to_fahrenheit(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public double celsiusToFahrenheit(double c) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'double celsiusToFahrenheit(double c) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '32' }],
    language: 'Java'
  },
  {
    id: 6204, title: 'Convert Celsius to Fahrenheit', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Convert Celsius to Fahrenheit.',
    examples: [{ input: 'c = 0', output: '32', explanation: '0°C = 32°F' }],
    starterCode: { JavaScript: 'function celsiusToFahrenheit(c) {\n  // your code here\n}', Python: 'def celsius_to_fahrenheit(c):\n    # your code here\n    pass', Java: 'public class Solution {\n    public double celsiusToFahrenheit(double c) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'double celsiusToFahrenheit(double c) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '32' }],
    language: 'Cpp'
  },
  {
    id: 6211, title: 'Cube of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return its cube (n^3).',
    examples: [{ input: 'n = 2', output: '8', explanation: '2^3 = 8' }],
    starterCode: { JavaScript: 'function cube(n) {\n  // your code here\n}', Python: 'def cube(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cube(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cube(int n) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'JavaScript'
  },
  {
    id: 6212, title: 'Cube of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return its cube (n^3).',
    examples: [{ input: 'n = 2', output: '8', explanation: '2^3 = 8' }],
    starterCode: { JavaScript: 'function cube(n) {\n  // your code here\n}', Python: 'def cube(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cube(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cube(int n) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'Python'
  },
  {
    id: 6213, title: 'Cube of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return its cube (n^3).',
    examples: [{ input: 'n = 2', output: '8', explanation: '2^3 = 8' }],
    starterCode: { JavaScript: 'function cube(n) {\n  // your code here\n}', Python: 'def cube(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cube(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cube(int n) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'Java'
  },
  {
    id: 6214, title: 'Cube of a Number', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return its cube (n^3).',
    examples: [{ input: 'n = 2', output: '8', explanation: '2^3 = 8' }],
    starterCode: { JavaScript: 'function cube(n) {\n  // your code here\n}', Python: 'def cube(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int cube(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int cube(int n) {\n    // your code here\n}' },
    testcases: [{ input: '2', expectedOutput: '8' }],
    language: 'Cpp'
  },
  {
    id: 6221, title: 'Check Equality', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if a and b are equal, false otherwise.',
    examples: [{ input: 'a = 5, b = 5', output: 'true', explanation: '5 equals 5' }],
    starterCode: { JavaScript: 'function isEqual(a, b) {\n  // your code here\n}', Python: 'def is_equal(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEqual(int a, int b) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEqual(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 5', expectedOutput: 'true' }],
    language: 'JavaScript'
  },
  {
    id: 6222, title: 'Check Equality', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if a and b are equal, false otherwise.',
    examples: [{ input: 'a = 5, b = 5', output: 'true', explanation: '5 equals 5' }],
    starterCode: { JavaScript: 'function isEqual(a, b) {\n  // your code here\n}', Python: 'def is_equal(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEqual(int a, int b) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEqual(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 5', expectedOutput: 'true' }],
    language: 'Python'
  },
  {
    id: 6223, title: 'Check Equality', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if a and b are equal, false otherwise.',
    examples: [{ input: 'a = 5, b = 5', output: 'true', explanation: '5 equals 5' }],
    starterCode: { JavaScript: 'function isEqual(a, b) {\n  // your code here\n}', Python: 'def is_equal(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEqual(int a, int b) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEqual(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 5', expectedOutput: 'true' }],
    language: 'Java'
  },
  {
    id: 6224, title: 'Check Equality', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Return true if a and b are equal, false otherwise.',
    examples: [{ input: 'a = 5, b = 5', output: 'true', explanation: '5 equals 5' }],
    starterCode: { JavaScript: 'function isEqual(a, b) {\n  // your code here\n}', Python: 'def is_equal(a, b):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isEqual(int a, int b) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isEqual(int a, int b) {\n    // your code here\n}' },
    testcases: [{ input: '5, 5', expectedOutput: 'true' }],
    language: 'Cpp'
  },
  {
    id: 6231, title: 'Concatenate Three Strings', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Concatenate three strings in order.',
    examples: [{ input: 's1="a", s2="b", s3="c"', output: 'abc', explanation: 'a + b + c = abc' }],
    starterCode: { JavaScript: 'function concatThree(s1, s2, s3) {\n  // your code here\n}', Python: 'def concat_three(s1, s2, s3):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String concatThree(String s1, String s2, String s3) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string concatThree(std::string s1, std::string s2, std::string s3) {\n    // your code here\n}' },
    testcases: [{ input: '"a", "b", "c"', expectedOutput: 'abc' }],
    language: 'JavaScript'
  },
  {
    id: 6232, title: 'Concatenate Three Strings', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Concatenate three strings in order.',
    examples: [{ input: 's1="a", s2="b", s3="c"', output: 'abc', explanation: 'a + b + c = abc' }],
    starterCode: { JavaScript: 'function concatThree(s1, s2, s3) {\n  // your code here\n}', Python: 'def concat_three(s1, s2, s3):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String concatThree(String s1, String s2, String s3) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string concatThree(std::string s1, std::string s2, std::string s3) {\n    // your code here\n}' },
    testcases: [{ input: '"a", "b", "c"', expectedOutput: 'abc' }],
    language: 'Python'
  },
  {
    id: 6233, title: 'Concatenate Three Strings', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Concatenate three strings in order.',
    examples: [{ input: 's1="a", s2="b", s3="c"', output: 'abc', explanation: 'a + b + c = abc' }],
    starterCode: { JavaScript: 'function concatThree(s1, s2, s3) {\n  // your code here\n}', Python: 'def concat_three(s1, s2, s3):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String concatThree(String s1, String s2, String s3) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string concatThree(std::string s1, std::string s2, std::string s3) {\n    // your code here\n}' },
    testcases: [{ input: '"a", "b", "c"', expectedOutput: 'abc' }],
    language: 'Java'
  },
  {
    id: 6234, title: 'Concatenate Three Strings', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Concatenate three strings in order.',
    examples: [{ input: 's1="a", s2="b", s3="c"', output: 'abc', explanation: 'a + b + c = abc' }],
    starterCode: { JavaScript: 'function concatThree(s1, s2, s3) {\n  // your code here\n}', Python: 'def concat_three(s1, s2, s3):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String concatThree(String s1, String s2, String s3) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string concatThree(std::string s1, std::string s2, std::string s3) {\n    // your code here\n}' },
    testcases: [{ input: '"a", "b", "c"', expectedOutput: 'abc' }],
    language: 'Cpp'
  },
  {
    id: 6241, title: 'Area of a Rectangle', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given length and width, return area.',
    examples: [{ input: 'length = 5, width = 4', output: '20', explanation: '5 * 4 = 20' }],
    starterCode: { JavaScript: 'function area(length, width) {\n  // your code here\n}', Python: 'def area(length, width):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int area(int length, int width) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int area(int length, int width) {\n    // your code here\n}' },
    testcases: [{ input: '5, 4', expectedOutput: '20' }],
    language: 'JavaScript'
  },
  {
    id: 6242, title: 'Area of a Rectangle', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given length and width, return area.',
    examples: [{ input: 'length = 5, width = 4', output: '20', explanation: '5 * 4 = 20' }],
    starterCode: { JavaScript: 'function area(length, width) {\n  // your code here\n}', Python: 'def area(length, width):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int area(int length, int width) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int area(int length, int width) {\n    // your code here\n}' },
    testcases: [{ input: '5, 4', expectedOutput: '20' }],
    language: 'Python'
  },
  {
    id: 6243, title: 'Area of a Rectangle', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given length and width, return area.',
    examples: [{ input: 'length = 5, width = 4', output: '20', explanation: '5 * 4 = 20' }],
    starterCode: { JavaScript: 'function area(length, width) {\n  // your code here\n}', Python: 'def area(length, width):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int area(int length, int width) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int area(int length, int width) {\n    // your code here\n}' },
    testcases: [{ input: '5, 4', expectedOutput: '20' }],
    language: 'Java'
  },
  {
    id: 6244, title: 'Area of a Rectangle', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given length and width, return area.',
    examples: [{ input: 'length = 5, width = 4', output: '20', explanation: '5 * 4 = 20' }],
    starterCode: { JavaScript: 'function area(length, width) {\n  // your code here\n}', Python: 'def area(length, width):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int area(int length, int width) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int area(int length, int width) {\n    // your code here\n}' },
    testcases: [{ input: '5, 4', expectedOutput: '20' }],
    language: 'Cpp'
  },
  {
    id: 6251, title: 'Find Next Integer', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 0', output: '1', explanation: '0 + 1 = 1' }],
    starterCode: { JavaScript: 'function nextInt(n) {\n  // your code here\n}', Python: 'def next_int(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int nextInt(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int nextInt(int n) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '1' }],
    language: 'JavaScript'
  },
  {
    id: 6252, title: 'Find Next Integer', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 0', output: '1', explanation: '0 + 1 = 1' }],
    starterCode: { JavaScript: 'function nextInt(n) {\n  // your code here\n}', Python: 'def next_int(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int nextInt(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int nextInt(int n) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '1' }],
    language: 'Python'
  },
  {
    id: 6253, title: 'Find Next Integer', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 0', output: '1', explanation: '0 + 1 = 1' }],
    starterCode: { JavaScript: 'function nextInt(n) {\n  // your code here\n}', Python: 'def next_int(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int nextInt(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int nextInt(int n) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '1' }],
    language: 'Java'
  },
  {
    id: 6254, title: 'Find Next Integer', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n + 1.',
    examples: [{ input: 'n = 0', output: '1', explanation: '0 + 1 = 1' }],
    starterCode: { JavaScript: 'function nextInt(n) {\n  // your code here\n}', Python: 'def next_int(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int nextInt(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int nextInt(int n) {\n    // your code here\n}' },
    testcases: [{ input: '0', expectedOutput: '1' }],
    language: 'Cpp'
  },
  {
    id: 6261, title: 'Double the Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n * 2.',
    examples: [{ input: 'n = 4', output: '8', explanation: '4 * 2 = 8' }],
    starterCode: { JavaScript: 'function double(n) {\n  // your code here\n}', Python: 'def double(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int doubleNum(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int doubleNum(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '8' }],
    language: 'JavaScript'
  },
  {
    id: 6262, title: 'Double the Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n * 2.',
    examples: [{ input: 'n = 4', output: '8', explanation: '4 * 2 = 8' }],
    starterCode: { JavaScript: 'function double(n) {\n  // your code here\n}', Python: 'def double(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int doubleNum(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int doubleNum(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '8' }],
    language: 'Python'
  },
  {
    id: 6263, title: 'Double the Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n * 2.',
    examples: [{ input: 'n = 4', output: '8', explanation: '4 * 2 = 8' }],
    starterCode: { JavaScript: 'function double(n) {\n  // your code here\n}', Python: 'def double(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int doubleNum(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int doubleNum(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '8' }],
    language: 'Java'
  },
  {
    id: 6264, title: 'Double the Number', difficulty: 'Basic', acceptance: '98%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given n, return n * 2.',
    examples: [{ input: 'n = 4', output: '8', explanation: '4 * 2 = 8' }],
    starterCode: { JavaScript: 'function double(n) {\n  // your code here\n}', Python: 'def double(n):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int doubleNum(int n) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int doubleNum(int n) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '8' }],
    language: 'Cpp'
  },
  {
    id: 6271, title: 'String Blank Validation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string is blank' }],
    starterCode: { JavaScript: 'function isBlank(s) {\n  // your code here\n}', Python: 'def is_blank(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isBlank(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isBlank(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'JavaScript'
  },
  {
    id: 6272, title: 'String Blank Validation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string is blank' }],
    starterCode: { JavaScript: 'function isBlank(s) {\n  // your code here\n}', Python: 'def is_blank(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isBlank(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isBlank(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'Python'
  },
  {
    id: 6273, title: 'String Blank Validation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string is blank' }],
    starterCode: { JavaScript: 'function isBlank(s) {\n  // your code here\n}', Python: 'def is_blank(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isBlank(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isBlank(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'Java'
  },
  {
    id: 6274, title: 'String Blank Validation', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Return true if string is empty, false otherwise.',
    examples: [{ input: 's = ""', output: 'true', explanation: 'Empty string is blank' }],
    starterCode: { JavaScript: 'function isBlank(s) {\n  // your code here\n}', Python: 'def is_blank(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public boolean isBlank(String s) {\n        // your code here\n        return false;\n    }\n}', Cpp: 'bool isBlank(std::string s) {\n    // your code here\n}' },
    testcases: [{ input: '""', expectedOutput: 'true' }],
    language: 'Cpp'
  },
  {
    id: 6281, title: 'Perimeter of a Square', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side s, return perimeter (4 * s).',
    examples: [{ input: 's = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function perimeter(s) {\n  // your code here\n}', Python: 'def perimeter(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int perimeter(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int perimeter(int s) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'JavaScript'
  },
  {
    id: 6282, title: 'Perimeter of a Square', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side s, return perimeter (4 * s).',
    examples: [{ input: 's = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function perimeter(s) {\n  // your code here\n}', Python: 'def perimeter(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int perimeter(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int perimeter(int s) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'Python'
  },
  {
    id: 6283, title: 'Perimeter of a Square', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side s, return perimeter (4 * s).',
    examples: [{ input: 's = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function perimeter(s) {\n  // your code here\n}', Python: 'def perimeter(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int perimeter(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int perimeter(int s) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'Java'
  },
  {
    id: 6284, title: 'Perimeter of a Square', difficulty: 'Basic', acceptance: '97%',
    solved: false, category: 'Algorithms', topics: ['Math'], companies: [],
    description: 'Given side s, return perimeter (4 * s).',
    examples: [{ input: 's = 4', output: '16', explanation: '4 * 4 = 16' }],
    starterCode: { JavaScript: 'function perimeter(s) {\n  // your code here\n}', Python: 'def perimeter(s):\n    # your code here\n    pass', Java: 'public class Solution {\n    public int perimeter(int s) {\n        // your code here\n        return 0;\n    }\n}', Cpp: 'int perimeter(int s) {\n    // your code here\n}' },
    testcases: [{ input: '4', expectedOutput: '16' }],
    language: 'Cpp'
  },
  {
    id: 6291, title: 'Invert Boolean String', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given "true" or "false", return the opposite.',
    examples: [{ input: 'flag = "true"', output: 'false', explanation: 'Invert true to false' }],
    starterCode: { JavaScript: 'function invertBoolean(flag) {\n  // your code here\n}', Python: 'def invert_boolean(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String invertBoolean(String flag) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string invertBoolean(std::string flag) {\n    // your code here\n}' },
    testcases: [{ input: '"true"', expectedOutput: 'false' }],
    language: 'JavaScript'
  },
  {
    id: 6292, title: 'Invert Boolean String', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given "true" or "false", return the opposite.',
    examples: [{ input: 'flag = "true"', output: 'false', explanation: 'Invert true to false' }],
    starterCode: { JavaScript: 'function invertBoolean(flag) {\n  // your code here\n}', Python: 'def invert_boolean(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String invertBoolean(String flag) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string invertBoolean(std::string flag) {\n    // your code here\n}' },
    testcases: [{ input: '"true"', expectedOutput: 'false' }],
    language: 'Python'
  },
  {
    id: 6293, title: 'Invert Boolean String', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given "true" or "false", return the opposite.',
    examples: [{ input: 'flag = "true"', output: 'false', explanation: 'Invert true to false' }],
    starterCode: { JavaScript: 'function invertBoolean(flag) {\n  // your code here\n}', Python: 'def invert_boolean(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String invertBoolean(String flag) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string invertBoolean(std::string flag) {\n    // your code here\n}' },
    testcases: [{ input: '"true"', expectedOutput: 'false' }],
    language: 'Java'
  },
  {
    id: 6294, title: 'Invert Boolean String', difficulty: 'Basic', acceptance: '96%',
    solved: false, category: 'Algorithms', topics: ['String'], companies: [],
    description: 'Given "true" or "false", return the opposite.',
    examples: [{ input: 'flag = "true"', output: 'false', explanation: 'Invert true to false' }],
    starterCode: { JavaScript: 'function invertBoolean(flag) {\n  // your code here\n}', Python: 'def invert_boolean(flag):\n    # your code here\n    pass', Java: 'public class Solution {\n    public String invertBoolean(String flag) {\n        // your code here\n        return \"\";\n    }\n}', Cpp: 'std::string invertBoolean(std::string flag) {\n    // your code here\n}' },
    testcases: [{ input: '"true"', expectedOutput: 'false' }],
    language: 'Cpp'
  },
];
