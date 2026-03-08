interface GitLabActivity {
  commits: number;
  mrsOpened: number;
  mrsReviewed: number;
  issuesClosed: number;
  projects: string[];
}

export async function pullGitLabActivity(
  accessToken: string
): Promise<GitLabActivity> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Get current user
  const userRes = await fetch("https://gitlab.com/api/v4/user", { headers });
  if (!userRes.ok) {
    return { commits: 0, mrsOpened: 0, mrsReviewed: 0, issuesClosed: 0, projects: [] };
  }
  const user = await userRes.json();

  // Get recent events
  const eventsRes = await fetch(
    `https://gitlab.com/api/v4/users/${user.id}/events?after=${since.split("T")[0]}&per_page=100`,
    { headers }
  );

  if (!eventsRes.ok) {
    return { commits: 0, mrsOpened: 0, mrsReviewed: 0, issuesClosed: 0, projects: [] };
  }

  const events = await eventsRes.json();
  let commits = 0;
  let mrsOpened = 0;
  let mrsReviewed = 0;
  let issuesClosed = 0;
  const projects = new Set<string>();

  for (const event of events) {
    const createdAt = event.created_at || "";
    if (createdAt < since) continue;

    if (event.project_id) {
      projects.add(String(event.project_id));
    }

    switch (event.action_name) {
      case "pushed to":
      case "pushed new":
        commits += event.push_data?.commit_count || 1;
        break;
      case "opened":
        if (event.target_type === "MergeRequest") mrsOpened++;
        break;
      case "accepted":
      case "approved":
        if (event.target_type === "MergeRequest") mrsReviewed++;
        break;
      case "closed":
        if (event.target_type === "Issue") issuesClosed++;
        break;
    }
  }

  return { commits, mrsOpened, mrsReviewed, issuesClosed, projects: Array.from(projects) };
}

export function formatGitLabActivity(activity: GitLabActivity) {
  const items = [];
  if (activity.commits > 0) {
    items.push({
      type: "gitlab_commits",
      label: "GitLab Commits",
      quantity: `${activity.commits} commits`,
      raw: activity.commits,
    });
  }
  if (activity.mrsOpened > 0) {
    items.push({
      type: "gitlab_mrs_opened",
      label: "Merge Requests Opened",
      quantity: `${activity.mrsOpened} MRs`,
      raw: activity.mrsOpened,
    });
  }
  if (activity.mrsReviewed > 0) {
    items.push({
      type: "gitlab_mrs_reviewed",
      label: "MR Reviews",
      quantity: `${activity.mrsReviewed} reviews`,
      raw: activity.mrsReviewed,
    });
  }
  if (activity.issuesClosed > 0) {
    items.push({
      type: "gitlab_issues",
      label: "GitLab Issues Closed",
      quantity: `${activity.issuesClosed} issues`,
      raw: activity.issuesClosed,
    });
  }
  return items;
}
