import { NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/otp";

export const runtime = "nodejs";

const schema = z.object({ phone: z.string().min(8).max(20) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter a valid mobile number." }, { status: 400 });
  }
  try {
    const result = await requestOtp(parsed.data.phone);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    console.error("OTP request failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not send code right now. Try again." },
      { status: 500 },
    );
  }
}
