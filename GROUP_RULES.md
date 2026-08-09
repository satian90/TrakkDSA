# CodeStake Group Rules

Welcome to CodeStake! This platform is designed for our trusted group of friends to build consistency in DSA problem-solving through daily challenges, financial accountability, and friendly competition.

These rules govern how we track progress, penalize misses, and distribute the collective pot.

---

## 1. Sprint Window
- The competition runs in **fixed 30-day sprints**.
- Each sprint has explicit start and end dates created by the admin.
- Daily challenges run every calendar day within the sprint, unless specifically marked as a holiday by the admin.

## 2. Miss Definition
- Every member must solve the **auto-assigned daily LeetCode task** by **11:59 PM IST**.
- A "miss" is defined as having no Accepted submission on LeetCode for that day's specific assigned problem slug.
- **Holidays/Days Off**: Admin-declared dates are exempt. On these days, no problem is assigned, and no penalty is applied.

## 3. Penalty & Debt Tracking
- **Default Fine**: ₹50 per missed daily problem.
- **Penalty Process**:
  1. Deducts ₹50 from your `Deposit Balance` first (down to ₹0).
  2. Any remaining fine is added to your **`Debt Balance`**.
  3. The full ₹50 penalty is added to the collective Group Pot.
  4. Your current streak is reset to 0.
- Debt does **not** block dashboard access, but it is tracked for accountability and settlement at the end of the sprint.

## 4. Deposit & Dashboard Access
- **Signup**: You can sign up without paying immediately. Your account will start with a ₹0 deposit balance and a "Pending" deposit status.
- **Pending Status**: While pending, you can view the dashboard, the daily task, the leaderboard, and the penalty pot.
- **Active Competition**: You **cannot** verify submissions, earn points, or appear in the ranked leaderboard until you complete your initial deposit via UPI (choose between ₹50 to ₹500) and the admin approves it.

## 5. Payout Distribution
- At the close of a 30-day sprint, the full accumulated penalty pot is distributed to members.
- **Formula**: `Your Payout = (Your Total Points / Sum of All Competing Members' Points) × Total Pot`
- **Eligibility**: Only members with an 'Approved' deposit status who actively participated in the sprint are eligible. Members with 0 points receive ₹0.
- The Admin will calculate the payout and manually transfer the funds via UPI.

## 6. Verification
- All verification checks are strictly against **LeetCode** submissions.
- Submissions are verified automatically by the server checking the LeetCode API.
- You must ensure your LeetCode username is accurately linked in your profile.

## 7. Admin Powers
- The single Admin account has the following responsibilities:
  - Approve/reject UPI deposits.
  - Pick the curriculum sheet (e.g., NeetCode 150 or Striver A-Z) once per sprint.
  - Declare holidays/days off for the group.
  - Create and close 30-day sprints.
  - Trigger the proportional payout calculations.
  - Perform emergency overrides (e.g., manually mark a problem as solved if the API fails, or swap a daily problem).
- **No manual "Apply Fine"**: Penalties are fully automated by a midnight cron job.

## 8. Daily Question Selection
- Daily problems are **automatically assigned** every non-holiday day at midnight.
- Problems are drawn from the curriculum sheet selected by the admin for the sprint.
- **Difficulty Order**: The system will assign all 'Easy' problems first, followed by 'Medium', and finally 'Hard'.
- The frontend will directly link to the problem on LeetCode. Admin intervention is only needed for emergency overrides.

---
*By signing up and depositing collateral, you agree to abide by these rules and the automated tracking system.*
