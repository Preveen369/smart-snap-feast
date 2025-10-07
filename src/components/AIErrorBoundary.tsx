/**
 * AIErrorBoundary - React Error Boundary for AI Service Operations
 * 
 * Provides comprehensive error handling for AI-related components and services.
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI with retry functionality.
 * 
 * @component
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Props interface for AIErrorBoundary component
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State interface for AIErrorBoundary component
 */
interface State {
  hasError: boolean;
  error?: Error;
}

export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Static method to update state when an error is caught
   * @param error - The error that was thrown
   * @returns Updated state with error information
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs error details for debugging purposes
   */
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AI Service Error:', error, errorInfo);
  }

  /**
   * Handles retry action by resetting error state
   * Allows users to attempt the failed operation again
   */
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
 * Props interface for AILoading component
 */
interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AILoading - Loading indicator for AI operations
 * 
 * Displays a spinning loader with customizable message and size.
 * Used to provide visual feedback during AI processing operations.
 * 
 * @param message - Custom loading message to display
 * @param size - Size variant for the loading spinner
 */
export function AILoading({ message = 'Processing...', size = 'md' }: LoadingProps) {
  // Responsive size classes for the loading spinner
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
 * Props interface for AIErrorDisplay component
 */
interface ErrorDisplayProps {
  error: string | Error;
  action?: string;
  onRetry?: () => void;
}

/**
 * AIErrorDisplay - Specialized error display for AI operations
 * 
 * Renders error messages in a consistent format with optional retry functionality.
 * Handles both string and Error object inputs for flexible error reporting.
 * 
 * @param error - Error message or Error object to display
 * @param action - Description of the failed action for context
 * @param onRetry - Optional callback function for retry attempts
 */
export function AIErrorDisplay({ error, action = 'operation', onRetry }: ErrorDisplayProps) {
  // Extract error message from string or Error object
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
 * Props interface for AIOperationWrapper component
 */
interface AIOperationWrapperProps {
  children: ReactNode;
  isLoading: boolean;
  error?: string | Error | null;
  loadingMessage?: string;
  onRetry?: () => void;
  action?: string;
}

/**
 * AIOperationWrapper - Comprehensive wrapper for AI operations
 * 
 * Provides a unified interface for handling loading states, errors, and success states
 * in AI operations. Automatically switches between loading, error, and content views
 * based on the current operation state.
 * 
 * @param children - Content to render when operation is successful
 * @param isLoading - Whether the AI operation is currently in progress
 * @param error - Error state if the operation failed
 * @param loadingMessage - Custom message to show during loading
 * @param onRetry - Callback function to retry the failed operation
 * @param action - Description of the operation for error context
 */
export function AIOperationWrapper({
  children,
  isLoading,
  error,
  loadingMessage,
  onRetry,
  action = 'Operation',
}: AIOperationWrapperProps) {
  // Show loading state during AI processing
  if (isLoading) {
    return <AILoading message={loadingMessage} />;
  }

  // Show error state if operation failed
  if (error) {
    return <AIErrorDisplay error={error} action={action} onRetry={onRetry} />;
  }

  // Render children when operation is successful
  return <>{children}</>;
}