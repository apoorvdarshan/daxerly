"use client";

import { useEffect, useState, useRef } from "react";
import Receipt, { ReceiptData } from "@/components/Receipt";
import { toPng } from "html-to-image";
import ShareButton from "@/components/SocialShareButtons";

export default function ReceiptClient({ id }: { id: string }) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/receipts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setReceipt)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadImage = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `daxerly-${id}.png`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs text-zinc-600 tracking-wider">
            LOADING RECEIPT
          </span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="noise-overlay" />
        <span className="font-mono text-[10px] text-zinc-600 tracking-wider uppercase mb-4">
          Receipt not found
        </span>
        <a
          href="/"
          className="font-mono text-[10px] text-accent hover:text-accent-light tracking-wider uppercase transition-colors"
        >
          Go to Daxerly &rarr;
        </a>
      </div>
    );
  }

  if (!receipt) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="noise-overlay" />

      {/* Ambient glow */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* ── Nav ─────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-center px-8 lg:px-12 py-5 max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-display font-bold text-lg tracking-wide text-foreground">
            daxerly
          </span>
        </a>
      </nav>

      {/* ── Receipt ─────────────────────────── */}
      <main className="relative z-10 max-w-5xl mx-auto px-8 lg:px-12 py-8 flex flex-col items-center">
        {/* Receipt ID badge */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-800" />
          <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-600 uppercase">
            Receipt #{id.slice(-8).toUpperCase()}
          </span>
          <div className="h-px w-8 bg-zinc-800" />
        </div>

        <div className="receipt-glow mb-10">
          <Receipt ref={receiptRef} data={receipt} animate />
        </div>

        {/* ── Share Actions ──────────────────── */}
        <div className="flex gap-3">
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="group flex items-center gap-2.5 border border-surface-border/50 bg-surface/50 hover:bg-surface hover:border-surface-border px-6 py-3 transition-all duration-300"
          >
            <svg
              className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors"
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
            className="group flex items-center gap-2.5 bg-accent hover:bg-accent-light px-6 py-3 transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,164,17,0.1)]"
          >
            <svg
              className="w-4 h-4 text-background"
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

          <ShareButton receiptId={id} receiptRef={receiptRef} />
        </div>
      </main>
    </div>
  );
}
