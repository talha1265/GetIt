import { NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/db";
import { checkR2, hasR2 } from "@/lib/storage/r2";
import { hasPayU } from "@/lib/payments/payu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Setup/diagnostics endpoint. Reports whether each integration is configured
 * and reachable (booleans only — no secret values). Hit this after filling in
 * .env to confirm production wiring: GET /api/health
 */
export async function GET() {
  // Database
  const db = { configured: hasDatabase, connected: false, error: undefined as string | undefined };
  if (hasDatabase) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      db.connected = true;
    } catch (err) {
      db.error = (err as Error).message;
    }
  }

  // R2
  const r2Check = hasR2 ? await checkR2() : { ok: false, error: "not configured" };

  const report = {
    ok: db.connected,
    services: {
      database: db,
      r2: { configured: hasR2, reachable: r2Check.ok, error: r2Check.error },
      payu: { configured: hasPayU, mode: process.env.PAYU_MODE ?? "test" },
      msg91: {
        configured: Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID),
      },
      authSecret: { configured: Boolean(process.env.AUTH_SECRET) },
    },
  };

  return NextResponse.json(report, { status: db.connected ? 200 : 503 });
}
