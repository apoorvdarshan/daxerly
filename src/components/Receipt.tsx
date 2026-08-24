"use client";

import { forwardRef, useMemo } from "react";

export interface LineItem {
  label: string;
  quantity: string;
  value: number;
}

export interface ReceiptData {
  id?: string;
  date: string;
  lineItems: LineItem[];
  totalValue: number;
  userName?: string;
}

function fmt(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Deterministic barcode from receipt ID
function generateBarcode(id: string): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) {
    seed = ((seed << 5) - seed + id.charCodeAt(i)) | 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < 50; i++) {
    seed = (seed * 16807 + 1) % 2147483647;
    bars.push(seed);
  }
  return bars;
}

const Receipt = forwardRef<HTMLDivElement, { data: ReceiptData; animate?: boolean }>(
  ({ data, animate = false }, ref) => {
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.value, 0);
    const tax = subtotal * 0.0869;
    const total = data.totalValue || subtotal + tax;

    const dateObj = new Date(data.date);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const receiptId = data.id?.slice(-8).toUpperCase() || "00000000";
    const barcode = useMemo(
      () => generateBarcode(data.id || "default"),
      [data.id]
    );

    return (
      <div
        ref={ref}
        className={`receipt-paper paper-texture mx-auto w-[380px] px-7 py-9 ${animate ? "animate-receipt-print" : ""}`}
      >
        {/* ── Header ─────────────────────────── */}
        <div className="text-center">
          <div className="font-receipt text-ink font-bold text-[28px] tracking-[0.25em] leading-none">
            DAXERLY
          </div>
          <div className="mt-1.5 font-receipt text-[9px] tracking-[0.35em] text-ink-faded uppercase">
            Daily Work Receipt
          </div>
          <div className="mt-3 mx-auto w-48 border-b border-ink/10" />
        </div>

        {/* ── Meta ────────────────────────────── */}
        <div className="mt-5 font-receipt text-[11px] text-ink-light leading-relaxed">
          <div className="flex justify-between">
            <span>DATE</span>
            <span className="text-ink">{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span>TIME</span>
            <span className="text-ink">{timeStr}</span>
          </div>
          {data.userName && (
            <div className="flex justify-between">
              <span>CLERK</span>
              <span className="text-ink">{data.userName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>TXN</span>
            <span className="text-ink font-medium">#{receiptId}</span>
          </div>
        </div>

        {/* ── Divider ────────────────────────── */}
        <div className="my-4 border-t border-dashed border-ink/20" />

        {/* ── Column Header ──────────────────── */}
        <div className="flex justify-between font-receipt text-[9px] text-ink-faded tracking-wider uppercase mb-2">
          <span>Description</span>
          <span>Amount</span>
        </div>
        <div className="border-t border-ink/10 mb-3" />

        {/* ── Line Items ─────────────────────── */}
        <div className={`space-y-2.5 ${animate ? "stagger" : ""}`}>
          {data.lineItems.map((item, i) => (
            <div key={i} className="font-receipt">
              {/* Item row with dot leaders */}
              <div className="flex items-baseline text-[12.5px]">
                <span className="text-ink font-medium shrink-0 max-w-[220px] truncate">
                  {item.label}
                </span>
                <span className="flex-1 mx-1 border-b border-dotted border-ink/15 relative top-[-3px]" />
                <span className="text-ink font-semibold shrink-0 tabular-nums">
                  {fmt(item.value)}
                </span>
              </div>
              {/* Quantity subline */}
              <div className="text-[9.5px] text-ink-faded pl-0.5 mt-0.5">
                {item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* ── Divider ────────────────────────── */}
        <div className="mt-5 mb-3 border-t-2 border-dashed border-ink/20" />

        {/* ── Totals ─────────────────────────── */}
        <div className="font-receipt space-y-1.5">
          <div className="flex justify-between text-[12px] text-ink-light">
            <span>SUBTOTAL</span>
            <span className="text-ink tabular-nums">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-ink-faded">
            <span>PRODUCTIVITY TAX (8.69%)</span>
            <span className="tabular-nums">{fmt(tax)}</span>
          </div>

          <div className="my-2 border-t border-ink/10" />

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-[14px] font-bold text-ink tracking-wide">
              TOTAL
            </span>
            <span className="text-[22px] font-bold text-ink tabular-nums leading-none">
              {fmt(total)}
            </span>
          </div>
        </div>

        {/* ── Divider ────────────────────────── */}
        <div className="mt-4 mb-4 border-t border-dashed border-ink/20" />

        {/* ── Footer ─────────────────────────── */}
        <div className="text-center font-receipt space-y-2">
          <div className="text-[9px] text-ink-faded tracking-wider">
            PAYMENT METHOD: HARD WORK
          </div>

          {/* Barcode */}
          <div className="flex justify-center items-end gap-[1px] py-3">
            {barcode.map((val, i) => (
              <div
                key={i}
                className="bg-ink/80"
                style={{
                  width: val % 3 === 0 ? 2 : 1,
                  height: 24 + (val % 12),
                }}
              />
            ))}
          </div>

          <div className="text-[8px] text-ink-faded font-medium tracking-[0.2em]">
            {receiptId}
          </div>

          <div className="pt-2 border-t border-ink/5">
            <p className="text-[9.5px] text-ink-light italic leading-relaxed">
              &ldquo;Proof of work, formatted as a receipt.&rdquo;
            </p>
          </div>

          <div className="text-[8px] text-ink-faded/60 tracking-wider pt-1">
            DAXERLY.APOORVDARSHAN.COM
          </div>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
export default Receipt;
