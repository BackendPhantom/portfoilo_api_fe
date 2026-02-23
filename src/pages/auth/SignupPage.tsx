/* ============================================
   Devfolio — Signup Page
   ============================================ */

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TextInput, PasswordInput } from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import {
  GoogleOAuthButton,
  GitHubOAuthButton,
} from "@/components/auth/OAuthButtons";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.first_name) errs.first_name = "First name is required";
    if (!form.last_name) errs.last_name = "Last name is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm_password)
      errs.confirm_password = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await signup(form);
      toast.success("Account created! Please check your email to verify.");
      navigate("/verify-email-pending");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const mapped: Record<string, string> = {};
          Object.entries(data).forEach(([key, val]) => {
            mapped[key] = Array.isArray(val) ? val[0] : String(val);
          });
          setErrors(mapped);
        }
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-surface-100">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-surface-400">
          Get started with your portfolio dashboard
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <GoogleOAuthButton />
        <GitHubOAuthButton />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface-900 px-3 text-surface-500">
            or sign up with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="First name"
            placeholder="John"
            value={form.first_name}
            onChange={update("first_name")}
            error={errors.first_name}
            autoComplete="given-name"
            required
          />
          <TextInput
            label="Last name"
            placeholder="Doe"
            value={form.last_name}
            onChange={update("last_name")}
            error={errors.last_name}
            autoComplete="family-name"
            required
          />
        </div>

        <TextInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Repeat your password"
          value={form.confirm_password}
          onChange={update("confirm_password")}
          error={errors.confirm_password}
          autoComplete="new-password"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-brand-400 hover:text-brand-300 font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
