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
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: user } = await octokit.users.getAuthenticated();
  const username = user.login;

  // Get recent events
  const { data: events } = await octokit.activity.listEventsForAuthenticatedUser(
    { username, per_page: 100 }
  );

  const recentEvents = events.filter(
    (e) => new Date(e.created_at || "").toISOString() >= since
  );

  let commits = 0;
  let prsOpened = 0;
  let prsReviewed = 0;
  let issuesClosed = 0;
  const repos = new Set<string>();

  for (const event of recentEvents) {
    if (event.repo) repos.add(event.repo.name);

    switch (event.type) {
      case "PushEvent": {
        const payload = event.payload as { commits?: unknown[] };
        commits += payload.commits?.length || 0;
        break;
      }
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

  return { commits, prsOpened, prsReviewed, issuesClosed, repos: Array.from(repos) };
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
