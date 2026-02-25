/* ============================================
   Devfolio — Email Verification Pending Page
   ============================================ */

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { extractFieldErrors } from "@/lib/api";
import toast from "react-hot-toast";

export default function VerifyEmailPendingPage() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  // Count down the cooldown timer every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/users/verify-email/request/", { email });
      toast.success("Verification email resent — check your inbox.");
      setCooldown(60); // prevent spamming — 60s before they can resend again
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        toast.error(Object.values(fieldErrors)[0]); // show first field error as toast
      } else if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (typeof data.detail === "string") {
          toast.error(data.detail);
        } else if (typeof data.error === "string") {
          toast.error(data.error);
        } else {
          toast.error("Failed to resend verification email.");
        }
      } else {
        toast.error("Failed to resend verification email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/10">
        <Mail className="h-8 w-8 text-brand-400" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold text-surface-100">Check your email</h1>
      <p className="mt-2 text-sm text-surface-400">
        We've sent a verification link to{" "}
        {email ? (
          <span className="font-medium text-surface-200">{email}</span>
        ) : (
          "your email address"
        )}
        . Click the link in the email to activate your account.
      </p>

      <div className="mt-6 space-y-3">
        <Button
          onClick={handleResend}
          loading={loading}
          disabled={cooldown > 0}
          variant="secondary"
          className="w-full">
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
        </Button>

        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to login
        </Link>
      </div>
    </div>
  );
}