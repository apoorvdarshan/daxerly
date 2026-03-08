import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const receipt = await prisma.receipt.findFirst({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!receipt) {
    return new Response("Not found", { status: 404 });
  }

  const lineItems = receipt.lineItems as Array<{
    label: string;
    quantity: string;
    value: number;
  }>;

  const date = new Date(receipt.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafaf8",
          padding: "60px",
          fontFamily: "monospace",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              color: "#1a1a1a",
            }}
          >
            DAXERLY
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#888",
              letterSpacing: "0.2em",
              marginTop: "8px",
            }}
          >
            DAILY WORK RECEIPT
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#666",
              marginTop: "12px",
            }}
          >
            {date}
          </div>
          {receipt.user.name && (
            <div
              style={{
                fontSize: "16px",
                color: "#888",
                marginTop: "6px",
              }}
            >
              {receipt.user.name}
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            borderTop: "2px dashed #ccc",
            marginBottom: "30px",
          }}
        />

        {/* Line items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "30px",
          }}
        >
          {lineItems.slice(0, 8).map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "20px",
                color: "#333",
              }}
            >
              <span style={{ maxWidth: "70%", overflow: "hidden" }}>
                {item.label}
              </span>
              <span style={{ fontWeight: "bold" }}>
                ${item.value.toFixed(2)}
              </span>
            </div>
          ))}
          {lineItems.length > 8 && (
            <div style={{ fontSize: "16px", color: "#888" }}>
              +{lineItems.length - 8} more items...
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            borderTop: "2px dashed #ccc",
            marginBottom: "24px",
          }}
        />

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              letterSpacing: "0.15em",
              color: "#1a1a1a",
            }}
          >
            TOTAL VALUE
          </span>
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#b8860b",
            }}
          >
            ${receipt.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "auto",
            fontSize: "14px",
            color: "#aaa",
            letterSpacing: "0.2em",
          }}
        >
          daxerly.vercel.app
        </div>
      </div>
    ),
    {
      width: 800,
      height: 600,
    }
  );
}
