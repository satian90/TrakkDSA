import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { username, titleSlug, date } = await req.json();

    if (!username || !titleSlug) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
    }

    const graphqlQuery = {
      query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: { username, limit: 15 }
    };

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      throw new Error("Failed to reach LeetCode API");
    }

    const data = await response.json();
    const submissions = data.data?.recentAcSubmissionList || [];

    const targetDateStr = date || new Date().toISOString().split('T')[0];

    const isSolved = submissions.some((sub: any) => {
      if (sub.titleSlug !== titleSlug) return false;
      const subDateStr = new Date(parseInt(sub.timestamp) * 1000).toISOString().split('T')[0];
      return subDateStr === targetDateStr;
    });

    return new Response(JSON.stringify({ 
      verified: isSolved,
      username,
      titleSlug,
      date: targetDateStr
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
