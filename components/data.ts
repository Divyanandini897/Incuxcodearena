/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Problem } from './types';

export const TOPIC_TAGS = [
  { name: 'Array', count: 2197 },
  { name: 'String', count: 880 },
  { name: 'Hash Table', count: 825 },
  { name: 'Dynamic Programming', count: 666 },
  { name: 'Math', count: 542 },
  { name: 'Sorting', count: 421 },
  { name: 'Greedy', count: 395 },
  { name: 'Depth-First Search', count: 360 },
  { name: 'Binary Search', count: 310 },
  { name: 'Two Pointers', count: 298 },
  { name: 'Breadth-First Search', count: 245 },
  { name: 'Tree', count: 212 },
  { name: 'Sliding Window', count: 150 },
  { name: 'Stack', count: 200 },
  { name: 'Divide and Conquer', count: 100 },
];

export const COMPANIES_LIST = [
  { name: 'Google', frequency: 2318 },
  { name: 'Amazon', frequency: 1981 },
  { name: 'Meta', frequency: 1102 },
  { name: 'Microsoft', frequency: 844 },
  { name: 'Apple', frequency: 303 },
  { name: 'Deloitte', frequency: 124 },
  { name: 'Uber', frequency: 256 },
  { name: 'Netflix', frequency: 189 },
];

export const PROBLEMS_DATA: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    acceptance: '53.1%',
    solved: true,
    category: 'Algorithms',
    topics: ['Array', 'Hash Table'],
    companies: [
      { name: 'Amazon', frequency: 1420 },
      { name: 'Google', frequency: 980 },
      { name: 'Microsoft', frequency: 450 },
    ],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    starterCode: {
      'C++': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
      'Python': `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
      'Java': `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      'JavaScript': `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
      'Go': `func twoSum(nums []int, target int) []int {
    
}`
    },
    testcases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { input: '[3,3]\n6', expectedOutput: '[0,1]' },
    ],
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    acceptance: '39.4%',
    solved: false,
    category: 'Algorithms',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    companies: [
      { name: 'Google', frequency: 512 },
      { name: 'Amazon', frequency: 421 },
      { name: 'Apple', frequency: 110 },
      { name: 'Deloitte', frequency: 32 },
    ],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.\nNote that the answer must be a substring, "pwke" is a subsequence and not a substring.',
      },
    ],
    starterCode: {
      'C++': `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`,
      'Python': `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`,
      'Java': `class Solution {
    public int lengthOfLongestSubstring(String s) {
        
    }
}`,
      'JavaScript': `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    
};`,
      'Go': `func lengthOfLongestSubstring(s string) int {
    
}`
    },
    testcases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' },
      { input: '"pwwkew"', expectedOutput: '3' },
    ],
  },
  {
    id: 20,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    acceptance: '40.8%',
    solved: true,
    category: 'Algorithms',
    topics: ['String', 'Stack'],
    companies: [
      { name: 'Meta', frequency: 890 },
      { name: 'Amazon', frequency: 654 },
      { name: 'Google', frequency: 345 },
    ],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    starterCode: {
      'C++': `class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
      'Python': `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
      'Java': `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
      'JavaScript': `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    
};`,
      'Go': `func isValid(s string) bool {
    
}`
    },
    testcases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
    ],
  },
  {
    id: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    acceptance: '54.5%',
    solved: false,
    category: 'Algorithms',
    topics: ['Array', 'Two Pointers', 'Greedy'],
    companies: [
      { name: 'Google', frequency: 450 },
      { name: 'Amazon', frequency: 380 },
      { name: 'Deloitte', frequency: 15 },
    ],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49.',
      },
      {
        input: 'height = [1,1]',
        output: '1',
      },
    ],
    starterCode: {
      'C++': `class Solution {
public:
    int maxArea(vector<int>& height) {
        
    }
};`,
      'Python': `class Solution:
    def maxArea(self, height: List[int]) -> int:
        pass`,
      'Java': `class Solution {
    public int maxArea(int[] height) {
        
    }
}`,
      'JavaScript': `/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    
};`,
      'Go': `func maxArea(height []int) int {
    
}`
    },
    testcases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
      { input: '[1,1]', expectedOutput: '1' },
    ],
  },
  {
    id: 4,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    acceptance: '38.2%',
    solved: false,
    category: 'Algorithms',
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
    companies: [
      { name: 'Amazon', frequency: 720 },
      { name: 'Google', frequency: 540 },
      { name: 'Meta', frequency: 310 },
    ],
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.`,
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.',
      },
      {
        input: 'nums1 = [1,2], nums2 = [3,4]',
        output: '2.50000',
        explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.',
      },
    ],
    starterCode: {
      'C++': `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        
    }
};`,
      'Python': `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        pass`,
      'Java': `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        
    }
}`,
      'JavaScript': `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    
};`,
      'Go': `func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
    
}`
    },
    testcases: [
      { input: '[1,3]\n[2]', expectedOutput: '2.0' },
      { input: '[1,2]\n[3,4]', expectedOutput: '2.5' },
    ],
  }
];
