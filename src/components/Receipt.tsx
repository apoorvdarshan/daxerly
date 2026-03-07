"use client";

import { forwardRef } from "react";

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

function formatDollars(value: number): string {
  return `$${value.toFixed(2)}`;
}


const Receipt = forwardRef<HTMLDivElement, { data: ReceiptData }>(
  ({ data }, ref) => {
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.value, 0);
    const tax = subtotal * 0.0869; // "humor tax"
    const total = data.totalValue || subtotal + tax;

    const dateObj = new Date(data.date);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        ref={ref}
        className="receipt-paper mx-auto max-w-[420px] bg-[#faf9f5] px-8 py-10 shadow-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Header */}
        <div className="text-center font-receipt text-black">
          <pre className="text-xs leading-tight tracking-wide">
            {`
  ████████▄     ▄████████ ▀████    ▐████▀
  ███   ▀███   ███    ███   ███▌   ████▀
  ███    ███   ███    ███    ███   ▐███
  ███    ███   ███    ███    ▀███▄███▀
  ███    ███ ▀███████████    ████▀██▄
  ███    ███   ███    ███   ▐███  ▀███
  ███   ▄███   ███    ███  ▄███     ███▄
  ████████▀    ███    █▀  ████       ███▄
            `.trim()}
          </pre>
          <p className="mt-2 text-sm font-bold tracking-[0.3em] text-black">
            DAXERLY
          </p>
          <p className="mt-1 text-[10px] tracking-widest text-gray-500">
            DAILY WORK RECEIPT
          </p>
        </div>

        {/* Date */}
        <div className="mt-6 font-receipt text-xs text-black">
          <div className="flex justify-between">
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span>Generated: {timeStr}</span>
            <span>#{data.id?.slice(-6).toUpperCase() || "000000"}</span>
          </div>
          {data.userName && (
            <div className="mt-1">
              <span>Employee: {data.userName}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t-2 border-dashed border-gray-400" />

        {/* Column Headers */}
        <div className="font-receipt text-xs text-gray-500">
          <div className="flex justify-between">
            <span>ITEM</span>
            <span>VALUE</span>
          </div>
        </div>

        <div className="my-2 border-t border-dashed border-gray-300" />

        {/* Line Items */}
        <div className="space-y-2 font-receipt text-sm text-black">
          {data.lineItems.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span className="flex-1 truncate pr-2">{item.label}</span>
                <span className="font-bold text-amber-600">
                  {formatDollars(item.value)}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 pl-2">
                qty: {item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 border-t-2 border-dashed border-gray-400" />

        {/* Totals */}
        <div className="font-receipt text-sm text-black space-y-1">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>{formatDollars(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-xs">
            <span>PRODUCTIVITY TAX (8.69%)</span>
            <span>{formatDollars(tax)}</span>
          </div>
          <div className="my-2 border-t border-dashed border-gray-300" />
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL VALUE</span>
            <span className="text-amber-600">
              {formatDollars(total)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t-2 border-dashed border-gray-400" />

        {/* Footer */}
        <div className="text-center font-receipt text-[10px] text-gray-400 space-y-2">
          <p>PAYMENT METHOD: HARD WORK</p>
          <p className="italic">
            &quot;Proof of work, formatted as a receipt&quot;
          </p>
          <div className="mt-4 flex justify-center">
            {/* Simple barcode pattern */}
            <div className="flex gap-px items-end">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{
                    width: Math.random() > 0.5 ? 2 : 1,
                    height: 20 + Math.random() * 10,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[9px]">
            THANK YOU FOR YOUR PRODUCTIVITY
          </p>
          <p className="text-[9px]">daxerly.com</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
export default Receipt;
