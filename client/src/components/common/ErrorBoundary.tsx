import React, { ErrorInfo, Component } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: (window as any).userId,
        sessionId: (window as any).sessionId
      };

      await fetch('/api/error/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });
    } catch {
      console.error('Failed to log error to service');
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-8">
          <div className="w-full max-w-2xl bg-void-black/95 border border-ancient-gold/20 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ancient-gold/10 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="font-cinzel text-3xl font-bold text-ghost-white mb-2">Something went wrong</h1>
              <p className="text-ancient-gold/70 font-cinzel">We've been notified and are working to fix this</p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8">
                <h2 className="font-cinzel text-xl font-semibold text-ghost-white mb-4">Error Details</h2>
                <div className="bg-void-black/80 border border-ancient-gold/10 rounded-xl p-4 font-jetbrains text-sm overflow-auto max-h-64">
                  <div className="text-ancient-gold/40 mb-2">Message:</div>
                  <div className="text-ghost-white mb-4">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="text-ancient-gold/40 mb-2">Stack:</div>
                      <pre className="text-ghost-white/70 whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                    </>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <div className="text-ancient-gold/40 mb-2 mt-4">Component Stack:</div>
                      <pre className="text-ghost-white/70 whitespace-pre-wrap text-xs">{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-ancient-gold hover:bg-ancient-gold/80 text-void-black font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Reload App
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRetry}
                className="px-8 py-4 bg-void-black/50 hover:bg-void-black/80 text-ghost-white border border-ancient-gold/30 rounded-xl transition-all duration-300 font-semibold backdrop-blur-sm"
              >
                Try Again
              </motion.button>
            </div>

            {this.state.errorId && (
              <div className="mt-8 pt-8 border-t border-ancient-gold/10 text-center">
                <p className="text-xs text-ancient-gold/30 font-jetbrains">Error ID: {this.state.errorId}</p>
                <p className="text-xs text-ancient-gold/30 font-jetbrains mt-1">
                  If this persists, please contact support with this Error ID
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
