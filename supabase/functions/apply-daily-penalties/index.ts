import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    console.log("Running midnight penalty application cron job...");

    const today = new Date().toISOString().split('T')[0];

    // Check if today is a holiday
    const { data: holidayData } = await supabase
      .from('holidays')
      .select('*')
      .eq('date', today)
      .single();

    if (holidayData) {
      console.log(`Today (${today}) is a holiday: ${holidayData.label}. Skipping penalties.`);
      return new Response(JSON.stringify({ message: "Holiday skipped" }), { headers: { "Content-Type": "application/json" } });
    }

    // Get active daily task
    const { data: dailyTaskData, error: taskError } = await supabase
      .from('daily_task')
      .select('*')
      .limit(1)
      .single();
    
    if (taskError || !dailyTaskData) {
      throw new Error("Could not fetch daily task");
    }

    const taskSlug = dailyTaskData.title_slug;
    const penaltyAmount = dailyTaskData.penalty_amount || 50;

    // Get all ACTIVE, non-blocked members whose deposit is APPROVED
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('is_blocked', false)
      .eq('deposit_status', 'APPROVED');

    if (membersError) throw membersError;

    let appliedCount = 0;

    for (const member of members) {
      // Check if they solved today's problem
      const { data: submission } = await supabase
        .from('submissions')
        .select('*')
        .eq('member_id', member.id)
        .eq('date', today)
        .single();

      if (!submission || !submission.solved) {
        // Apply penalty
        const newDeposit = Math.max(0, member.deposit_balance - penaltyAmount);
        const addedDebt = member.deposit_balance < penaltyAmount ? (penaltyAmount - member.deposit_balance) : 0;
        const newDebt = member.debt_balance + addedDebt;
        const newPenaltiesPaid = member.penalties_paid + penaltyAmount;

        console.log(`Applying penalty to ${member.leetcode_username}`);

        await supabase
          .from('members')
          .update({
            deposit_balance: newDeposit,
            debt_balance: newDebt,
            penalties_paid: newPenaltiesPaid,
            current_streak: 0
          })
          .eq('id', member.id);

        // Upsert submission as penalized
        await supabase
          .from('submissions')
          .upsert({
            member_id: member.id,
            date: today,
            task_slug: taskSlug,
            solved: false,
            penalty_applied: true,
            penalty_amount: penaltyAmount,
            applied_at: new Date().toISOString()
          }, { onConflict: 'member_id,date' });

        appliedCount++;
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed penalties for ${appliedCount} members.`,
      applied_count: appliedCount
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error applying penalties:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
