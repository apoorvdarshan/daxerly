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
    calendar_meetings: 1 / 60, // per minute of meeting
  };

  const hoursPerUnit = estimates[activity.type] || 0.1;
  return Math.round(activity.raw * hoursPerUnit * hourlyRate * 100) / 100;
}
