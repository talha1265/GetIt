import { NextResponse } from "next/server";
import { verifyPayuResponse } from "@/lib/payments/payu";
import { markOrderFailed, markOrderPaid } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * PayU posts the payment result here (both success/surl and failure/furl).
 * We verify the reverse hash, update the order idempotently, then 303-redirect
 * the browser to the order page.
 */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const form = await req.formData();
  const body: Record<string, string> = {};
  form.forEach((value, key) => {
    body[key] = String(value);
  });

  const txnid = body.txnid ?? "";
  const orderUrl = (status: string) =>
    NextResponse.redirect(`${origin}/orders/${txnid}?status=${status}`, 303);

  if (!verifyPayuResponse(body)) {
    console.warn("PayU callback failed hash verification", { txnid });
    return orderUrl("error");
  }

  try {
    if (body.status === "success") {
      await markOrderPaid(txnid, body.mihpayid ?? body.payuMoneyId ?? null, body);
      return orderUrl("success");
    }
    await markOrderFailed(txnid, body);
    return orderUrl("failed");
  } catch (err) {
    console.error("PayU callback processing error", err);
    return orderUrl("error");
  }
}
