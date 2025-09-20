import { Octokit } from "@octokit/rest";
import type { GitHubIssue, GitHubWorkload, GitHubCollaborator } from "../shared/schema";

const getOctokit = () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required");
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

export async function createGitHubIssue(issueData: GitHubIssue) {
  try {
    const octokit = getOctokit();
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

export async function getTeamWorkload(): Promise<{ success: boolean; data?: GitHubWorkload[]; error?: string }> {
  try {
    const octokit = getOctokit();
    const { owner, repo } = getRepoInfo();

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

export async function getRepositoryCollaborators(): Promise<{ success: boolean; data?: GitHubCollaborator[]; error?: string }> {
  try {
    const octokit = getOctokit();
    const { owner, repo } = getRepoInfo();

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

    return {
      success: true,
      data: collaboratorData,
    };
  } catch (error: any) {
    console.error("Error fetching collaborators:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch repository collaborators",
    };
  }
}