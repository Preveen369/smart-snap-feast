/**
 * Error boundary component for AI service errors
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AI Service Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>AI Service Error</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Something went wrong with the AI service.</p>
            <p className="text-sm opacity-75">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="w-full"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading component for AI operations
 */
interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AILoading({ message = 'Processing...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-2">
      <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${sizeClasses[size]}`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Error display component for specific AI operation failures
 */
interface ErrorDisplayProps {
  error: string | Error;
  action?: string;
  onRetry?: () => void;
}

export function AIErrorDisplay({ error, action = 'operation', onRetry }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>AI {action} Failed</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Wrapper component for AI operations with built-in error handling
 */
interface AIOperationWrapperProps {
  children: ReactNode;
  isLoading: boolean;
  error?: string | Error | null;
  loadingMessage?: string;
  onRetry?: () => void;
  action?: string;
}

export function AIOperationWrapper({
  children,
  isLoading,
  error,
  loadingMessage,
  onRetry,
  action = 'Operation',
}: AIOperationWrapperProps) {
  if (isLoading) {
    return <AILoading message={loadingMessage} />;
  }

  if (error) {
    return <AIErrorDisplay error={error} action={action} onRetry={onRetry} />;
  }

  return <>{children}</>;
}