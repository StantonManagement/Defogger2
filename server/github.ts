import { Octokit } from "@octokit/rest";
import type { GitHubIssue, GitHubWorkload, GitHubCollaborator } from "../shared/schema";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  collaborators: 10 * 60 * 1000, // 10 minutes
  workload: 5 * 60 * 1000, // 5 minutes
};

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export const getOctokit = (token: string) => {
  if (!token) {
    throw new Error("GitHub token is required");
  }
  return new Octokit({ auth: token });
};

const getRepoInfo = () => {
  const repo = process.env.GITHUB_REPO || "StantonManagement/Defogger2";
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    throw new Error("Invalid GITHUB_REPO format. Expected: owner/repo");
  }
  return { owner, repo: repoName };
};

export async function createGitHubIssue(issueData: GitHubIssue, token: string) {
  try {
    const octokit = getOctokit(token);
    const { owner, repo } = getRepoInfo();

    const labels = ["assigned", ...(issueData.labels || [])];
    if (issueData.priority) {
      labels.push(`priority:${issueData.priority}`);
    }

    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: issueData.title,
      body: issueData.description || "",
      assignee: issueData.assignee,
      labels: labels,
    });

    return {
      success: true,
      issue: {
        number: response.data.number,
        url: response.data.html_url,
        id: response.data.id,
      },
    };
  } catch (error: any) {
    console.error("Error creating GitHub issue:", error);
    return {
      success: false,
      error: error.message || "Failed to create GitHub issue",
    };
  }
}

export async function getTeamWorkload(token: string): Promise<{ success: boolean; data?: GitHubWorkload[]; error?: string }> {
  try {
    const { owner, repo } = getRepoInfo();
    const cacheKey = `workload:${owner}/${repo}`;
    
    // Check cache first
    const cachedData = getCached<GitHubWorkload[]>(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData };
    }

    const octokit = getOctokit(token);

    // Check rate limit before making request
    const { data: rateLimit } = await octokit.rest.rateLimit.get();
    if (rateLimit.rate.remaining < 10) {
      return {
        success: false,
        error: `Rate limit low. Remaining: ${rateLimit.rate.remaining}. Resets at ${new Date(rateLimit.rate.reset * 1000).toLocaleTimeString()}`,
      };
    }

    // Fetch all open issues
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: 100,
      sort: "created",
      direction: "asc",
    });

    // Group issues by assignee
    const workloadMap = new Map<string, any>();

    for (const issue of issues) {
      if (issue.pull_request) continue; // Skip pull requests

      const assigneeLogin = issue.assignee?.login || "unassigned";
      
      if (!workloadMap.has(assigneeLogin)) {
        workloadMap.set(assigneeLogin, {
          login: assigneeLogin,
          avatar_url: issue.assignee?.avatar_url || undefined,
          issues: [],
          totalIssues: 0,
          daysSinceOldest: 0,
        });
      }

      const workload = workloadMap.get(assigneeLogin)!;
      workload.issues.push({
        id: issue.id,
        title: issue.title,
        created_at: issue.created_at,
        html_url: issue.html_url,
        labels: issue.labels.map((label: any) => ({
          name: label.name,
          color: label.color,
        })),
      });
      workload.totalIssues++;

      // Calculate days since oldest issue
      const createdDate = new Date(issue.created_at);
      const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      workload.daysSinceOldest = Math.max(workload.daysSinceOldest, daysSince);
    }

    const workloadData = Array.from(workloadMap.values());

    // Cache the result
    setCache(cacheKey, workloadData, CACHE_TTL.workload);

    return {
      success: true,
      data: workloadData,
    };
  } catch (error: any) {
    console.error("Error fetching team workload:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch team workload",
    };
  }
}

export async function getRepositoryCollaborators(token: string): Promise<{ success: boolean; data?: GitHubCollaborator[]; error?: string }> {
  try {
    const { owner, repo } = getRepoInfo();
    const cacheKey = `collaborators:${owner}/${repo}`;
    
    // Check cache first
    const cachedData = getCached<GitHubCollaborator[]>(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData };
    }

    const octokit = getOctokit(token);

    // Check rate limit before making request
    const { data: rateLimit } = await octokit.rest.rateLimit.get();
    if (rateLimit.rate.remaining < 10) {
      return {
        success: false,
        error: `Rate limit low. Remaining: ${rateLimit.rate.remaining}. Resets at ${new Date(rateLimit.rate.reset * 1000).toLocaleTimeString()}`,
      };
    }

    const { data: collaborators } = await octokit.rest.repos.listCollaborators({
      owner,
      repo,
      per_page: 100,
    });

    const collaboratorData = collaborators.map((collaborator) => ({
      login: collaborator.login,
      avatar_url: collaborator.avatar_url,
      html_url: collaborator.html_url,
    }));

    // Cache the result
    setCache(cacheKey, collaboratorData, CACHE_TTL.collaborators);

    return {
      success: true,
      data: collaboratorData,
    };
  } catch (error: any) {
    console.error("Error fetching collaborators:", error);
    
    // If rate limited, provide helpful message
    if (error.status === 403 && error.message.includes('rate limit')) {
      return {
        success: false,
        error: "GitHub API rate limit exceeded. Please wait before trying again.",
      };
    }
    
    return {
      success: false,
      error: error.message || "Failed to fetch repository collaborators",
    };
  }
}