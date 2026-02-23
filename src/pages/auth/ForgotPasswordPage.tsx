/* ============================================
   Devfolio — Forgot Password Page
   ============================================ */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { TextInput } from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/password-reset/", { email });
      setSent(true);
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/10">
          <Mail className="h-8 w-8 text-brand-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-surface-100">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-surface-400">
          If an account with that email exists, we've sent a password reset
          link.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-surface-100">
          Forgot password?
        </h1>
        <p className="mt-1 text-sm text-surface-400">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to login
        </Link>
      </p>
    </>
  );
}
