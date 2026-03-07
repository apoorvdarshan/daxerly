"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Receipt, { ReceiptData } from "@/components/Receipt";

interface ConnectionStatus {
  github: boolean;
  slack: boolean;
  google: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionStatus>({
    github: false,
    slack: false,
    google: false,
  });
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<ReceiptData | null>(null);

  const fetchData = useCallback(async () => {
    const [connRes, recRes] = await Promise.all([
      fetch("/api/connections"),
      fetch("/api/receipts"),
    ]);
    if (connRes.ok) {
      const data = await connRes.json();
      setConnections(data);
    }
    if (recRes.ok) {
      const data = await recRes.json();
      setReceipts(data);
      if (data.length > 0) setLatestReceipt(data[0]);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (session) {
      fetchData();
    }
  }, [session, status, router, fetchData]);

  const generateReceipt = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      if (res.ok) {
        const receipt = await res.json();
        setLatestReceipt(receipt);
        setReceipts((prev) => [receipt, ...prev]);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const providers = [
    { key: "github" as const, label: "GitHub", provider: "github" },
    { key: "slack" as const, label: "Slack", provider: "slack" },
    { key: "google" as const, label: "Google Calendar", provider: "google" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="text-accent font-bold text-2xl tracking-wider font-mono">
          DAXERLY
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {session.user?.name || session.user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-[1fr,480px] gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Connected Tools */}
            <section>
              <h2 className="text-lg font-bold mb-4">Connected Tools</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {providers.map((p) => (
                  <div
                    key={p.key}
                    className="bg-surface rounded-xl p-5 border border-surface-light"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{p.label}</span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          connections[p.key] ? "bg-green-500" : "bg-gray-600"
                        }`}
                      />
                    </div>
                    {connections[p.key] ? (
                      <span className="text-xs text-green-400">Connected</span>
                    ) : (
                      <button
                        onClick={() => signIn(p.provider)}
                        className="text-xs text-accent hover:text-accent-light transition-colors"
                      >
                        Connect &rarr;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Generate Button */}
            <section>
              <button
                onClick={generateReceipt}
                disabled={generating}
                className="w-full bg-accent hover:bg-accent-light disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl text-lg transition-colors"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Generating Receipt...
                  </span>
                ) : (
                  "Generate Today's Receipt"
                )}
              </button>
            </section>

            {/* Receipt History */}
            <section>
              <h2 className="text-lg font-bold mb-4">Recent Receipts</h2>
              {receipts.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No receipts yet. Generate your first one!
                </p>
              ) : (
                <div className="space-y-3">
                  {receipts.slice(0, 7).map((receipt) => (
                    <button
                      key={receipt.id}
                      onClick={() => {
                        setLatestReceipt(receipt);
                        if (receipt.id) router.push(`/receipt/${receipt.id}`);
                      }}
                      className="w-full bg-surface hover:bg-surface-light rounded-xl p-4 border border-surface-light transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">
                            {new Date(receipt.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <span className="text-xs text-gray-500 ml-3">
                            {receipt.lineItems.length} items
                          </span>
                        </div>
                        <span className="text-accent font-bold font-mono">
                          ${receipt.totalValue.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Receipt Preview */}
          <div className="flex justify-center">
            {latestReceipt ? (
              <div>
                <Receipt data={latestReceipt} />
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() =>
                      latestReceipt.id &&
                      router.push(`/receipt/${latestReceipt.id}`)
                    }
                    className="text-sm text-accent hover:text-accent-light transition-colors"
                  >
                    View full receipt &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-600 font-mono text-sm">
                Your receipt will appear here
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
