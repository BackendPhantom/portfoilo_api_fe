/* ============================================
   Devfolio — Email Verification Pending Page
   ============================================ */

import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function VerifyEmailPendingPage() {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/users/verify-email/");
      toast.success("Verification email resent!");
    } catch {
      toast.error("Failed to resend. Please try again.");
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
        We've sent a verification link to your email address. Please check your
        inbox and click the link to activate your account.
      </p>

      <div className="mt-6 space-y-3">
        <Button
          onClick={handleResend}
          loading={loading}
          variant="secondary"
          className="w-full">
          Resend verification email
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
