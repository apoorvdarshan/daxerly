import OpenAI from "openai";

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

const SYSTEM_PROMPT = `You are a work receipt generator. Given a list of raw work activities, summarize them into clean line items like a store receipt. Each line item should have a short label, a quantity or time unit, and an estimated dollar value based on an assumed hourly rate of $150/hr for a knowledge worker. Be concise. Output a JSON array of line items with this exact format: [{"label": "string", "quantity": "string", "value": number}]. Only output the JSON array, nothing else.`;

export async function summarizeActivities(
  activities: RawActivityItem[]
): Promise<ReceiptLineItem[]> {
  // If no OpenAI key, do basic estimation locally
  if (!process.env.OPENAI_API_KEY) {
    return activities.map((a) => ({
      label: a.label,
      quantity: a.quantity,
      value: estimateValue(a),
    }));
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here are today's work activities:\n${JSON.stringify(activities, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    return activities.map((a) => ({
      label: a.label,
      quantity: a.quantity,
      value: estimateValue(a),
    }));
  }

  try {
    // Extract JSON from possible markdown code blocks
    const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const items = JSON.parse(jsonStr);
    if (Array.isArray(items)) {
      return items.map((item: ReceiptLineItem) => ({
        label: String(item.label),
        quantity: String(item.quantity),
        value: Number(item.value) || 0,
      }));
    }
  } catch {
    // Fall back to local estimation
  }

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
  };

  const hoursPerUnit = estimates[activity.type] || 0.1;
  return Math.round(activity.raw * hoursPerUnit * hourlyRate * 100) / 100;
}
