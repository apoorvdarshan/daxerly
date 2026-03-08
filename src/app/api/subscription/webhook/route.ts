import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paypal";

export async function POST(req: Request) {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const isValid = await verifyWebhookSignature(headers, body, webhookId);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType = event.event_type;
  const resource = event.resource;
  const paypalSubscriptionId = resource?.id;

  if (!paypalSubscriptionId) {
    return NextResponse.json({ received: true });
  }

  const sub = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId },
  });

  if (!sub) {
    return NextResponse.json({ received: true });
  }

  switch (eventType) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      await prisma.subscription.update({
        where: { paypalSubscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: resource.billing_info?.last_payment?.time
            ? new Date(resource.billing_info.last_payment.time)
            : new Date(),
          currentPeriodEnd: resource.billing_info?.next_billing_time
            ? new Date(resource.billing_info.next_billing_time)
            : null,
        },
      });
      break;

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      await Promise.all([
        prisma.subscription.update({
          where: { paypalSubscriptionId },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        }),
        prisma.cancellationLog.create({
          data: {
            userId: sub.userId,
            reason: "Cancelled from PayPal",
          },
        }),
      ]);
      break;

    case "PAYMENT.SALE.COMPLETED":
      await prisma.subscription.update({
        where: { paypalSubscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
        },
      });
      break;
  }

  return NextResponse.json({ received: true });
}
