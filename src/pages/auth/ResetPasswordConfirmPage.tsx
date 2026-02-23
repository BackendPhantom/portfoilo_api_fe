/* ============================================
   Devfolio — Reset Password Confirm Page
   ============================================ */

import { useState, type FormEvent } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ResetPasswordConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!password) errs.new_password = "Password is required";
    else if (password.length < 8)
      errs.new_password = "Password must be at least 8 characters";
    if (password !== confirmPassword) errs.confirm = "Passwords do not match";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await api.post("/users/password-reset/confirm/", {
        uid,
        token,
        new_password: password,
        confirm_new_password: confirmPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch {
      toast.error("Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold text-surface-100">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-surface-400">
          This password reset link is invalid or has expired.
        </p>
        <Link
          to="/forgot-password"
          className="mt-4 inline-block text-sm text-brand-400 hover:text-brand-300">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-surface-100">
          Set new password
        </h1>
        <p className="mt-1 text-sm text-surface-400">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <PasswordInput
          label="New password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.new_password}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm new password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Reset password
        </Button>
      </form>
    </>
  );
}
