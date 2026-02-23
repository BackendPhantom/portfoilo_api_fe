/* ============================================
   Devfolio — Error Boundary
   ============================================ */

import { Component, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import { RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-500/10 mb-6">
              <span className="text-3xl">💥</span>
            </div>
            <h1 className="text-2xl font-semibold text-surface-100">
              Something went wrong
            </h1>
            <p className="mt-2 text-surface-400">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="mt-4 rounded-lg bg-surface-900 p-3 text-xs text-danger-400 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleReset}>
                Try again
              </Button>
              <a href="/dashboard">
                <Button icon={<Home className="h-4 w-4" />}>Dashboard</Button>
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
