import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    console.log("Running midnight daily task assignment...");

    const today = new Date().toISOString().split('T')[0];

    // Check if today is a holiday
    const { data: holidayData } = await supabase
      .from('holidays')
      .select('*')
      .eq('date', today)
      .single();

    if (holidayData) {
      console.log(`Today (${today}) is a holiday: ${holidayData.label}. Skipping task assignment.`);
      return new Response(JSON.stringify({ message: "Holiday skipped" }), { headers: { "Content-Type": "application/json" } });
    }

    // Get active sprint
    const { data: sprintData } = await supabase
      .from('sprints')
      .select('*')
      .eq('status', 'ACTIVE')
      .limit(1)
      .single();
    
    if (!sprintData) {
      console.log("No active sprint found.");
      return new Response(JSON.stringify({ message: "No active sprint" }), { headers: { "Content-Type": "application/json" } });
    }

    // Get all previously assigned tasks to avoid duplicates
    const { data: pastTasks } = await supabase
      .from('daily_task')
      .select('curriculum_problem_id')
      .not('curriculum_problem_id', 'is', null);
      
    const pastTaskIds = pastTasks?.map(t => t.curriculum_problem_id) || [];

    // Select the next problem from curriculum
    const query = supabase
      .from('curriculum_problems')
      .select('*')
      .eq('sheet', sprintData.curriculum_sheet)
      .order('difficulty_rank', { ascending: true })
      .order('sort_order', { ascending: true })
      .limit(1);
      
    if (pastTaskIds.length > 0) {
       query.not('id', 'in', `(${pastTaskIds.join(',')})`);
    }

    const { data: nextProblemData } = await query.single();

    if (!nextProblemData) {
      console.log("No more problems in curriculum!");
      return new Response(JSON.stringify({ message: "Curriculum exhausted" }), { headers: { "Content-Type": "application/json" } });
    }

    // Update the daily_task row (ID = 1)
    const pointsValue = nextProblemData.difficulty === 'Hard' ? 20 : nextProblemData.difficulty === 'Medium' ? 15 : 10;
    
    const newTask = {
      sprint_id: sprintData.id,
      curriculum_problem_id: nextProblemData.id,
      title: nextProblemData.title,
      title_slug: nextProblemData.title_slug,
      platform: 'LeetCode',
      difficulty: nextProblemData.difficulty,
      category: nextProblemData.category,
      sheet: nextProblemData.sheet,
      leetcode_url: `https://leetcode.com/problems/${nextProblemData.title_slug}/`,
      solution_url: '',
      date_assigned: today,
      points_value: pointsValue,
      penalty_amount: sprintData.daily_penalty,
      auto_assigned: true
    };

    const { error: updateError } = await supabase
      .from('daily_task')
      .update(newTask)
      .eq('id', 1);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      message: `Assigned new task: ${newTask.title}`,
      task: newTask
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error assigning daily task:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
