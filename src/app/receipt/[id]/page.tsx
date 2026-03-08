import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ReceiptClient from "./ReceiptClient";

const BASE_URL = "https://daxerly.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const receipt = await prisma.receipt.findFirst({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!receipt) {
    return { title: "Receipt Not Found — Daxerly" };
  }

  const total = `$${receipt.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const title = `${total} of value shipped — Daxerly Receipt`;
  const description = `${receipt.user.name || "Someone"} shipped ${total} of value today. View their daily work receipt on Daxerly.`;
  const ogImageUrl = `${BASE_URL}/api/og/${id}`;
  const receiptUrl = `${BASE_URL}/receipt/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: receiptUrl,
      siteName: "Daxerly",
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 600,
          alt: `Daxerly receipt — ${total} of value`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReceiptClient id={id} />;
}
