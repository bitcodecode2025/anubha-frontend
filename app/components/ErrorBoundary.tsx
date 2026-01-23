"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string; // Context for which component/section failed
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("Error caught by boundary:", error, errorInfo);
    console.error("Error stack:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);
    if (this.props.context) {
      console.error("Error context:", this.props.context);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          context={this.props.context}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  context?: string;
  onReset: () => void;
}

function ErrorFallback({
  error,
  errorInfo,
  context,
  onReset,
}: ErrorFallbackProps) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === "development";

  const handleGoBack = () => {
    router.back();
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border-2 border-red-100 p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h1>
          {context && (
            <p className="text-sm text-slate-600 mb-4">
              Error in: <span className="font-semibold">{context}</span>
            </p>
          )}
          <p className="text-slate-700">
            We're sorry, but something unexpected happened. Please try one of
            the options below.
          </p>
        </div>

        {/* Development Mode: Show Error Details */}
        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Error Details (Development Only):
            </h3>
            <p className="text-sm text-red-700 font-mono mb-2">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                  Stack Trace
                </summary>
                <pre className="text-xs text-slate-700 mt-2 overflow-auto max-h-40 p-2 bg-slate-50 rounded border">
                  {error.stack}
                </pre>
              </details>
            )}
            {errorInfo?.componentStack && (
              <details className="mt-2">
                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                  Component Stack
                </summary>
                <pre className="text-xs text-slate-700 mt-2 overflow-auto max-h-40 p-2 bg-slate-50 rounded border">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Recovery Options */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={handleReload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export a hook for functional components to trigger errors (for testing)
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    throw error;
  };
}
