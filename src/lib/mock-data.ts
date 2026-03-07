import { ReceiptData } from "@/components/Receipt";

export const mockReceipt: ReceiptData = {
  id: "clx7f9abc123",
  date: new Date().toISOString(),
  userName: "Jane Developer",
  lineItems: [
    { label: "GitHub Commits", quantity: "12 commits", value: 450.0 },
    { label: "Pull Requests Opened", quantity: "3 PRs", value: 337.5 },
    { label: "Code Reviews", quantity: "5 reviews", value: 187.5 },
    { label: "Slack Messages Sent", quantity: "47 messages", value: 112.5 },
    { label: "Threads Resolved", quantity: "8 threads", value: 150.0 },
    { label: "Meetings Attended", quantity: "2 meetings (1.5 hrs)", value: 225.0 },
    { label: "Issues Closed", quantity: "4 issues", value: 300.0 },
    { label: "Documentation Written", quantity: "2 pages", value: 150.0 },
  ],
  totalValue: 2045.63,
};

export const mockReceiptHistory: ReceiptData[] = [
  mockReceipt,
  {
    id: "clx7f9def456",
    date: new Date(Date.now() - 86400000).toISOString(),
    userName: "Jane Developer",
    lineItems: [
      { label: "GitHub Commits", quantity: "8 commits", value: 300.0 },
      { label: "Pull Requests Merged", quantity: "2 PRs", value: 225.0 },
      { label: "Meetings Attended", quantity: "4 meetings (3 hrs)", value: 450.0 },
      { label: "Slack Messages", quantity: "62 messages", value: 150.0 },
    ],
    totalValue: 1222.85,
  },
  {
    id: "clx7f9ghi789",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    userName: "Jane Developer",
    lineItems: [
      { label: "GitHub Commits", quantity: "15 commits", value: 562.5 },
      { label: "Code Reviews", quantity: "7 reviews", value: 262.5 },
      { label: "Issues Closed", quantity: "6 issues", value: 450.0 },
      { label: "Slack Messages", quantity: "31 messages", value: 75.0 },
    ],
    totalValue: 1467.38,
  },
];
