/* ============================================
   Devfolio — Email Verification Confirm Page
   ============================================ */

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function VerifyEmailConfirmPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const uid = useMemo(() => searchParams.get("uid"), [searchParams]);

  useEffect(() => {
    if (!token || !uid) {
      queueMicrotask(() => setStatus("error"));
      return;
    }

    api
      .post("/auth/verify-email/", { token, uid })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token, uid]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <>
          <Loader2
            className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-500"
            aria-hidden="true"
          />
          <h1 className="text-xl font-bold text-surface-100">
            Verifying your email…
          </h1>
          <p className="mt-2 text-sm text-surface-400" aria-live="polite">
            Please wait while we confirm your email address.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
            <CheckCircle
              className="h-8 w-8 text-success-500"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-bold text-surface-100">
            Email verified!
          </h1>
          <p className="mt-2 text-sm text-surface-400">
            Your email has been successfully verified. You can now sign in.
          </p>
          <Link to="/login" className="mt-6 inline-block">
            <Button>Go to login</Button>
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-500/10">
            <XCircle className="h-8 w-8 text-danger-500" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-surface-100">
            Verification failed
          </h1>
          <p className="mt-2 text-sm text-surface-400">
            The verification link is invalid or has expired. Please try again.
          </p>
          <Link to="/login" className="mt-6 inline-block">
            <Button variant="secondary">Back to login</Button>
          </Link>
        </>
      )}
    </div>
  );
}
