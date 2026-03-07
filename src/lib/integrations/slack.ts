interface SlackActivity {
  messagesSent: number;
  channelsActive: number;
  threadsReplied: number;
}

export async function pullSlackActivity(
  accessToken: string
): Promise<SlackActivity> {
  // Get user info
  const authRes = await fetch("https://slack.com/api/auth.test", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const authData = await authRes.json();

  if (!authData.ok) {
    return { messagesSent: 0, channelsActive: 0, threadsReplied: 0 };
  }

  const userId = authData.user_id;

  // Search for messages from user in last 24h
  const since = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  const searchRes = await fetch(
    `https://slack.com/api/search.messages?query=from:<@${userId}> after:${new Date(since * 1000).toISOString().split("T")[0]}&count=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();

  let messagesSent = 0;
  const channels = new Set<string>();
  let threadsReplied = 0;

  if (searchData.ok && searchData.messages?.matches) {
    messagesSent = searchData.messages.total || searchData.messages.matches.length;
    for (const msg of searchData.messages.matches) {
      if (msg.channel?.id) channels.add(msg.channel.id);
      if (msg.thread_ts && msg.thread_ts !== msg.ts) threadsReplied++;
    }
  }

  return {
    messagesSent,
    channelsActive: channels.size,
    threadsReplied,
  };
}

export function formatSlackActivity(activity: SlackActivity) {
  const items = [];
  if (activity.messagesSent > 0) {
    items.push({
      type: "slack_messages",
      label: "Slack Messages Sent",
      quantity: `${activity.messagesSent} messages`,
      raw: activity.messagesSent,
    });
  }
  if (activity.channelsActive > 0) {
    items.push({
      type: "slack_channels",
      label: "Channels Active In",
      quantity: `${activity.channelsActive} channels`,
      raw: activity.channelsActive,
    });
  }
  if (activity.threadsReplied > 0) {
    items.push({
      type: "slack_threads",
      label: "Threads Replied To",
      quantity: `${activity.threadsReplied} threads`,
      raw: activity.threadsReplied,
    });
  }
  return items;
}
