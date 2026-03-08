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
  // If no Gemini key, do basic estimation locally
  if (!process.env.GEMINI_API_KEY) {
    return activities.map((a) => ({
      label: a.label,
      quantity: a.quantity,
      value: estimateValue(a),
    }));
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Here are today's work activities:\n${JSON.stringify(activities, null, 2)}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      throw new Error("No content in Gemini response");
    }

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
