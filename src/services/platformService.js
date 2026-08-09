const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";
const LEETCODE_BACKUP_API_BASE = "https://alfa-leetcode-api.onrender.com";

// --- LeetCode Service ---

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
    const proxyRes = await fetch(`${LEETCODE_BACKUP_API_BASE}/${username.trim()}`);
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

export async function fetchLeetCodeSubmissions(username) {
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
    console.warn("Direct LeetCode GraphQL fetch failed or blocked by CORS, trying CORS proxy...", err);
  }

  // Try CORS proxy fallback
  try {
    const corsProxyRes = await fetch(`https://corsproxy.io/?${encodeURIComponent(LEETCODE_GRAPHQL_ENDPOINT)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      })
    });
    if (corsProxyRes.ok) {
      const data = await corsProxyRes.json();
      if (data.data && data.data.recentSubmissionList) {
        return {
          success: true,
          submissions: data.data.recentSubmissionList,
          source: "CORS Proxy"
        };
      }
    }
  } catch (corsErr) {
    console.warn("CORS proxy failed, trying backup REST API...", corsErr);
  }

  try {
    const proxyRes = await fetch(`${LEETCODE_BACKUP_API_BASE}/${username.trim()}/acSubmission?limit=20`);
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


// --- Unified Verification Services ---

export async function verifyPlatformProfile(platform, username, secretToken) {
  if (secretToken) {
    return verifyLeetCodeBio(username, secretToken);
  }
  return checkPlatformHandleExist(platform, username);
}

export async function checkPlatformHandleExist(platform, username) {
  if (!username) return { verified: false, error: "Username is required." };
  const cleanUser = username.trim();

  // LeetCode
  try {
    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
            }
          }
        }
      `,
      variables: { username: cleanUser }
    };
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery)
    });
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.matchedUser) {
        const realName = data.data.matchedUser.profile?.realName || cleanUser;
        return { verified: true, realName, username: data.data.matchedUser.username };
      }
    }
  } catch (err) {
    console.warn("LeetCode profile check network/CORS fallback:", err);
  }
  return { verified: true, realName: cleanUser, username: cleanUser };
}

export async function verifyDailySubmission(platform, username, targetSlugOrId, targetDateString) {
  // LeetCode
  const result = await fetchLeetCodeSubmissions(username);
  if (!result.success) {
    return {
      verified: false,
      error: result.error,
      isOfflineMode: result.isOfflineMode
    };
  }

  const normalizedTarget = targetSlugOrId.trim().toLowerCase();
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
    reason: `No accepted submission found for '${targetSlugOrId}' today.`
  };
}
