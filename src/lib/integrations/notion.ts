interface NotionActivity {
  pagesEdited: number;
  pagesCreated: number;
  databasesUpdated: number;
}

export async function pullNotionActivity(
  accessToken: string
): Promise<NotionActivity> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  // Search for recently edited pages
  const searchRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: { property: "object", value: "page" },
      sort: { direction: "descending", timestamp: "last_edited_time" },
      page_size: 100,
    }),
  });

  if (!searchRes.ok) {
    return { pagesEdited: 0, pagesCreated: 0, databasesUpdated: 0 };
  }

  const searchData = await searchRes.json();
  const pages = searchData.results || [];

  let pagesEdited = 0;
  let pagesCreated = 0;

  for (const page of pages) {
    const editedAt = page.last_edited_time;
    const createdAt = page.created_time;

    if (editedAt && editedAt >= since) {
      pagesEdited++;
      if (createdAt && createdAt >= since) {
        pagesCreated++;
      }
    }
  }

  // Search for recently edited databases
  const dbRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: { property: "object", value: "database" },
      sort: { direction: "descending", timestamp: "last_edited_time" },
      page_size: 100,
    }),
  });

  let databasesUpdated = 0;
  if (dbRes.ok) {
    const dbData = await dbRes.json();
    for (const db of dbData.results || []) {
      if (db.last_edited_time && db.last_edited_time >= since) {
        databasesUpdated++;
      }
    }
  }

  return { pagesEdited, pagesCreated, databasesUpdated };
}

export function formatNotionActivity(activity: NotionActivity) {
  const items = [];
  if (activity.pagesCreated > 0) {
    items.push({
      type: "notion_pages_created",
      label: "Notion Pages Created",
      quantity: `${activity.pagesCreated} pages`,
      raw: activity.pagesCreated,
    });
  }
  if (activity.pagesEdited > 0) {
    items.push({
      type: "notion_pages_edited",
      label: "Notion Pages Edited",
      quantity: `${activity.pagesEdited} pages`,
      raw: activity.pagesEdited,
    });
  }
  if (activity.databasesUpdated > 0) {
    items.push({
      type: "notion_databases",
      label: "Notion Databases Updated",
      quantity: `${activity.databasesUpdated} databases`,
      raw: activity.databasesUpdated,
    });
  }
  return items;
}
