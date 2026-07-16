import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const problems = [
  {
    title: "Return Negative Number",
    description: "Given an integer n, return its negative counterpart. If the number is already negative or zero, return it as is.",
    baseId: 6001,
    jsFunc: "returnNegative", jsParams: "n", jsReturn: "function",
    pyFunc: "return_negative", pyParams: "n",
    javaFunc: "returnNegative", javaParams: "int n", javaReturn: "int",
    cppFunc: "returnNegative", cppParams: "int n", cppReturn: "int",
    tc1: { input: "n = 5", expectedOutput: "-5" },
    tc2: { input: "n = -3", expectedOutput: "-3" },
    ex: { input: "n = 0", output: "0", explanation: "Zero does not change its sign identity." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Remainder of Division",
    description: "Given two positive integers dividend and divisor, return the remainder when the dividend is divided by the divisor.",
    baseId: 6011,
    jsFunc: "remainderOfDivision", jsParams: "dividend, divisor", jsReturn: "function",
    pyFunc: "remainder_of_division", pyParams: "dividend, divisor",
    javaFunc: "remainderOfDivision", javaParams: "int dividend, int divisor", javaReturn: "int",
    cppFunc: "remainderOfDivision", cppParams: "int dividend, int divisor", cppReturn: "int",
    tc1: { input: "dividend = 10, divisor = 3", expectedOutput: "1" },
    tc2: { input: "dividend = 7, divisor = 2", expectedOutput: "1" },
    ex: { input: "dividend = 10, divisor = 3", output: "1", explanation: "10 divided by 3 gives quotient 3 and remainder 1." },
    constraint: "Both dividend and divisor are positive integers."
  },
  {
    title: "Minutes to Seconds",
    description: "Given an integer minutes, convert it to seconds and return the resulting value.",
    baseId: 6021,
    jsFunc: "minutesToSeconds", jsParams: "minutes", jsReturn: "function",
    pyFunc: "minutes_to_seconds", pyParams: "minutes",
    javaFunc: "minutesToSeconds", javaParams: "int minutes", javaReturn: "int",
    cppFunc: "minutesToSeconds", cppParams: "int minutes", cppReturn: "int",
    tc1: { input: "minutes = 1", expectedOutput: "60" },
    tc2: { input: "minutes = 5", expectedOutput: "300" },
    ex: { input: "minutes = 2", output: "120", explanation: "2 minutes times 60 seconds per minute equals 120 seconds." },
    constraint: "Minutes is a non-negative integer."
  },
  {
    title: "Calculate Total Edge Count",
    description: "Given an integer count representing the total number of regular triangles, calculate the total number of edges (count * 3).",
    baseId: 6031,
    jsFunc: "calculateTotalEdgeCount", jsParams: "count", jsReturn: "function",
    pyFunc: "calculate_total_edge_count", pyParams: "count",
    javaFunc: "calculateTotalEdgeCount", javaParams: "int count", javaReturn: "int",
    cppFunc: "calculateTotalEdgeCount", cppParams: "int count", cppReturn: "int",
    tc1: { input: "count = 1", expectedOutput: "3" },
    tc2: { input: "count = 5", expectedOutput: "15" },
    ex: { input: "count = 3", output: "9", explanation: "3 triangles with 3 edges each gives 9 total edges." },
    constraint: "Count is a non-negative integer."
  },
  {
    title: "String Length",
    description: "Given a string s, return the total count of characters within it.",
    baseId: 6041,
    jsFunc: "stringLength", jsParams: "s", jsReturn: "function",
    pyFunc: "string_length", pyParams: "s",
    javaFunc: "stringLength", javaParams: "String s", javaReturn: "int",
    cppFunc: "stringLength", cppParams: "string s", cppReturn: "int",
    tc1: { input: 's = "hello"', expectedOutput: "5" },
    tc2: { input: 's = ""', expectedOutput: "0" },
    ex: { input: 's = "code"', output: "4", explanation: 'The string "code" contains 4 characters.' },
    constraint: "String may be empty."
  },
  {
    title: "Square of a Number",
    description: "Given an integer n, calculate and return its square (n multiplied by itself).",
    baseId: 6051,
    jsFunc: "squareOfNumber", jsParams: "n", jsReturn: "function",
    pyFunc: "square_of_number", pyParams: "n",
    javaFunc: "squareOfNumber", javaParams: "int n", javaReturn: "int",
    cppFunc: "squareOfNumber", cppParams: "int n", cppReturn: "int",
    tc1: { input: "n = 4", expectedOutput: "16" },
    tc2: { input: "n = -3", expectedOutput: "9" },
    ex: { input: "n = 5", output: "25", explanation: "5 multiplied by itself gives 25." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Is Number Even",
    description: "Given an integer n, return true if the number is even, otherwise return false.",
    baseId: 6061,
    jsFunc: "isNumberEven", jsParams: "n", jsReturn: "function",
    pyFunc: "is_number_even", pyParams: "n",
    javaFunc: "isNumberEven", javaParams: "int n", javaReturn: "boolean",
    cppFunc: "isNumberEven", cppParams: "int n", cppReturn: "bool",
    tc1: { input: "n = 4", expectedOutput: "true" },
    tc2: { input: "n = 7", expectedOutput: "false" },
    ex: { input: "n = 0", output: "true", explanation: "0 is divisible by 2, so it is even." },
    constraint: "n is a signed 32-bit integer."
  },
  {
    title: "Hours to Seconds",
    description: "Given an integer hours, convert it to total seconds and return the result.",
    baseId: 6071,
    jsFunc: "hoursToSeconds", jsParams: "hours", jsReturn: "function",
    pyFunc: "hours_to_seconds", pyParams: "hours",
    javaFunc: "hoursToSeconds", javaParams: "int hours", javaReturn: "int",
    cppFunc: "hoursToSeconds", cppParams: "int hours", cppReturn: "int",
    tc1: { input: "hours = 1", expectedOutput: "3600" },
    tc2: { input: "hours = 2", expectedOutput: "7200" },
    ex: { input: "hours = 3", output: "10800", explanation: "3 hours times 3600 seconds per hour equals 10800 seconds." },
    constraint: "Hours is a non-negative integer."
  },
  {
    title: "Sum of Two Numbers",
    description: "Given two integers a and b, return their total sum value.",
    baseId: 6081,
    jsFunc: "sumOfTwoNumbers", jsParams: "a, b", jsReturn: "function",
    pyFunc: "sum_of_two_numbers", pyParams: "a, b",
    javaFunc: "sumOfTwoNumbers", javaParams: "int a, int b", javaReturn: "int",
    cppFunc: "sumOfTwoNumbers", cppParams: "int a, int b", cppReturn: "int",
    tc1: { input: "a = 3, b = 4", expectedOutput: "7" },
    tc2: { input: "a = -1, b = 1", expectedOutput: "0" },
    ex: { input: "a = 10, b = 20", output: "30", explanation: "10 + 20 equals 30." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Find Next Character",
    description: "Given a single ASCII alphabet character c, find and return the character right after it in alphabetical order.",
    baseId: 6091,
    jsFunc: "findNextCharacter", jsParams: "c", jsReturn: "function",
    pyFunc: "find_next_character", pyParams: "c",
    javaFunc: "findNextCharacter", javaParams: "char c", javaReturn: "char",
    cppFunc: "findNextCharacter", cppParams: "char c", cppReturn: "char",
    tc1: { input: "c = 'a'", expectedOutput: "'b'" },
    tc2: { input: "c = 'z'", expectedOutput: "'a'" },
    ex: { input: "c = 'c'", output: "'d'", explanation: "The character after 'c' in alphabetical order is 'd'." },
    constraint: "Input is a lowercase alphabet character."
  },
  {
    title: "Find Absolute Difference",
    description: "Given two integers a and b, compute and return the absolute numeric distance value between them.",
    baseId: 6101,
    jsFunc: "findAbsoluteDifference", jsParams: "a, b", jsReturn: "function",
    pyFunc: "find_absolute_difference", pyParams: "a, b",
    javaFunc: "findAbsoluteDifference", javaParams: "int a, int b", javaReturn: "int",
    cppFunc: "findAbsoluteDifference", cppParams: "int a, int b", cppReturn: "int",
    tc1: { input: "a = 5, b = 3", expectedOutput: "2" },
    tc2: { input: "a = -2, b = 4", expectedOutput: "6" },
    ex: { input: "a = 10, b = 7", output: "3", explanation: "The absolute difference |10 - 7| = 3." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Count Array Elements",
    description: "Given an array of integers arr, count and return the number of elements it contains.",
    baseId: 6111,
    jsFunc: "countArrayElements", jsParams: "arr", jsReturn: "function",
    pyFunc: "count_array_elements", pyParams: "arr",
    javaFunc: "countArrayElements", javaParams: "int[] arr", javaReturn: "int",
    cppFunc: "countArrayElements", cppParams: "vector<int> arr", cppReturn: "int",
    tc1: { input: "arr = [1, 2, 3]", expectedOutput: "3" },
    tc2: { input: "arr = []", expectedOutput: "0" },
    ex: { input: "arr = [5, 10, 15, 20]", output: "4", explanation: "The array contains 4 elements." },
    constraint: "Array length does not exceed 10^4."
  },
  {
    title: "String to Uppercase",
    description: "Given a lowercase string s, convert all alphabetic characters within it to uppercase and return it.",
    baseId: 6121,
    jsFunc: "stringToUppercase", jsParams: "s", jsReturn: "function",
    pyFunc: "string_to_uppercase", pyParams: "s",
    javaFunc: "stringToUppercase", javaParams: "String s", javaReturn: "String",
    cppFunc: "stringToUppercase", cppParams: "string s", cppReturn: "string",
    tc1: { input: 's = "hello"', expectedOutput: '"HELLO"' },
    tc2: { input: 's = "abc"', expectedOutput: '"ABC"' },
    ex: { input: 's = "code"', output: '"CODE"', explanation: "All lowercase letters are converted to uppercase." },
    constraint: "String contains only lowercase alphabetic characters."
  },
  {
    title: "Cube Volumetric Calculation",
    description: "Given the side length s of a cube, compute its volume (s * s * s).",
    baseId: 6131,
    jsFunc: "cubeVolumetricCalculation", jsParams: "s", jsReturn: "function",
    pyFunc: "cube_volumetric_calculation", pyParams: "s",
    javaFunc: "cubeVolumetricCalculation", javaParams: "int s", javaReturn: "int",
    cppFunc: "cubeVolumetricCalculation", cppParams: "int s", cppReturn: "int",
    tc1: { input: "s = 2", expectedOutput: "8" },
    tc2: { input: "s = 3", expectedOutput: "27" },
    ex: { input: "s = 4", output: "64", explanation: "4 x 4 x 4 = 64." },
    constraint: "Side length is a positive integer."
  },
  {
    title: "Logical Inverse Flag",
    description: "Given a boolean flag value, return its logical opposite.",
    baseId: 6141,
    jsFunc: "logicalInverseFlag", jsParams: "flag", jsReturn: "function",
    pyFunc: "logical_inverse_flag", pyParams: "flag",
    javaFunc: "logicalInverseFlag", javaParams: "boolean flag", javaReturn: "boolean",
    cppFunc: "logicalInverseFlag", cppParams: "bool flag", cppReturn: "bool",
    tc1: { input: "flag = true", expectedOutput: "false" },
    tc2: { input: "flag = false", expectedOutput: "true" },
    ex: { input: "flag = true", output: "false", explanation: "The logical inverse of true is false." },
    constraint: "Input is a valid boolean value."
  },
  {
    title: "First Character Selection",
    description: "Given a non-empty string s, return its first character.",
    baseId: 6151,
    jsFunc: "firstCharacterSelection", jsParams: "s", jsReturn: "function",
    pyFunc: "first_character_selection", pyParams: "s",
    javaFunc: "firstCharacterSelection", javaParams: "String s", javaReturn: "char",
    cppFunc: "firstCharacterSelection", cppParams: "string s", cppReturn: "char",
    tc1: { input: 's = "hello"', expectedOutput: "'h'" },
    tc2: { input: 's = "A"', expectedOutput: "'A'" },
    ex: { input: 's = "world"', output: "'w'", explanation: 'The first character of "world" is \'w\'.' },
    constraint: "String is non-empty."
  },
  {
    title: "Value Multiplication",
    description: "Given two integers a and b, return their product.",
    baseId: 6161,
    jsFunc: "valueMultiplication", jsParams: "a, b", jsReturn: "function",
    pyFunc: "value_multiplication", pyParams: "a, b",
    javaFunc: "valueMultiplication", javaParams: "int a, int b", javaReturn: "int",
    cppFunc: "valueMultiplication", cppParams: "int a, int b", cppReturn: "int",
    tc1: { input: "a = 3, b = 4", expectedOutput: "12" },
    tc2: { input: "a = -2, b = 5", expectedOutput: "-10" },
    ex: { input: "a = 6, b = 7", output: "42", explanation: "6 multiplied by 7 equals 42." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Is String Empty",
    description: "Given a string s, return true if it is empty, otherwise return false.",
    baseId: 6171,
    jsFunc: "isStringEmpty", jsParams: "s", jsReturn: "function",
    pyFunc: "is_string_empty", pyParams: "s",
    javaFunc: "isStringEmpty", javaParams: "String s", javaReturn: "boolean",
    cppFunc: "isStringEmpty", cppParams: "string s", cppReturn: "bool",
    tc1: { input: 's = ""', expectedOutput: "true" },
    tc2: { input: 's = "hello"', expectedOutput: "false" },
    ex: { input: 's = ""', output: "true", explanation: "An empty string returns true." },
    constraint: "Input is a valid string."
  },
  {
    title: "Is Value Negative Check",
    description: "Given an integer n, return true if it is negative, otherwise return false.",
    baseId: 6181,
    jsFunc: "isValueNegativeCheck", jsParams: "n", jsReturn: "function",
    pyFunc: "is_value_negative_check", pyParams: "n",
    javaFunc: "isValueNegativeCheck", javaParams: "int n", javaReturn: "boolean",
    cppFunc: "isValueNegativeCheck", cppParams: "int n", cppReturn: "bool",
    tc1: { input: "n = -5", expectedOutput: "true" },
    tc2: { input: "n = 3", expectedOutput: "false" },
    ex: { input: "n = 0", output: "false", explanation: "0 is not a negative number." },
    constraint: "n is a signed 32-bit integer."
  },
  {
    title: "Value Increment",
    description: "Given an integer n, return n + 1.",
    baseId: 6191,
    jsFunc: "valueIncrement", jsParams: "n", jsReturn: "function",
    pyFunc: "value_increment", pyParams: "n",
    javaFunc: "valueIncrement", javaParams: "int n", javaReturn: "int",
    cppFunc: "valueIncrement", cppParams: "int n", cppReturn: "int",
    tc1: { input: "n = 5", expectedOutput: "6" },
    tc2: { input: "n = -1", expectedOutput: "0" },
    ex: { input: "n = 10", output: "11", explanation: "10 + 1 = 11." },
    constraint: "n is a signed 32-bit integer."
  },
  {
    title: "Convert Celsius to Fahrenheit",
    description: "Given a temperature c in Celsius, convert it to Fahrenheit and return the result.",
    baseId: 6201,
    jsFunc: "celsiusToFahrenheit", jsParams: "c", jsReturn: "function",
    pyFunc: "celsius_to_fahrenheit", pyParams: "c",
    javaFunc: "celsiusToFahrenheit", javaParams: "int c", javaReturn: "int",
    cppFunc: "celsiusToFahrenheit", cppParams: "int c", cppReturn: "int",
    tc1: { input: "c = 0", expectedOutput: "32" },
    tc2: { input: "c = 100", expectedOutput: "212" },
    ex: { input: "c = 20", output: "68", explanation: "20 * 9/5 + 32 = 68." },
    constraint: "Temperature is within integer range."
  },
  {
    title: "Cube of a Number",
    description: "Given an integer n, calculate and return its cube (n * n * n).",
    baseId: 6211,
    jsFunc: "cubeOfNumber", jsParams: "n", jsReturn: "function",
    pyFunc: "cube_of_number", pyParams: "n",
    javaFunc: "cubeOfNumber", javaParams: "int n", javaReturn: "int",
    cppFunc: "cubeOfNumber", cppParams: "int n", cppReturn: "int",
    tc1: { input: "n = 2", expectedOutput: "8" },
    tc2: { input: "n = 3", expectedOutput: "27" },
    ex: { input: "n = 4", output: "64", explanation: "4 x 4 x 4 = 64." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Check Equality",
    description: "Given two integers a and b, return true if they are equal, otherwise return false.",
    baseId: 6221,
    jsFunc: "checkEquality", jsParams: "a, b", jsReturn: "function",
    pyFunc: "check_equality", pyParams: "a, b",
    javaFunc: "checkEquality", javaParams: "int a, int b", javaReturn: "boolean",
    cppFunc: "checkEquality", cppParams: "int a, int b", cppReturn: "bool",
    tc1: { input: "a = 5, b = 5", expectedOutput: "true" },
    tc2: { input: "a = 3, b = 7", expectedOutput: "false" },
    ex: { input: "a = 10, b = 10", output: "true", explanation: "Both values are equal." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "Concatenate Three Strings",
    description: "Given three strings s1, s2, and s3, concatenate them in order and return the result.",
    baseId: 6231,
    jsFunc: "concatenateThreeStrings", jsParams: "s1, s2, s3", jsReturn: "function",
    pyFunc: "concatenate_three_strings", pyParams: "s1, s2, s3",
    javaFunc: "concatenateThreeStrings", javaParams: "String s1, String s2, String s3", javaReturn: "String",
    cppFunc: "concatenateThreeStrings", cppParams: "string s1, string s2, string s3", cppReturn: "string",
    tc1: { input: 's1 = "a", s2 = "b", s3 = "c"', expectedOutput: '"abc"' },
    tc2: { input: 's1 = "hello", s2 = " ", s3 = "world"', expectedOutput: '"hello world"' },
    ex: { input: 's1 = "I", s2 = " love", s3 = " coding"', output: '"I love coding"', explanation: "The three strings are joined in order." },
    constraint: "Strings may be empty."
  },
  {
    title: "Area of a Rectangle",
    description: "Given length and width of a rectangle, return its area.",
    baseId: 6241,
    jsFunc: "areaOfRectangle", jsParams: "length, width", jsReturn: "function",
    pyFunc: "area_of_rectangle", pyParams: "length, width",
    javaFunc: "areaOfRectangle", javaParams: "int length, int width", javaReturn: "int",
    cppFunc: "areaOfRectangle", cppParams: "int length, int width", cppReturn: "int",
    tc1: { input: "length = 5, width = 3", expectedOutput: "15" },
    tc2: { input: "length = 7, width = 7", expectedOutput: "49" },
    ex: { input: "length = 10, width = 4", output: "40", explanation: "10 x 4 = 40." },
    constraint: "Length and width are positive integers."
  },
  {
    title: "Find Next Integer",
    description: "Given an integer n, return n + 1.",
    baseId: 6251,
    jsFunc: "findNextInteger", jsParams: "n", jsReturn: "function",
    pyFunc: "find_next_integer", pyParams: "n",
    javaFunc: "findNextInteger", javaParams: "int n", javaReturn: "int",
    cppFunc: "findNextInteger", cppParams: "int n", cppReturn: "int",
    tc1: { input: "n = 5", expectedOutput: "6" },
    tc2: { input: "n = -1", expectedOutput: "0" },
    ex: { input: "n = 10", output: "11", explanation: "The next integer after 10 is 11." },
    constraint: "n is a signed 32-bit integer."
  },
  {
    title: "Double the Number",
    description: "Given an integer n, return n * 2.",
    baseId: 6261,
    jsFunc: "doubleTheNumber", jsParams: "n", jsReturn: "function",
    pyFunc: "double_the_number", pyParams: "n",
    javaFunc: "doubleTheNumber", javaParams: "int n", javaReturn: "int",
    cppFunc: "doubleTheNumber", cppParams: "int n", cppReturn: "int",
    tc1: { input: "n = 5", expectedOutput: "10" },
    tc2: { input: "n = -3", expectedOutput: "-6" },
    ex: { input: "n = 7", output: "14", explanation: "7 x 2 = 14." },
    constraint: "Inputs evaluate within signed 32-bit bounds."
  },
  {
    title: "String Blank Validation",
    description: "Return true if the string s is empty, otherwise return false.",
    baseId: 6271,
    jsFunc: "stringBlankValidation", jsParams: "s", jsReturn: "function",
    pyFunc: "string_blank_validation", pyParams: "s",
    javaFunc: "stringBlankValidation", javaParams: "String s", javaReturn: "boolean",
    cppFunc: "stringBlankValidation", cppParams: "string s", cppReturn: "bool",
    tc1: { input: 's = ""', expectedOutput: "true" },
    tc2: { input: 's = "hello"', expectedOutput: "false" },
    ex: { input: 's = ""', output: "true", explanation: "An empty string is considered blank." },
    constraint: "Input is a valid string."
  },
  {
    title: "Perimeter of a Square",
    description: "Given the side length s of a square, return its perimeter (4 * s).",
    baseId: 6281,
    jsFunc: "perimeterOfSquare", jsParams: "s", jsReturn: "function",
    pyFunc: "perimeter_of_square", pyParams: "s",
    javaFunc: "perimeterOfSquare", javaParams: "int s", javaReturn: "int",
    cppFunc: "perimeterOfSquare", cppParams: "int s", cppReturn: "int",
    tc1: { input: "s = 4", expectedOutput: "16" },
    tc2: { input: "s = 10", expectedOutput: "40" },
    ex: { input: "s = 5", output: "20", explanation: "5 x 4 = 20." },
    constraint: "Side length is a positive integer."
  },
  {
    title: "Invert Boolean String",
    description: "Given a string flag containing 'true' or 'false', return the inverted value.",
    baseId: 6291,
    jsFunc: "invertBooleanString", jsParams: "flag", jsReturn: "function",
    pyFunc: "invert_boolean_string", pyParams: "flag",
    javaFunc: "invertBooleanString", javaParams: "String flag", javaReturn: "String",
    cppFunc: "invertBooleanString", cppParams: "string flag", cppReturn: "string",
    tc1: { input: 'flag = "true"', expectedOutput: '"false"' },
    tc2: { input: 'flag = "false"', expectedOutput: '"true"' },
    ex: { input: 'flag = "true"', output: '"false"', explanation: 'Inverting "true" gives "false".' },
    constraint: 'Input string is either "true" or "false".'
  }
];

const langDefs = [
  {
    languageId: "javascript",
    codeKey: "JavaScript",
    buildStarter: (p) => `function ${p.jsFunc}(${p.jsParams}) {\n  \n}`
  },
  {
    languageId: "python",
    codeKey: "Python",
    buildStarter: (p) => `def ${p.pyFunc}(${p.pyParams}):\n    pass`
  },
  {
    languageId: "java",
    codeKey: "Java",
    buildStarter: (p) => `public class Solution {\n  public ${p.javaReturn} ${p.javaFunc}(${p.javaParams}) {\n    \n  }\n}`
  },
  {
    languageId: "cpp",
    codeKey: "C++",
    buildStarter: (p) => `${p.cppReturn} ${p.cppFunc}(${p.cppParams}) {\n  \n}`
  }
];

const entries = [];

for (const p of problems) {
  for (let i = 0; i < langDefs.length; i++) {
    const lang = langDefs[i];
    const leetcodeId = p.baseId + i;
    entries.push({
      leetcodeId,
      title: p.title,
      difficulty: "Basic",
      isCustom: true,
      languageId: lang.languageId,
      description: p.description,
      starterCode: {
        [lang.codeKey]: lang.buildStarter(p)
      },
      testCases: [
        { input: p.tc1.input, expectedOutput: p.tc1.expectedOutput, isSample: true },
        { input: p.tc2.input, expectedOutput: p.tc2.expectedOutput, isSample: false }
      ],
      examples: [
        { input: p.ex.input, output: p.ex.output, explanation: p.ex.explanation }
      ],
      constraints: [
        { constraintText: p.constraint }
      ]
    });
  }
}

const outPath = join(__dirname, 'basic.json');
writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf-8');
console.log(`Written ${entries.length} entries to ${outPath}`);
