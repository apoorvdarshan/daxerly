"use client";

import { RefObject, useState } from "react";
import { toPng } from "html-to-image";

interface ShareButtonProps {
  receiptId: string;
  receiptRef: RefObject<HTMLDivElement | null>;
}

export default function ShareButton({ receiptId, receiptRef }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const shareImage = async () => {
    if (!receiptRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 3,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `daxerly-${receiptId}.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <button
      onClick={shareImage}
      disabled={sharing}
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase">
        {sharing ? "Sharing..." : "Share"}
      </span>
    </button>
  );
}
