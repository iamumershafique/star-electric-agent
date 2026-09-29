import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
          <div className="max-w-lg w-full bg-white border border-rose-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Error Encountered</h2>
              <p className="text-xs text-slate-600 mt-1">
                A component error was caught. You can dismiss this alert or reload the application.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-3 bg-slate-900 text-rose-300 rounded-xl text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <RefreshCw className="w-4 h-4" /> Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
