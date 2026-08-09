import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    console.log("Running curriculum sync...");

    // Example logic: In a real app, this would fetch from an external JSON or API.
    // For now, we will seed a few hardcoded problems to demonstrate the DB structure.
    
    const problemsToSeed = [
      {
        sheet: 'NeetCode 150',
        category: 'Arrays & Hashing',
        title: 'Contains Duplicate',
        title_slug: 'contains-duplicate',
        difficulty: 'Easy',
        sort_order: 1,
        difficulty_rank: 1
      },
      {
        sheet: 'NeetCode 150',
        category: 'Arrays & Hashing',
        title: 'Valid Anagram',
        title_slug: 'valid-anagram',
        difficulty: 'Easy',
        sort_order: 2,
        difficulty_rank: 1
      },
      {
        sheet: 'NeetCode 150',
        category: 'Arrays & Hashing',
        title: 'Two Sum',
        title_slug: 'two-sum',
        difficulty: 'Easy',
        sort_order: 3,
        difficulty_rank: 1
      },
      {
        sheet: 'NeetCode 150',
        category: 'Arrays & Hashing',
        title: 'Group Anagrams',
        title_slug: 'group-anagrams',
        difficulty: 'Medium',
        sort_order: 4,
        difficulty_rank: 2
      }
    ];

    const { data, error } = await supabase
      .from('curriculum_problems')
      .upsert(problemsToSeed, { onConflict: 'title_slug' });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      message: `Curriculum synced successfully.`,
      count: problemsToSeed.length
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error syncing curriculum:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
