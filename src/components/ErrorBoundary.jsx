import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mandate Gateway Caught UI Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-on-surface">
          <div className="max-w-md w-full bg-surface-container-lowest border border-[#E7E7E3] rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-error flex items-center justify-center border border-red-200">
              <span className="material-symbols-outlined text-[30px]">warning</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="font-title-md text-xl font-bold text-primary">
                Application Route Recovered
              </h1>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                An unexpected component rendering issue occurred on this view. The Mandate Gateway safety boundary prevented a full application crash.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Reload Page</span>
              </button>
              <Link
                to="/dashboard"
                onClick={this.handleResetState}
                className="btn-outline text-xs py-2 px-4 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span>Return to Dashboard</span>
              </Link>
            </div>

            {this.state.error && (
              <details className="text-left bg-surface-container-low p-3 rounded-xl border border-[#E7E7E3] text-[11px] font-mono text-secondary mt-4">
                <summary className="cursor-pointer font-semibold select-none hover:text-primary">
                  Diagnostic Information
                </summary>
                <div className="mt-2 text-error break-all">
                  {this.state.error.toString()}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
