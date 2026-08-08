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
    console.warn("Direct LeetCode GraphQL fetch failed or blocked by CORS, trying backup proxy API...", err);
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

// --- Codeforces Service ---

export async function verifyCodeforcesBio(username, secretToken) {
  if (!username || !secretToken) return { verified: false, error: "Username and token are required" };

  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username.trim()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === "OK" && data.result && data.result.length > 0) {
        const user = data.result[0];
        const firstName = user.firstName || "";
        const organization = user.organization || "";
        const checkText = firstName + " " + organization;
        if (checkText.toLowerCase().includes(secretToken.toLowerCase())) {
          return { verified: true, message: "Token successfully found in Codeforces profile!" };
        } else {
          return {
            verified: false,
            error: `Secret token '${secretToken}' not found in @${username}'s Codeforces 'First Name' or 'Organization'. Set it on Codeforces and save!`,
            currentInfo: `First Name: ${firstName || "(Not set)"}, Org: ${organization || "(Not set)"}`
          };
        }
      }
    }
    return { verified: false, error: `Codeforces user '@${username}' does not exist.` };
  } catch (err) {
    console.warn("Codeforces profile fetch failed", err);
    return {
      verified: false,
      isOfflineMode: true,
      error: "Could not fetch Codeforces profile due to network issue. Use 'Demo Bypass Verification' to link."
    };
  }
}

export async function fetchCodeforcesSubmissions(username) {
  if (!username) return { success: false, error: "Username is required" };

  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${username.trim()}&from=1&count=20`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === "OK" && data.result) {
        return {
          success: true,
          submissions: data.result,
          source: "Codeforces API"
        };
      }
    }
    return { success: false, error: "Failed to fetch submissions from Codeforces" };
  } catch (err) {
    console.warn("Codeforces submissions fetch failed", err);
    return {
      success: false,
      error: "Could not fetch Codeforces data due to network restrictions.",
      isOfflineMode: true
    };
  }
}

// --- Unified Verification Services ---

export async function verifyPlatformProfile(platform, username, secretToken) {
  if (secretToken) {
    if (platform === "Codeforces") {
      return verifyCodeforcesBio(username, secretToken);
    }
    return verifyLeetCodeBio(username, secretToken);
  }
  return checkPlatformHandleExist(platform, username);
}

export async function checkPlatformHandleExist(platform, username) {
  if (!username) return { verified: false, error: "Username is required." };
  const cleanUser = username.trim();

  if (platform === 'Codeforces') {
    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${cleanUser}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.result && data.result.length > 0) {
          const u = data.result[0];
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || cleanUser;
          return { verified: true, realName: name, username: u.handle };
        }
      }
      return { verified: false, error: `Codeforces handle '@${cleanUser}' does not exist.` };
    } catch (err) {
      console.warn("Codeforces profile check fallback:", err);
      return { verified: true, realName: cleanUser, username: cleanUser };
    }
  } else {
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
}

export async function verifyDailySubmission(platform, username, targetSlugOrId, targetDateString) {
  if (platform === "Codeforces") {
    const result = await fetchCodeforcesSubmissions(username);
    if (!result.success) {
      return {
        verified: false,
        error: result.error,
        isOfflineMode: result.isOfflineMode
      };
    }

    const normalizedTarget = targetSlugOrId.trim().toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "4a" or "1200b"
    const matchedSubmission = result.submissions.find(sub => {
      const contestId = sub.contestId ? sub.contestId.toString() : "";
      const index = sub.problem && sub.problem.index ? sub.problem.index.toString() : "";
      const problemId = (contestId + index).toLowerCase().replace(/[^a-z0-9]/g, "");
      const problemName = sub.problem && sub.problem.name ? sub.problem.name.toLowerCase() : "";

      const isMatchingId = problemId === normalizedTarget || problemName.includes(targetSlugOrId.trim().toLowerCase());
      const isAccepted = sub.verdict === "OK";

      let isToday = true;
      if (sub.creationTimeSeconds) {
        const subDate = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
        const targetDate = targetDateString || new Date().toISOString().split('T')[0];
        isToday = subDate === targetDate;
      }

      return isMatchingId && isAccepted && isToday;
    });

    if (matchedSubmission) {
      return {
        verified: true,
        submissionTime: matchedSubmission.creationTimeSeconds
          ? new Date(matchedSubmission.creationTimeSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "Just now",
        submissionTitle: matchedSubmission.problem.name
      };
    }

    return {
      verified: false,
      reason: `No Accepted (OK) submission found for '${targetSlugOrId}' today.`
    };
  } else {
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
}
