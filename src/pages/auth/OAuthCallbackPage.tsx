/* ============================================
   Devfolio — OAuth Callback Page

   Backend redirects here with ?code=<uuid> after
   successful social auth. We exchange the code for
   tokens via POST, store them, fetch the user, and
   redirect to /dashboard.
   ============================================ */

import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { storeTokens } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  // Derive error from URL params
  const urlError = useMemo(() => {
    const e = searchParams.get("error");
    return e ? decodeURIComponent(e) : null;
  }, [searchParams]);

  const code = useMemo(() => searchParams.get("code"), [searchParams]);

  const [error, setError] = useState<string | null>(urlError);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;


    if (urlError) return; // already showing error

    if (!code) {
      queueMicrotask(() =>
        setError("Authentication failed. No authorization code received.")
      );
      return;
    }

    // Exchange the code for tokens, then store & fetch user
    api
      .post<{ access: string; refresh: string }>("/auth/social/exchange/", {
        code,
      })
      .then(({ data }) => storeTokens(data))
      .then(() => {
        console.log("[OAuth] ✓ navigating to /dashboard");
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        console.error("[OAuth] ✗ token exchange failed:", err);
        const msg =
          err?.response?.data?.error ??
          (err instanceof Error ? err.message : String(err));
        setError(`Sign-in failed: ${msg}. Please try again.`);
      });
  }, [urlError, code, storeTokens, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
        <div className="w-full max-w-md rounded-xl border border-danger-500/30 bg-surface-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-500/10">
            <AlertCircle
              className="h-6 w-6 text-danger-500"
              aria-hidden="true"
            />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-surface-100">
            Authentication Failed
          </h1>
          <p className="mb-6 text-sm text-surface-400">{error}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="h-8 w-8 animate-spin text-brand-500"
          aria-hidden="true"
        />
        <p className="text-sm text-surface-400" aria-live="polite">
          Completing sign in…
        </p>
      </div>
    </div>
  );
}
