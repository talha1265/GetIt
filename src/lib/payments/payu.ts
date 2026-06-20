import "server-only";
import { createHash } from "node:crypto";

const KEY = process.env.PAYU_MERCHANT_KEY;
const SALT = process.env.PAYU_MERCHANT_SALT;
const MODE = process.env.PAYU_MODE === "live" ? "live" : "test";

/** True when PayU credentials are configured. */
export const hasPayU = Boolean(KEY && SALT);

export const PAYU_ACTION =
  MODE === "live"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";

export interface PayuRequest {
  action: string;
  params: Record<string, string>;
}

interface BuildArgs {
  txnid: string;
  amountPaise: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
}

function sha512(input: string): string {
  return createHash("sha512").update(input).digest("hex");
}

/**
 * Build the form fields + signed hash for PayU's hosted checkout.
 * Request hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1..udf5||||||salt)
 */
export function buildPayuRequest(args: BuildArgs): PayuRequest {
  if (!hasPayU) throw new Error("PayU is not configured.");
  const amount = (args.amountPaise / 100).toFixed(2);
  const udf1 = args.udf1 ?? "";
  const udf = [udf1, "", "", "", ""]; // udf1..udf5

  const hashSequence = [
    KEY,
    args.txnid,
    amount,
    args.productinfo,
    args.firstname,
    args.email,
    ...udf,
    "", "", "", "", "", // 5 empty fields before salt
    SALT,
  ].join("|");

  const hash = sha512(hashSequence);

  return {
    action: PAYU_ACTION,
    params: {
      key: KEY!,
      txnid: args.txnid,
      amount,
      productinfo: args.productinfo,
      firstname: args.firstname,
      email: args.email,
      phone: args.phone,
      surl: args.surl,
      furl: args.furl,
      udf1,
      hash,
    },
  };
}

/**
 * Verify the reverse hash PayU posts back to surl/furl.
 * Reverse hash = sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayuResponse(body: Record<string, string>): boolean {
  if (!hasPayU) return false;
  const get = (k: string) => body[k] ?? "";
  const reverseSequence = [
    SALT,
    get("status"),
    "", "", "", "", "", // additionalCharges + reserved empties
    get("udf5"),
    get("udf4"),
    get("udf3"),
    get("udf2"),
    get("udf1"),
    get("email"),
    get("firstname"),
    get("productinfo"),
    get("amount"),
    get("txnid"),
    KEY,
  ].join("|");

  const expected = sha512(reverseSequence);
  const provided = (get("hash") || "").toLowerCase();
  return expected === provided;
}
