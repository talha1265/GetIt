import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma, hasDatabase } from "@/lib/db";
import { sendOtpSms } from "@/lib/notifications/msg91";

const CODE_LENGTH = 6;
const TTL_MS = 5 * 60_000; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_WINDOW_MS = 30_000; // min gap between sends per phone

const SECRET = process.env.AUTH_SECRET ?? "dev-only-insecure-secret";

function generateCode(): string {
  // 6-digit, leading zeros allowed
  const n = Math.floor(Math.random() * 10 ** CODE_LENGTH);
  return n.toString().padStart(CODE_LENGTH, "0");
}

function hashCode(phone: string, code: string): string {
  return createHmac("sha256", SECRET).update(`${phone}:${code}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Normalise an Indian phone number to E.164-ish (+91XXXXXXXXXX). */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (input.startsWith("+") && digits.length >= 11 && digits.length <= 15)
    return `+${digits}`;
  return null;
}

// ---------------------------------------------------------------------------
// Storage: Postgres (prod) or in-memory (dev without a DB)
// ---------------------------------------------------------------------------
type Rec = { codeHash: string; expiresAt: number; attempts: number; consumed: boolean };
const memStore = new Map<string, Rec & { createdAt: number }>();

export type RequestResult =
  | { ok: true; devCode?: string }
  | { ok: false; error: string };

export async function requestOtp(rawPhone: string): Promise<RequestResult> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: "Enter a valid 10-digit mobile number." };

  const code = generateCode();
  const codeHash = hashCode(phone, code);
  const expiresAt = Date.now() + TTL_MS;

  if (hasDatabase) {
    const recent = await prisma.otpToken.findFirst({
      where: { phone, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < RESEND_WINDOW_MS) {
      return { ok: false, error: "Please wait a few seconds before requesting another code." };
    }
    await prisma.otpToken.create({
      data: { phone, codeHash, expiresAt: new Date(expiresAt) },
    });
  } else {
    const prev = memStore.get(phone);
    if (prev && Date.now() - prev.createdAt < RESEND_WINDOW_MS) {
      return { ok: false, error: "Please wait a few seconds before requesting another code." };
    }
    memStore.set(phone, { codeHash, expiresAt, attempts: 0, consumed: false, createdAt: Date.now() });
  }

  const delivery = await sendOtpSms(phone, code);
  // In dev (no MSG91 key), surface the code so the flow is testable.
  return { ok: true, devCode: delivery.devCode };
}

export type VerifyResult =
  | { ok: true; phone: string }
  | { ok: false; error: string };

export async function verifyOtp(rawPhone: string, code: string): Promise<VerifyResult> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: "Invalid phone number." };
  const incoming = hashCode(phone, code.trim());

  if (hasDatabase) {
    const token = await prisma.otpToken.findFirst({
      where: { phone, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!token) return { ok: false, error: "Request a code first." };
    if (token.expiresAt.getTime() < Date.now())
      return { ok: false, error: "Code expired. Request a new one." };
    if (token.attempts >= MAX_ATTEMPTS)
      return { ok: false, error: "Too many attempts. Request a new code." };

    if (!safeEqualHex(incoming, token.codeHash)) {
      await prisma.otpToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });
      return { ok: false, error: "Incorrect code." };
    }
    await prisma.otpToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });
    return { ok: true, phone };
  }

  const rec = memStore.get(phone);
  if (!rec || rec.consumed) return { ok: false, error: "Request a code first." };
  if (rec.expiresAt < Date.now()) return { ok: false, error: "Code expired. Request a new one." };
  if (rec.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Too many attempts. Request a new code." };
  if (!safeEqualHex(incoming, rec.codeHash)) {
    rec.attempts += 1;
    return { ok: false, error: "Incorrect code." };
  }
  rec.consumed = true;
  return { ok: true, phone };
}
