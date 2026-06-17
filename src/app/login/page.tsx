"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Step = "phone" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Could not send code.");
        return;
      }
      setDevCode(data.devCode ?? null);
      setStep("code");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("otp", { phone, code, redirect: false });
      if (res?.error) {
        setError("Incorrect or expired code.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <span
          className="bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
          style={{ backgroundImage: "var(--ring-gradient)" }}
        >
          getIt
        </span>
        <p className="mt-2 text-sm text-muted">
          Shop what they post. Earn 5% cashback.
        </p>
      </div>

      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestCode();
          }}
          className="space-y-4"
        >
          <label className="block text-sm font-semibold">Mobile number</label>
          <div className="flex items-center gap-2 rounded-2xl border border-border-strong bg-surface px-3 focus-within:border-foreground">
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <Phone className="h-4 w-4" /> +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoFocus
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 flex-1 bg-transparent text-base outline-none"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading || phone.replace(/\D/g, "").length < 10}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
          </Button>
          <p className="text-center text-xs text-muted">
            We&apos;ll text you a one-time code. Standard rates may apply.
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyCode();
          }}
          className="space-y-4"
        >
          <label className="block text-sm font-semibold">
            Enter the 6-digit code
          </label>
          <p className="text-xs text-muted">Sent to +91 {phone}</p>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-14 w-full rounded-2xl border border-border-strong bg-surface text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-foreground"
          />
          {devCode && (
            <p className="rounded-xl bg-surface-muted px-3 py-2 text-center text-xs text-muted-strong">
              Dev mode (no SMS configured) — your code is{" "}
              <span className="font-bold text-foreground">{devCode}</span>
            </p>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading || code.length < 6}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" /> Verify & continue
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
            className="w-full text-center text-sm font-semibold text-accent"
          >
            Change number
          </button>
        </form>
      )}
    </div>
  );
}
