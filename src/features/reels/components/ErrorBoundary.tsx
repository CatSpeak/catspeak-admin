import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon } from "lucide-react";
import Button from "../../../components/ui/Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by Reels ErrorBoundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-2xl border border-gray-150 shadow-sm max-w-lg mx-auto my-12 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>

          <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">
            An unexpected error occurred while loading the Reels Management dashboard.
            {this.state.error?.message && (
              <code className="block mt-2 p-2 bg-gray-50 rounded text-xs text-red-600 font-mono break-all">
                {this.state.error.message}
              </code>
            )}
          </p>

          <Button variant="primary" size="md" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
