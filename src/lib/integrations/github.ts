import { Octokit } from "@octokit/rest";

interface GitHubActivity {
  commits: number;
  prsOpened: number;
  prsReviewed: number;
  issuesClosed: number;
  repos: string[];
}

export async function pullGitHubActivity(
  accessToken: string
): Promise<GitHubActivity> {
  const octokit = new Octokit({ auth: accessToken });
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: user } = await octokit.users.getAuthenticated();
  const username = user.login;

  // Get repos the user has pushed to recently
  const { data: repoList } = await octokit.repos.listForAuthenticatedUser({
    sort: "pushed",
    per_page: 10,
  });

  let commits = 0;
  let prsOpened = 0;
  let prsReviewed = 0;
  let issuesClosed = 0;
  const activeRepos: string[] = [];

  // Count commits across recent repos
  const commitPromises = repoList.map(async (repo) => {
    try {
      const { data: repoCommits } = await octokit.repos.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        author: username,
        since,
        per_page: 100,
      });
      if (repoCommits.length > 0) {
        activeRepos.push(repo.full_name);
      }
      return repoCommits.length;
    } catch {
      return 0;
    }
  });

  const commitCounts = await Promise.all(commitPromises);
  commits = commitCounts.reduce((sum, c) => sum + c, 0);

  // Get PRs and issues via events API
  const { data: events } = await octokit.activity.listEventsForAuthenticatedUser(
    { username, per_page: 100 }
  );

  for (const event of events) {
    const createdAt = event.created_at || "";
    if (createdAt < since) continue;

    switch (event.type) {
      case "PullRequestEvent": {
        const payload = event.payload as { action?: string };
        if (payload.action === "opened") prsOpened++;
        break;
      }
      case "PullRequestReviewEvent":
        prsReviewed++;
        break;
      case "IssuesEvent": {
        const payload = event.payload as { action?: string };
        if (payload.action === "closed") issuesClosed++;
        break;
      }
    }
  }

  return { commits, prsOpened, prsReviewed, issuesClosed, repos: activeRepos };
}

export function formatGitHubActivity(activity: GitHubActivity) {
  const items = [];
  if (activity.commits > 0) {
    items.push({
      type: "github_commits",
      label: "GitHub Commits",
      quantity: `${activity.commits} commits`,
      raw: activity.commits,
    });
  }
  if (activity.prsOpened > 0) {
    items.push({
      type: "github_prs_opened",
      label: "Pull Requests Opened",
      quantity: `${activity.prsOpened} PRs`,
      raw: activity.prsOpened,
    });
  }
  if (activity.prsReviewed > 0) {
    items.push({
      type: "github_prs_reviewed",
      label: "Code Reviews",
      quantity: `${activity.prsReviewed} reviews`,
      raw: activity.prsReviewed,
    });
  }
  if (activity.issuesClosed > 0) {
    items.push({
      type: "github_issues",
      label: "Issues Closed",
      quantity: `${activity.issuesClosed} issues`,
      raw: activity.issuesClosed,
    });
  }
  return items;
}
