"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Receipt, { ReceiptData } from "@/components/Receipt";
import { toPng } from "html-to-image";
import ShareButton from "@/components/SocialShareButtons";

interface ConnectionStatus {
  github: boolean;
}

const providerMeta = [
  {
    key: "github" as const,
    label: "GitHub",
    provider: "github",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionStatus>({
    github: false,
  });
  const [connectionsLoaded, setConnectionsLoaded] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<ReceiptData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [connRes, recRes] = await Promise.all([
      fetch("/api/connections"),
      fetch("/api/receipts"),
    ]);
    if (connRes.ok) {
      const data = await connRes.json();
      setConnections(data);
    }
    setConnectionsLoaded(true);
    if (recRes.ok) {
      const data = await recRes.json();
      setReceipts(data);
      if (data.length > 0) setLatestReceipt(data[0]);
    }
    setPageReady(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (session) fetchData();
  }, [session, status, router, fetchData]);

  const [generateError, setGenerateError] = useState<string | null>(null);

  const generateReceipt = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      if (res.ok) {
        const receipt = await res.json();
        setLatestReceipt(receipt);
        setReceipts((prev) => [receipt, ...prev]);
      } else {
        const data = await res.json().catch(() => ({}));
        setGenerateError(data.error || "Failed to generate receipt");
      }
    } catch {
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `daxerly-${latestReceipt?.id || "receipt"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 3,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (status === "loading" || !session || !pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:200ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:400ms]" />
          </div>
          <span className="font-mono text-[10px] text-zinc-600 tracking-[0.25em] uppercase">
            Loading your workspace
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="noise-overlay" />

      {/* ── Nav ─────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 lg:px-12 py-5 max-w-[1440px] mx-auto border-b border-surface-border/30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="daxerly" className="w-5 h-5" />
          <span className="font-display font-bold text-lg tracking-wide text-foreground">
            daxerly
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] text-zinc-600 tracking-wider uppercase">
            {session.user?.name || session.user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors tracking-wider uppercase"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main ────────────────────────────── */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-12 py-10">
        <div className="grid lg:grid-cols-[1fr,440px] gap-12 lg:gap-20">
          {/* ── Left Column ──────────────────── */}
          <div className="space-y-10 stagger">
            {/* Section: Connected Tools */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-zinc-800" />
                <h2 className="font-mono text-[10px] tracking-[0.25em] text-zinc-600 uppercase">
                  Connected Tools
                </h2>
              </div>

              <div className="grid sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {providerMeta.map((p) => {
                  const connected = connections[p.key];
                  return (
                    <div
                      key={p.key}
                      className={`group relative border px-5 py-4 transition-all duration-300 ${
                        connected
                          ? "bg-surface/50 border-accent/15 hover:border-accent/30"
                          : "bg-surface/30 border-surface-border/40 hover:border-surface-border"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`transition-colors duration-300 ${
                            connected
                              ? "text-accent"
                              : "text-zinc-700 group-hover:text-zinc-500"
                          }`}
                        >
                          {p.icon}
                        </span>
                        <span className="text-sm font-medium text-zinc-300">
                          {p.label}
                        </span>
                      </div>

                      {!connectionsLoaded ? (
                        <div className="h-4 w-16 bg-zinc-800/50 animate-pulse rounded" />
                      ) : connected ? (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-mono text-[10px] text-emerald-500/80 tracking-wider uppercase">
                            Active
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => signIn(p.provider)}
                          className="font-mono text-[10px] text-zinc-600 hover:text-accent tracking-wider uppercase transition-colors duration-300"
                        >
                          Connect &rarr;
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: Generate */}
            <section>
              <button
                onClick={generateReceipt}
                disabled={generating}
                className="group w-full relative overflow-hidden bg-accent hover:bg-accent-light disabled:bg-zinc-900 disabled:border disabled:border-zinc-800 text-background disabled:text-zinc-700 font-display font-bold py-5 text-base tracking-wide transition-all duration-300 hover:shadow-[0_0_60px_rgba(229,164,17,0.12)]"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span className="font-mono text-xs tracking-widest uppercase">
                      Printing receipt...
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Generate Today&apos;s Receipt
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                )}
              </button>
              {generateError && (
                <div className="mt-3 font-mono text-[11px] text-red-400 tracking-wider">
                  {generateError}
                </div>
              )}
            </section>

            {/* Section: History */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-zinc-800" />
                <h2 className="font-mono text-[10px] tracking-[0.25em] text-zinc-600 uppercase">
                  Recent Receipts
                </h2>
              </div>

              {receipts.length === 0 ? (
                <div className="border border-dashed border-surface-border/40 py-12 flex flex-col items-center gap-3">
                  <div className="font-mono text-[10px] text-zinc-700 tracking-wider">
                    NO RECEIPTS YET
                  </div>
                  <div className="text-xs text-zinc-600">
                    Generate your first receipt to see it here.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {receipts.slice(0, 7).map((receipt, i) => (
                    <button
                      key={receipt.id}
                      onClick={() => setLatestReceipt(receipt)}
                      className="group w-full flex items-center justify-between border border-surface-border/30 bg-surface/30 hover:bg-surface/60 hover:border-surface-border/60 px-5 py-4 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] text-zinc-700 w-6">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="text-sm text-zinc-300 font-medium">
                            {new Date(receipt.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="font-mono text-[10px] text-zinc-700 mt-0.5">
                            {receipt.lineItems.length} line items
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-receipt text-base font-semibold text-accent tabular-nums">
                          ${receipt.totalValue.toFixed(2)}
                        </span>
                        <svg
                          className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right Column: Receipt ────────── */}
          <div className="flex justify-center lg:sticky lg:top-10 lg:self-start">
            {latestReceipt ? (
              <div className="space-y-6">
                <div className="receipt-glow">
                  <Receipt ref={receiptRef} data={latestReceipt} animate />
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={downloadImage}
                    disabled={downloading}
                    className="group flex items-center gap-2.5 border border-surface-border/50 bg-surface/50 hover:bg-surface hover:border-surface-border px-5 py-2.5 transition-all duration-300"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase">
                      {downloading ? "Saving..." : "Download"}
                    </span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="group flex items-center gap-2.5 bg-accent hover:bg-accent-light px-5 py-2.5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,164,17,0.1)]"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-background"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {copied ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      )}
                    </svg>
                    <span className="font-mono text-[10px] text-background font-medium tracking-wider uppercase">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>

                  <ShareButton
                    receiptId={latestReceipt.id || ""}
                    receiptRef={receiptRef}
                  />
                </div>
              </div>
            ) : (
              <div className="w-[380px] border border-dashed border-surface-border/30 flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-16 border border-dashed border-zinc-800 flex items-center justify-center">
                  <div className="w-6 h-1 bg-zinc-800" />
                </div>
                <span className="font-mono text-[10px] text-zinc-700 tracking-wider">
                  YOUR RECEIPT WILL PRINT HERE
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
