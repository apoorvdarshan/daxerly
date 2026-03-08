interface LinearActivity {
  issuesCreated: number;
  issuesCompleted: number;
  comments: number;
  projects: string[];
}

export async function pullLinearActivity(
  accessToken: string
): Promise<LinearActivity> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const query = `{
    viewer {
      createdIssues(filter: { createdAt: { gte: "${since}" } }, first: 100) {
        nodes { id }
      }
      assignedIssues(filter: { completedAt: { gte: "${since}" } }, first: 100) {
        nodes { id project { name } }
      }
    }
    comments(filter: { createdAt: { gte: "${since}" } }, first: 100) {
      nodes { id }
    }
  }`;

  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    return { issuesCreated: 0, issuesCompleted: 0, comments: 0, projects: [] };
  }

  const { data } = await res.json();
  if (!data?.viewer) {
    return { issuesCreated: 0, issuesCompleted: 0, comments: 0, projects: [] };
  }

  const issuesCreated = data.viewer.createdIssues?.nodes?.length || 0;
  const completedNodes = data.viewer.assignedIssues?.nodes || [];
  const issuesCompleted = completedNodes.length;
  const projectSet = new Set<string>();
  for (const n of completedNodes) {
    const name = (n as { project?: { name: string } }).project?.name;
    if (name) projectSet.add(name);
  }
  const projects = Array.from(projectSet);
  const comments = data.comments?.nodes?.length || 0;

  return { issuesCreated, issuesCompleted, comments, projects };
}

export function formatLinearActivity(activity: LinearActivity) {
  const items = [];
  if (activity.issuesCreated > 0) {
    items.push({
      type: "linear_issues_created",
      label: "Linear Issues Created",
      quantity: `${activity.issuesCreated} issues`,
      raw: activity.issuesCreated,
    });
  }
  if (activity.issuesCompleted > 0) {
    items.push({
      type: "linear_issues_completed",
      label: "Linear Issues Completed",
      quantity: `${activity.issuesCompleted} issues`,
      raw: activity.issuesCompleted,
    });
  }
  if (activity.comments > 0) {
    items.push({
      type: "linear_comments",
      label: "Linear Comments",
      quantity: `${activity.comments} comments`,
      raw: activity.comments,
    });
  }
  return items;
}
