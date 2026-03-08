import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const verified = await verifyWebhookSignature(headers, body, webhookId);
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType: string = event.event_type;
  const resource = event.resource;

  const subscriptionId =
    resource.id || resource.billing_agreement_id;

  if (!subscriptionId) {
    return NextResponse.json({ received: true });
  }

  const sub = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId },
  });

  if (!sub) {
    return NextResponse.json({ received: true });
  }

  switch (eventType) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      await prisma.subscription.update({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: "ACTIVE" },
      });
      break;

    case "BILLING.SUBSCRIPTION.CANCELLED":
      await prisma.subscription.update({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: "CANCELLED" },
      });
      break;

    case "BILLING.SUBSCRIPTION.SUSPENDED":
      await prisma.subscription.update({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: "SUSPENDED" },
      });
      break;

    case "BILLING.SUBSCRIPTION.EXPIRED":
      await prisma.subscription.update({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: "EXPIRED" },
      });
      break;

    case "PAYMENT.SALE.COMPLETED": {
      const nextBilling = resource.billing_agreement_id;
      if (nextBilling) {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await prisma.subscription.update({
          where: { paypalSubscriptionId: nextBilling },
          data: {
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
