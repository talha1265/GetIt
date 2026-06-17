import "server-only";

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID;
const SENDER_ID = process.env.MSG91_SENDER_ID;

export interface SmsResult {
  delivered: boolean;
  /** Present only in dev (no MSG91 key) so the OTP flow stays testable. */
  devCode?: string;
}

/**
 * Send an OTP SMS via MSG91. We generate the OTP ourselves and pass it through,
 * keeping our hashing/verification authoritative. When no MSG91 key is set
 * (local dev), we log the code instead of sending and return it for testing.
 */
export async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  if (!AUTH_KEY || !TEMPLATE_ID) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[OTP][dev] ${phone} → ${code}`);
      return { delivered: false, devCode: code };
    }
    throw new Error("MSG91 is not configured (MSG91_AUTH_KEY / MSG91_OTP_TEMPLATE_ID).");
  }

  // MSG91 expects the mobile number without the leading "+".
  const mobile = phone.replace(/^\+/, "");
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", TEMPLATE_ID);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("otp", code);
  if (SENDER_ID) url.searchParams.set("sender", SENDER_ID);

  const res = await fetch(url, {
    method: "POST",
    headers: { authkey: AUTH_KEY, "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MSG91 send failed (${res.status}): ${text}`);
  }
  return { delivered: true };
}
