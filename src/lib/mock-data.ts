import { ReceiptData } from "@/components/Receipt";

export const mockReceipt: ReceiptData = {
  id: "clx7f9abc123",
  date: "2026-03-08T17:30:00.000Z",
  userName: "Jane Developer",
  lineItems: [
    { label: "GitHub Commits", quantity: "12 commits", value: 450.0 },
    { label: "Pull Requests Opened", quantity: "3 PRs", value: 337.5 },
    { label: "Code Reviews", quantity: "5 reviews", value: 187.5 },
    { label: "Issues Closed", quantity: "4 issues", value: 300.0 },
  ],
  totalValue: 1385.8,
};
