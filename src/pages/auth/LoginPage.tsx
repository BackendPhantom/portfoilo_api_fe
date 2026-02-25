/* ============================================
   Devfolio — Login Page
   ============================================ */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TextInput, PasswordInput } from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import {
  GoogleOAuthButton,
  GitHubOAuthButton,
} from "@/components/auth/OAuthButtons";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { extractFieldErrors } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
        return;
      }

      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          toast.error(data.detail);
        } else if (data.non_field_errors) {
          toast.error(data.non_field_errors[0]);
        } else {
          setErrors(data);
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-surface-100">Welcome back</h1>
        <p className="mt-1 text-sm text-surface-400">
          Sign in to your portfolio dashboard
        </p>
      </div>

      {/* Social auth */}
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
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-400">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-brand-400 hover:text-brand-300 font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
