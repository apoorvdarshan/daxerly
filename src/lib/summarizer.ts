interface RawActivityItem {
  type: string;
  label: string;
  quantity: string;
  raw: number;
}

interface ReceiptLineItem {
  label: string;
  quantity: string;
  value: number;
}

export function summarizeActivities(
  activities: RawActivityItem[]
): ReceiptLineItem[] {
  return activities.map((a) => ({
    label: a.label,
    quantity: a.quantity,
    value: estimateValue(a),
  }));
}

function estimateValue(activity: RawActivityItem): number {
  const hourlyRate = 150;
  const estimates: Record<string, number> = {
    github_commits: 0.25, // ~15 min per commit
    github_prs_opened: 0.75, // ~45 min per PR
    github_prs_reviewed: 0.25, // ~15 min per review
    github_issues: 0.5, // ~30 min per issue
    slack_messages: 0.02, // ~1 min per message
    slack_channels: 0.1, // ~6 min per channel
    slack_threads: 0.1, // ~6 min per thread
    calendar_meetings: 1 / 60, // per minute of meeting
    linear_issues_created: 0.5, // ~30 min per issue
    linear_issues_completed: 0.75, // ~45 min per issue
    linear_comments: 0.05, // ~3 min per comment
    notion_pages_created: 0.75, // ~45 min per page
    notion_pages_edited: 0.25, // ~15 min per edit
    notion_databases: 0.5, // ~30 min per database
    gitlab_commits: 0.25, // ~15 min per commit
    gitlab_mrs_opened: 0.75, // ~45 min per MR
    gitlab_mrs_reviewed: 0.25, // ~15 min per review
    gitlab_issues: 0.5, // ~30 min per issue
  };

  const hoursPerUnit = estimates[activity.type] || 0.1;
  return Math.round(activity.raw * hoursPerUnit * hourlyRate * 100) / 100;
}
