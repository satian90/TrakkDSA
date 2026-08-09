import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mfqrobqectaeqhgcahjd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ECJ4cVfsa1tkplyYJLnWTw_vQH1vDKo';

// Note: Use anon key to simulate client behavior
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
  const username = `testuser_${Date.now()}`;
  const email = `${username}@codestake.app`;
  const password = 'password123';

  console.log(`Signing up ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  
  console.log('Auth success. User ID:', authData.user.id);
  console.log('Session exists?', !!authData.session);

  const row = {
    id: `mem-${Date.now()}`,
    name: username,
    leetcode_username: username,
    platform: 'LeetCode',
    auth_uid: authData.user.id,
    gmail: email
  };

  console.log('Inserting into members:', row);
  const { error: insertError } = await supabase.from('members').insert(row);
  
  if (insertError) {
    console.error('Insert Error:', insertError);
  } else {
    console.log('Insert Success!');
  }
}

testSignup();
