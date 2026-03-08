"use client";

import { useState, useEffect, useCallback } from "react";

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

const reasons = [
  "Too expensive",
  "Not using it enough",
  "Missing features I need",
  "Found a better alternative",
  "Just trying it out",
  "Other",
];

type Step = "reason" | "offer" | "cancelling";

export default function CancelSubscriptionModal({
  open,
  onClose,
  onCancelled,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState<string>("");
  const [otherText, setOtherText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("reason");
      setReason("");
      setOtherText("");
      setError(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "cancelling") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, step, onClose]);

  const handleCancel = useCallback(async () => {
    setStep("cancelling");
    setError(null);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason === "Other" && otherText.trim() ? `Other: ${otherText.trim()}` : reason }),
      });
      if (!res.ok) throw new Error("Failed to cancel subscription");
      onCancelled();
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("offer");
    }
  }, [reason, onCancelled]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "cancelling") onClose();
      }}
    >
      <div className="w-full max-w-md border border-surface-border bg-surface mx-4">
        {/* ── Step: Reason ── */}
        {step === "reason" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-zinc-200 tracking-wide">
                We&apos;re sorry to see you go
              </h3>
              <p className="font-mono text-[11px] text-zinc-500 tracking-wider">
                Please tell us why you&apos;re cancelling
              </p>
            </div>

            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-all duration-200 ${
                    reason === r
                      ? "border-accent/40 bg-accent/5"
                      : "border-surface-border/40 hover:border-surface-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      reason === r
                        ? "border-accent"
                        : "border-zinc-700"
                    }`}
                  >
                    {reason === r && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="sr-only"
                  />
                  <span className="text-sm text-zinc-300">{r}</span>
                </label>
              ))}
              {reason === "Other" && (
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Tell us more..."
                  rows={3}
                  className="w-full mt-2 bg-background border border-surface-border/40 focus:border-accent/40 px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 font-mono tracking-wider outline-none resize-none transition-colors"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onClose}
                className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 tracking-wider uppercase transition-colors"
              >
                Never mind
              </button>
              <button
                onClick={() => setStep("offer")}
                disabled={!reason}
                className="bg-accent hover:bg-accent-light disabled:bg-zinc-800 disabled:text-zinc-600 text-background font-display font-bold px-6 py-2.5 text-sm tracking-wide transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Offer ── */}
        {step === "offer" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-zinc-200 tracking-wide">
                Before you go...
              </h3>
              <p className="font-mono text-[11px] text-zinc-500 tracking-wider">
                We&apos;d love to keep you around
              </p>
            </div>

            <div className="border border-accent/20 bg-accent/5 p-5 space-y-3">
              <div className="font-mono text-[10px] text-accent tracking-[0.2em] uppercase">
                Special Offer
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-zinc-600 line-through text-sm">
                  $5/mo
                </span>
                <span className="font-display font-bold text-2xl text-accent">
                  $3/mo
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-500 tracking-wider">
                for the next 3 months
              </p>
            </div>

            {error && (
              <div className="font-mono text-[11px] text-red-400 tracking-wider">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-accent hover:bg-accent-light text-background font-display font-bold py-3 text-sm tracking-wide transition-all duration-300"
              >
                Accept Offer
              </button>
              <button
                onClick={handleCancel}
                className="w-full font-mono text-[10px] text-zinc-600 hover:text-zinc-400 tracking-wider uppercase transition-colors py-2"
              >
                No thanks, cancel my subscription
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Cancelling ── */}
        {step === "cancelling" && (
          <div className="p-6 flex flex-col items-center gap-4 py-12">
            <svg
              className="animate-spin w-6 h-6 text-accent"
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
            <span className="font-mono text-[11px] text-zinc-500 tracking-wider">
              Cancelling your subscription...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
