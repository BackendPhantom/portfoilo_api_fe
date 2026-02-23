/* ============================================
   Devfolio — Not Found Page (404)
   ============================================ */

import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-brand-500">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-surface-100">
          Page not found
        </h1>
        <p className="mt-2 text-surface-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => window.history.back()}>
            Go back
          </Button>
          <Link to="/dashboard">
            <Button icon={<Home className="h-4 w-4" />}>Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
