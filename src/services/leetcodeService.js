/**
 * Service to interact with LeetCode public API, check submission status,
 * and verify account ownership via Secret Bio Token.
 */

const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";
const BACKUP_API_BASE = "https://alfa-leetcode-api.onrender.com";

/**
 * Verify if user owns a LeetCode account by searching for secretToken in their profile "aboutMe/summary"
 */
export async function verifyLeetCodeBio(username, secretToken) {
  if (!username || !secretToken) return { verified: false, error: "Username and token are required" };

  try {
    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              aboutMe
              summary
              realName
            }
          }
        }
      `,
      variables: { username: username.trim() }
    };

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.matchedUser) {
        const profile = data.data.matchedUser.profile || {};
        const bioText = (profile.aboutMe || "") + " " + (profile.summary || "");
        
        if (bioText.toLowerCase().includes(secretToken.toLowerCase())) {
          return { verified: true, message: "Token successfully found in LeetCode profile bio!" };
        } else {
          return {
            verified: false,
            error: `Secret token '${secretToken}' not found in @${username}'s LeetCode profile bio. Make sure to paste it in your 'Summary/About Me' and save!`,
            currentBio: bioText.trim() || "(Empty Bio)"
          };
        }
      } else {
        return { verified: false, error: `LeetCode user '@${username}' does not exist.` };
      }
    }
  } catch (err) {
    console.warn("Direct LeetCode profile fetch failed due to CORS/Network. Trying backup proxy...", err);
  }

  // Backup proxy API attempt
  try {
    const proxyRes = await fetch(`${BACKUP_API_BASE}/${username.trim()}`);
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      const bioText = (proxyData.aboutMe || proxyData.summary || proxyData.about || "");
      if (bioText.toLowerCase().includes(secretToken.toLowerCase())) {
        return { verified: true, message: "Token verified via backup API!" };
      }
    }
  } catch (proxyErr) {
    console.warn("Backup proxy failed", proxyErr);
  }

  // Verification fallback option for demo / offline resilience
  return {
    verified: false,
    isOfflineMode: true,
    error: "Could not read LeetCode profile bio directly due to CORS restrictions. Use 'Demo Bypass Verification' to link."
  };
}

/**
 * Fetch recent submissions for a given username via LeetCode GraphQL or Proxy API
 */
export async function fetchUserSubmissions(username) {
  if (!username) return { success: false, error: "Username is required" };

  try {
    const graphqlQuery = {
      query: `
        query getUserSubmissions($username: String!, $limit: Int!) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            statusDisplay
            timestamp
          }
        }
      `,
      variables: { username: username.trim(), limit: 20 }
    };

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.recentSubmissionList) {
        return {
          success: true,
          submissions: data.data.recentSubmissionList,
          source: "Direct GraphQL"
        };
      }
    }
  } catch (err) {
    console.warn("Direct LeetCode GraphQL fetch failed or blocked by CORS, trying backup proxy API...", err);
  }

  try {
    const proxyRes = await fetch(`${BACKUP_API_BASE}/${username.trim()}/acSubmission?limit=20`);
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData.submission || Array.isArray(proxyData)) {
        const subs = proxyData.submission || proxyData;
        return {
          success: true,
          submissions: subs.map(s => ({
            title: s.title,
            titleSlug: s.titleSlug,
            statusDisplay: "Accepted",
            timestamp: s.timestamp
          })),
          source: "Backup Proxy API"
        };
      }
    }
  } catch (proxyErr) {
    console.warn("Backup proxy API also failed", proxyErr);
  }

  return {
    success: false,
    error: "Could not fetch LeetCode data dynamically due to CORS/Network restrictions.",
    isOfflineMode: true
  };
}

/**
 * Verify if user has solved the assigned problem slug today
 */
export async function verifyDailySubmission(username, targetTitleSlug, targetDateString) {
  const result = await fetchUserSubmissions(username);

  if (!result.success) {
    return {
      verified: false,
      error: result.error,
      isOfflineMode: result.isOfflineMode
    };
  }

  const normalizedTarget = targetTitleSlug.trim().toLowerCase();
  
  const matchedSubmission = result.submissions.find(sub => {
    const isMatchingSlug = sub.titleSlug && sub.titleSlug.toLowerCase() === normalizedTarget;
    const isAccepted = sub.statusDisplay && sub.statusDisplay.toLowerCase() === "accepted";
    
    let isToday = true;
    if (sub.timestamp) {
      const subDate = new Date(parseInt(sub.timestamp) * 1000).toISOString().split('T')[0];
      const targetDate = targetDateString || new Date().toISOString().split('T')[0];
      isToday = subDate === targetDate;
    }

    return isMatchingSlug && isAccepted && isToday;
  });

  if (matchedSubmission) {
    return {
      verified: true,
      submissionTime: matchedSubmission.timestamp 
        ? new Date(parseInt(matchedSubmission.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "Just now",
      submissionTitle: matchedSubmission.title
    };
  }

  return {
    verified: false,
    reason: `No accepted submission found for '${targetTitleSlug}' today.`
  };
}
