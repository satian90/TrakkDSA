# CodeStake
## Live Demo

[Visit CodeStake](https://codestake-one.vercel.app/)
CodeStake is a private competitive programming tracker designed for small groups of friends. It automatically tracks daily LeetCode submissions, penalizes missed days by deducting from a deposit, and redistributes the penalty pot to the most consistent members at the end of a sprint.

## Features
- **30-Day Sprints**: Compete in structured timeframes.
- **Auto-Verification**: Automatic server-side verification of LeetCode submissions via Supabase Edge Functions.
- **Financial Stakes**: Members deposit a minimum amount (e.g., ₹500) via UPI to compete. Missed problems result in a ₹50 deduction.
- **Automated Penalties**: A midnight cron job automatically handles streak resets and fine deductions.
- **Automated Daily Tasks**: Automatically assigns the next problem in the selected curriculum (NeetCode 150 or Striver A-Z) ordered by difficulty.
- **Proportional Payout**: At the end of the sprint, the accumulated penalty pot is paid out based on points earned.

## Setup Instructions

### 1. Supabase Backend Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the `supabase_setup.sql` script in the Supabase SQL Editor.
3. Obtain your Project URL and anon key from Project Settings > API.

### 2. Environment Variables
Create a `.env` file in the root of your project:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_UPI_ID=your-upi-id@bank
```

### 3. Edge Functions
*Note: You need the Supabase CLI installed to deploy edge functions.*
```bash
supabase login
supabase link --project-ref your-project-id
supabase functions deploy
```

### 4. Running the Frontend
```bash
npm install
npm run dev
```

## How to Play (For Friends)
1. Register on the site with your LeetCode username.
2. Transfer your deposit collateral via the provided UPI QR code.
3. Wait for the admin to approve your deposit.
4. Solve the assigned daily task on LeetCode by 11:59 PM IST every day to avoid penalties and earn points!

---
Please refer to `GROUP_RULES.md` for detailed rules regarding misses, holidays, and payouts.
