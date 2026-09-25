/**
 * DSA Problems — Centralized LeetCode Problem Dataset
 *
 * Each problem contains:
 * - metadata (id, title, topic, difficulty)
 * - official LeetCode URL (leetcodeUrl)
 * - statement, examples, constraints
 */

export const topics = [
  { id: 'arrays', name: 'Arrays', description: 'Fundamental contiguous memory data structure and array algorithms.' },
  { id: 'strings', name: 'Strings', description: 'Sequence of characters and string manipulation techniques.' },
  { id: 'linkedlist', name: 'Linked List', description: 'Linear collection of data elements connected via pointers.' },
  { id: 'stackqueue', name: 'Stack & Queue', description: 'LIFO and FIFO data structures for controlled element access.' },
  { id: 'recursion', name: 'Recursion', description: 'Functions calling themselves to solve subproblems.' },
  { id: 'searching', name: 'Searching', description: 'Algorithms for locating elements efficiently.' },
  { id: 'sorting', name: 'Sorting', description: 'Algorithms for arranging data in specified orders.' },
  { id: 'trees', name: 'Trees', description: 'Hierarchical node-based data structures.' },
  { id: 'graphs', name: 'Graphs', description: 'Network of vertices connected by edges.' },
  { id: 'dp', name: 'Dynamic Programming', description: 'Optimization over plain recursion through memoization and bottom-up DP.' },
];

export const problems = [
  // ============================================================
  // ARRAYS
  // ============================================================
  {
    id: 'arr-1',
    title: 'Two Sum',
    topic: 'arrays',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.']
  },
  {
    id: 'arr-2',
    title: 'Best Time to Buy and Sell Stock',
    topic: 'arrays',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    statement: `You are given an array prices where prices[i] is the price of a given stock on the i-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and max profit = 0.' }
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4']
  },
  {
    id: 'arr-3',
    title: 'Maximum Subarray',
    topic: 'arrays',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/',
    statement: `Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'The subarray [1] has the largest sum 1.' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4']
  },
  {
    id: 'arr-4',
    title: 'Product of Array Except Self',
    topic: 'arrays',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
    statement: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30']
  },
  {
    id: 'arr-5',
    title: 'Merge Intervals',
    topic: 'arrays',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/',
    statement: `Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merged into [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'Intervals [1,4] and [4,5] are considered overlapping.' }
    ],
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= start_i <= end_i <= 10^4']
  },

  // ============================================================
  // STRINGS
  // ============================================================
  {
    id: 'str-1',
    title: 'Valid Palindrome',
    topic: 'strings',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
    statement: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' }
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.']
  },
  {
    id: 'str-2',
    title: 'Valid Anagram',
    topic: 'strings',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
    statement: `Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.']
  },
  {
    id: 'str-3',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'strings',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    statement: `Given a string s, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.']
  },
  {
    id: 'str-4',
    title: 'Longest Palindromic Substring',
    topic: 'strings',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/',
    statement: `Given a string s, return the longest palindromic substring in s.`,
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"' }
    ],
    constraints: ['1 <= s.length <= 1000', 's consists of only digits and English letters.']
  },
  {
    id: 'str-5',
    title: 'Minimum Window Substring',
    topic: 'strings',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    statement: `Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "a"', output: '"a"' }
    ],
    constraints: ['m == s.length', 'n == t.length', '1 <= m, n <= 10^5']
  },

  // ============================================================
  // LINKED LIST
  // ============================================================
  {
    id: 'll-1',
    title: 'Reverse Linked List',
    topic: 'linkedlist',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    statement: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' }
    ],
    constraints: ['The number of nodes in the list is in the range [0, 5000].', '-5000 <= Node.val <= 5000']
  },
  {
    id: 'll-2',
    title: 'Merge Two Sorted Lists',
    topic: 'linkedlist',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    statement: `You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' }
    ],
    constraints: ['The number of nodes in both lists is in the range [0, 50].', '-100 <= Node.val <= 100']
  },
  {
    id: 'll-3',
    title: 'Linked List Cycle',
    topic: 'linkedlist',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/',
    statement: `Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.`,
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).' },
      { input: 'head = [1,2], pos = 0', output: 'true' }
    ],
    constraints: ['The number of the nodes in the list is in the range [0, 10^4].', '-10^5 <= Node.val <= 10^5']
  },
  {
    id: 'll-4',
    title: 'Remove Nth Node From End of List',
    topic: 'linkedlist',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    statement: `Given the head of a linked list, remove the nth node from the end of the list and return its head.`,
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
      { input: 'head = [1], n = 1', output: '[]' }
    ],
    constraints: ['The number of nodes in the list is sz.', '1 <= sz <= 30', '1 <= n <= sz']
  },
  {
    id: 'll-5',
    title: 'Merge k Sorted Lists',
    topic: 'linkedlist',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    statement: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' }
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500']
  },

  // ============================================================
  // STACK & QUEUE
  // ============================================================
  {
    id: 'sq-1',
    title: 'Valid Parentheses',
    topic: 'stackqueue',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and closed in the correct order.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\'.']
  },
  {
    id: 'sq-2',
    title: 'Implement Queue using Stacks',
    topic: 'stackqueue',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/',
    statement: `Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).`,
    examples: [
      { input: '["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]', output: '[null, null, null, 1, 1, false]' }
    ],
    constraints: ['1 <= x <= 9', 'At most 100 calls will be made to push, pop, peek, and empty.']
  },
  {
    id: 'sq-3',
    title: 'Min Stack',
    topic: 'stackqueue',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/min-stack/',
    statement: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).`,
    examples: [
      { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]' }
    ],
    constraints: ['-2^31 <= val <= 2^31 - 1', 'Methods pop, top and getMin will always be called on non-empty stacks.']
  },
  {
    id: 'sq-4',
    title: 'Sliding Window Maximum',
    topic: 'stackqueue',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/',
    statement: `You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.`,
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
      { input: 'nums = [1], k = 1', output: '[1]' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length']
  },

  // ============================================================
  // RECURSION
  // ============================================================
  {
    id: 'rec-1',
    title: 'Fibonacci Number',
    topic: 'recursion',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/fibonacci-number/',
    statement: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).`,
    examples: [
      { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
      { input: 'n = 3', output: '2', explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.' }
    ],
    constraints: ['0 <= n <= 30']
  },
  {
    id: 'rec-2',
    title: 'Climbing Stairs',
    topic: 'recursion',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
    statement: `You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: '1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step' }
    ],
    constraints: ['1 <= n <= 45']
  },
  {
    id: 'rec-3',
    title: 'Subsets',
    topic: 'recursion',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/subsets/',
    statement: `Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
      { input: 'nums = [0]', output: '[[],[0]]' }
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'All the numbers of nums are unique.']
  },
  {
    id: 'rec-4',
    title: 'Word Search',
    topic: 'recursion',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/word-search/',
    statement: `Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring.`,
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: 'true' }
    ],
    constraints: ['m == board.length', 'n = board[i].length', '1 <= m, n <= 6', '1 <= word.length <= 15']
  },

  // ============================================================
  // SEARCHING
  // ============================================================
  {
    id: 'search-1',
    title: 'Binary Search',
    topic: 'searching',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
    statement: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' }
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All elements in nums are unique.', 'nums is sorted in ascending order.']
  },
  {
    id: 'search-2',
    title: 'Search in Rotated Sorted Array',
    topic: 'searching',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    statement: `Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' }
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique.']
  },
  {
    id: 'search-3',
    title: 'Find Minimum in Rotated Sorted Array',
    topic: 'searching',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    statement: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array.`,
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'The original array was [1,2,3,4,5] rotated 3 times.' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0', explanation: 'The original array was [0,1,2,4,5,6,7] and it was rotated 4 times.' }
    ],
    constraints: ['n == nums.length', '1 <= n <= 5000', '-5000 <= nums[i] <= 5000']
  },

  // ============================================================
  // SORTING
  // ============================================================
  {
    id: 'sort-1',
    title: 'Merge Sorted Array',
    topic: 'sorting',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/merge-sorted-array/',
    statement: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order in-place inside nums1.`,
    examples: [
      { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' },
      { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' }
    ],
    constraints: ['nums1.length == m + n', 'nums2.length == n', '0 <= m, n <= 200']
  },
  {
    id: 'sort-2',
    title: 'Sort Colors',
    topic: 'sorting',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/sort-colors/',
    statement: `Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue. We will use the integers 0, 1, and 2 to represent the color red, white, and blue respectively.`,
    examples: [
      { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' },
      { input: 'nums = [2,0,1]', output: '[0,1,2]' }
    ],
    constraints: ['n == nums.length', '1 <= n <= 300', 'nums[i] is either 0, 1, or 2.']
  },
  {
    id: 'sort-3',
    title: 'Kth Largest Element in an Array',
    topic: 'sorting',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    statement: `Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element.`,
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4']
  },

  // ============================================================
  // TREES
  // ============================================================
  {
    id: 'tree-1',
    title: 'Maximum Depth of Binary Tree',
    topic: 'trees',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    statement: `Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-100 <= Node.val <= 100']
  },
  {
    id: 'tree-2',
    title: 'Invert Binary Tree',
    topic: 'trees',
    difficulty: 'Easy',
    leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    statement: `Given the root of a binary tree, invert the tree, and return its root.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100']
  },
  {
    id: 'tree-3',
    title: 'Binary Tree Level Order Traversal',
    topic: 'trees',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    statement: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000']
  },
  {
    id: 'tree-4',
    title: 'Validate Binary Search Tree',
    topic: 'trees',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
    statement: `Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined such that left subtree nodes are strictly less than root, right subtree nodes are strictly greater than root, and both left and right subtrees are valid BSTs.`,
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'The root node\'s value is 5 but its right child\'s value is 4.' }
    ],
    constraints: ['The number of nodes in the tree is in the range [1, 10^4].', '-2^31 <= Node.val <= 2^31 - 1']
  },
  {
    id: 'tree-5',
    title: 'Serialize and Deserialize Binary Tree',
    topic: 'trees',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    statement: `Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.`,
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
      { input: 'root = []', output: '[]' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-1000 <= Node.val <= 1000']
  },

  // ============================================================
  // GRAPHS
  // ============================================================
  {
    id: 'graph-1',
    title: 'Number of Islands',
    topic: 'graphs',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    statement: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300']
  },
  {
    id: 'graph-2',
    title: 'Clone Graph',
    topic: 'graphs',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/clone-graph/',
    statement: `Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.`,
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' },
      { input: 'adjList = [[]]', output: '[[]]' }
    ],
    constraints: ['The number of nodes in the graph is in the range [0, 100].', '1 <= Node.val <= 100']
  },
  {
    id: 'graph-3',
    title: 'Course Schedule',
    topic: 'graphs',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/course-schedule/',
    statement: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a_i, b_i] indicates that you must take course b_i first if you want to take course a_i. Return true if you can finish all courses. Otherwise, return false.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Take course 0 first then course 1.' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'To take course 1 you should take course 0, and to take course 0 you should also take course 1. So it is impossible.' }
    ],
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000']
  },
  {
    id: 'graph-4',
    title: 'Pacific Atlantic Water Flow',
    topic: 'graphs',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    statement: `There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. Given an m x n integer matrix heights, return a 2D list of grid coordinates result where result[i] = [r_i, c_i] denotes that rain water can flow from cell (r_i, c_i) to both the Pacific and Atlantic oceans.`,
    examples: [
      { input: 'heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]', output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]' }
    ],
    constraints: ['m == heights.length', 'n == heights[r].length', '1 <= m, n <= 200']
  },
  {
    id: 'graph-5',
    title: 'Alien Dictionary',
    topic: 'graphs',
    difficulty: 'Hard',
    leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/',
    statement: `There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you. You are given a list of strings words from the alien language's dictionary, where the strings in words are sorted lexicographically by the rules of this new language. Return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If there is no solution, return "".`,
    examples: [
      { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"' },
      { input: 'words = ["z","x"]', output: '"zx"' }
    ],
    constraints: ['1 <= words.length <= 100', '1 <= words[i].length <= 100']
  },

  // ============================================================
  // DYNAMIC PROGRAMMING
  // ============================================================
  {
    id: 'dp-1',
    title: 'Coin Change',
    topic: 'dp',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
    statement: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4']
  },
  {
    id: 'dp-2',
    title: 'Longest Increasing Subsequence',
    topic: 'dp',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    statement: `Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.`,
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], length 4.' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' }
    ],
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4']
  },
  {
    id: 'dp-3',
    title: 'Word Break',
    topic: 'dp',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/word-break/',
    statement: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' }
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 20']
  },
  {
    id: 'dp-4',
    title: 'Combination Sum IV',
    topic: 'dp',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/combination-sum-iv/',
    statement: `Given an array of distinct integers nums and a target integer target, return the number of possible combinations that add up to target. The test cases are generated so that the answer fits in a 32-bit integer.`,
    examples: [
      { input: 'nums = [1,2,3], target = 4', output: '7', explanation: 'The possible combination ways are:\n(1, 1, 1, 1)\n(1, 1, 2)\n(1, 2, 1)\n(2, 1, 1)\n(1, 3)\n(3, 1)\n(2, 2)' }
    ],
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 1000', 'All elements of nums are unique.', '1 <= target <= 1000']
  },
  {
    id: 'dp-5',
    title: 'House Robber',
    topic: 'dp',
    difficulty: 'Medium',
    leetcodeUrl: 'https://leetcode.com/problems/house-robber/',
    statement: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected. Return the maximum amount of money you can rob tonight without alerting the police.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and rob house 3 (money = 3). Total = 1 + 3 = 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 2 + 9 + 1 = 12.' }
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400']
  }
];

/**
 * Get a problem by ID
 */
export function getProblemById(id) {
  return problems.find(p => p.id === id) || null;
}

/**
 * Get safe problem data for frontend (returns problem object)
 */
export function getSafeProblemData(problem) {
  if (!problem) return null;
  return problem;
}
