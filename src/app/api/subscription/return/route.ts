import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSubscriptionDetails } from "@/lib/paypal";

export async function GET(req: NextRequest) {
  const subscriptionId = req.nextUrl.searchParams.get("subscription_id");
  if (!subscriptionId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const details = await getSubscriptionDetails(subscriptionId);

  const periodStart = details.billing_info?.last_payment?.time
    ? new Date(details.billing_info.last_payment.time)
    : new Date();
  const periodEnd = details.billing_info?.next_billing_time
    ? new Date(details.billing_info.next_billing_time)
    : null;

  await prisma.subscription.update({
    where: { paypalSubscriptionId: subscriptionId },
    data: {
      status: details.status === "ACTIVE" ? "ACTIVE" : details.status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.redirect(new URL("/dashboard?subscribed=true", req.url));
}
