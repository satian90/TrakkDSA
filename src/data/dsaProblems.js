// DSA Sheets dataset: NeetCode 150 & Striver A-Z Sheet

export function getCodeChefRatingInfo(points) {
  // Convert points/score to CodeChef style Rating & Stars
  const rating = 1200 + (points * 8); // Base 1200 + points multiplier
  
  if (rating >= 2500) return { stars: "7★", div: "Div 1", label: "Grandmaster", color: "#d9534f", badgeClass: "star-7" };
  if (rating >= 2200) return { stars: "6★", div: "Div 1", label: "Master", color: "#ff8c00", badgeClass: "star-6" };
  if (rating >= 2000) return { stars: "5★", div: "Div 2", label: "Candidate Master", color: "#ffc107", badgeClass: "star-5" };
  if (rating >= 1800) return { stars: "4★", div: "Div 2", label: "Expert", color: "#aa3bff", badgeClass: "star-4" };
  if (rating >= 1600) return { stars: "3★", div: "Div 3", label: "Specialist", color: "#337ab7", badgeClass: "star-3" };
  if (rating >= 1400) return { stars: "2★", div: "Div 3", label: "Pupil", color: "#1e7e34", badgeClass: "star-2" };
  return { stars: "1★", div: "Div 4", label: "Newbie", color: "#6c757d", badgeClass: "star-1" };
}

export const NEETCODE_150 = [
  {
    id: "nc-1",
    sheet: "NeetCode 150",
    category: "Arrays & Hashing",
    title: "Contains Duplicate",
    titleSlug: "contains-duplicate",
    difficulty: "Easy",
    codechefCode: "CONTDUP",
    estimatedRating: 1100,
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    solutionUrl: "https://neetcode.io/solutions/contains-duplicate"
  },
  {
    id: "nc-2",
    sheet: "NeetCode 150",
    category: "Arrays & Hashing",
    title: "Valid Anagram",
    titleSlug: "valid-anagram",
    difficulty: "Easy",
    codechefCode: "ANAGRAM",
    estimatedRating: 1150,
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    solutionUrl: "https://neetcode.io/solutions/valid-anagram"
  },
  {
    id: "nc-3",
    sheet: "NeetCode 150",
    category: "Arrays & Hashing",
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    codechefCode: "TWOSUM",
    estimatedRating: 1200,
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    solutionUrl: "https://neetcode.io/solutions/two-sum"
  },
  {
    id: "nc-4",
    sheet: "NeetCode 150",
    category: "Arrays & Hashing",
    title: "Group Anagrams",
    titleSlug: "group-anagrams",
    difficulty: "Medium",
    codechefCode: "GRPANAG",
    estimatedRating: 1450,
    leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
    solutionUrl: "https://neetcode.io/solutions/group-anagrams"
  },
  {
    id: "nc-5",
    sheet: "NeetCode 150",
    category: "Arrays & Hashing",
    title: "Top K Frequent Elements",
    titleSlug: "top-k-frequent-elements",
    difficulty: "Medium",
    codechefCode: "TOPKF",
    estimatedRating: 1550,
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    solutionUrl: "https://neetcode.io/solutions/top-k-frequent-elements"
  },
  {
    id: "nc-6",
    sheet: "NeetCode 150",
    category: "Two Pointers",
    title: "Valid Palindrome",
    titleSlug: "valid-palindrome",
    difficulty: "Easy",
    codechefCode: "PALIN",
    estimatedRating: 1100,
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
    solutionUrl: "https://neetcode.io/solutions/valid-palindrome"
  },
  {
    id: "nc-7",
    sheet: "NeetCode 150",
    category: "Two Pointers",
    title: "3Sum",
    titleSlug: "3sum",
    difficulty: "Medium",
    codechefCode: "THREESUM",
    estimatedRating: 1600,
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    solutionUrl: "https://neetcode.io/solutions/3sum"
  },
  {
    id: "nc-8",
    sheet: "NeetCode 150",
    category: "Two Pointers",
    title: "Container With Most Water",
    titleSlug: "container-with-most-water",
    difficulty: "Medium",
    codechefCode: "MAXWATER",
    estimatedRating: 1650,
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    solutionUrl: "https://neetcode.io/solutions/container-with-most-water"
  },
  {
    id: "nc-9",
    sheet: "NeetCode 150",
    category: "Sliding Window",
    title: "Best Time to Buy and Sell Stock",
    titleSlug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    codechefCode: "BUYSELL",
    estimatedRating: 1250,
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    solutionUrl: "https://neetcode.io/solutions/best-time-to-buy-and-sell-stock"
  },
  {
    id: "nc-10",
    sheet: "NeetCode 150",
    category: "Sliding Window",
    title: "Longest Substring Without Repeating Characters",
    titleSlug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    codechefCode: "LNSUBSTR",
    estimatedRating: 1500,
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    solutionUrl: "https://neetcode.io/solutions/longest-substring-without-repeating-characters"
  }
];

export const STRIVER_AZ_SHEET = [
  {
    id: "st-1",
    sheet: "Striver A-Z",
    category: "Step 1: Basics",
    title: "User Input / Output & Data Types",
    titleSlug: "find-closest-number-to-zero",
    difficulty: "Easy",
    codechefCode: "BASICS01",
    estimatedRating: 1000,
    leetcodeUrl: "https://leetcode.com/problems/find-closest-number-to-zero/",
    striverUrl: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/"
  },
  {
    id: "st-2",
    sheet: "Striver A-Z",
    category: "Step 3: Arrays [Easy]",
    title: "Largest Element in an Array",
    titleSlug: "largest-element-in-an-array",
    difficulty: "Easy",
    codechefCode: "MAXELEM",
    estimatedRating: 1050,
    leetcodeUrl: "https://leetcode.com/problems/largest-local-values-in-a-matrix/",
    striverUrl: "https://takeuforward.org/data-structure/find-the-largest-element-in-an-array/"
  },
  {
    id: "st-5",
    sheet: "Striver A-Z",
    category: "Step 3: Arrays [Medium]",
    title: "Kadane's Algorithm - Maximum Subarray",
    titleSlug: "maximum-subarray",
    difficulty: "Medium",
    codechefCode: "KADANE",
    estimatedRating: 1450,
    leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
    striverUrl: "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/"
  },
  {
    id: "st-6",
    sheet: "Striver A-Z",
    category: "Step 3: Arrays [Medium]",
    title: "Sort an array of 0s, 1s and 2s (Dutch National Flag)",
    titleSlug: "sort-colors",
    difficulty: "Medium",
    codechefCode: "DUTCHFLAG",
    estimatedRating: 1400,
    leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
    striverUrl: "https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/"
  }
];

export const INITIAL_MEMBERS = [
  {
    id: "mem-1",
    name: "Aarav Sharma",
    gmail: "aarav.sharma@gmail.com",
    leetcodeUsername: "aarav_coder",
    verifiedBio: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=aarav",
    color: "#ffb300",
    initialDeposit: 500,
    depositBalance: 450,
    currentStreak: 5,
    totalPoints: 120,
    solvedCount: 12,
    penaltiesPaid: 50,
    history: {
      "2026-08-06": { solved: true, titleSlug: "two-sum", verifiedAt: "2026-08-06T14:22:00Z" },
      "2026-08-05": { solved: true, titleSlug: "valid-anagram", verifiedAt: "2026-08-05T18:10:00Z" },
      "2026-08-04": { solved: false, penaltyApplied: true, penaltyAmount: 50 }
    }
  },
  {
    id: "mem-2",
    name: "Priya Patel",
    gmail: "priya.dev@gmail.com",
    leetcodeUsername: "priya_dev",
    verifiedBio: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=priya",
    color: "#ec4899",
    initialDeposit: 500,
    depositBalance: 500,
    currentStreak: 9,
    totalPoints: 190,
    solvedCount: 19,
    penaltiesPaid: 0,
    history: {
      "2026-08-06": { solved: true, titleSlug: "two-sum", verifiedAt: "2026-08-06T09:15:00Z" },
      "2026-08-05": { solved: true, titleSlug: "valid-anagram", verifiedAt: "2026-08-05T11:40:00Z" }
    }
  },
  {
    id: "mem-3",
    name: "Rohan Verma",
    gmail: "rohan.v@gmail.com",
    leetcodeUsername: "rohan_v",
    verifiedBio: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rohan",
    color: "#3b82f6",
    initialDeposit: 500,
    depositBalance: 350,
    currentStreak: 0,
    totalPoints: 70,
    solvedCount: 7,
    penaltiesPaid: 150,
    history: {
      "2026-08-06": { solved: false, penaltyApplied: false },
      "2026-08-05": { solved: false, penaltyApplied: true, penaltyAmount: 50 }
    }
  }
];

export const DEFAULT_DAILY_TASK = {
  id: "nc-3",
  title: "Two Sum",
  titleSlug: "two-sum",
  codechefCode: "TWOSUM",
  difficulty: "Easy",
  estimatedRating: 1200,
  category: "Arrays & Hashing",
  sheet: "NeetCode 150",
  leetcodeUrl: "https://leetcode.com/problems/two-sum/",
  solutionUrl: "https://neetcode.io/solutions/two-sum",
  dateAssigned: "2026-08-06",
  pointsValue: 10,
  penaltyAmount: 50
};
