interface CalendarActivity {
  meetingsAttended: number;
  totalMeetingMinutes: number;
  meetingTitles: string[];
}

export async function pullCalendarActivity(
  accessToken: string
): Promise<CalendarActivity> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: yesterday.toISOString(),
    timeMax: now.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    return { meetingsAttended: 0, totalMeetingMinutes: 0, meetingTitles: [] };
  }

  const data = await res.json();
  const events = data.items || [];

  let meetingsAttended = 0;
  let totalMeetingMinutes = 0;
  const meetingTitles: string[] = [];

  for (const event of events) {
    // Skip all-day events (no dateTime)
    if (!event.start?.dateTime || !event.end?.dateTime) continue;

    // Only count events user accepted or is organizer
    const selfAttendee = event.attendees?.find(
      (a: { self?: boolean }) => a.self
    );
    if (
      selfAttendee &&
      selfAttendee.responseStatus === "declined"
    )
      continue;

    meetingsAttended++;
    meetingTitles.push(event.summary || "Untitled Meeting");

    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    totalMeetingMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
  }

  return { meetingsAttended, totalMeetingMinutes, meetingTitles };
}

export function formatCalendarActivity(activity: CalendarActivity) {
  const items = [];
  if (activity.meetingsAttended > 0) {
    const hours = (activity.totalMeetingMinutes / 60).toFixed(1);
    items.push({
      type: "calendar_meetings",
      label: "Meetings Attended",
      quantity: `${activity.meetingsAttended} meetings (${hours} hrs)`,
      raw: activity.totalMeetingMinutes,
    });
  }
  return items;
}
