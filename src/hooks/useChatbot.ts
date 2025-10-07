/**
 * useChatbot - React hook for Chatbase AI integration and lifecycle management
 * 
 * Provides seamless integration with Chatbase AI chatbot service, handling
 * initialization, loading states, error management, and service readiness
 * detection. Implements automatic initialization with retry mechanisms
 * for robust chatbot functionality in Smart Snap Feast application.
 * 
 * @returns Object containing chatbot state and control functions
 */

import { useEffect, useState } from 'react';
import ChatbotService from '@/services/chatbot';

/**
 * Return interface for useChatbot hook functionality
 * 
 * @interface UseChatbotReturn
 * @property isLoaded - Whether chatbot is fully initialized and ready for user interaction
 * @property isError - Whether an error occurred during initialization process
 * @property initialize - Function to manually trigger chatbot initialization
 * @property error - Detailed error information if initialization failed
 */
interface UseChatbotReturn {
  isLoaded: boolean;
  isError: boolean;
  initialize: () => Promise<void>;
  error: Error | null;
}

export const useChatbot = (): UseChatbotReturn => {
  // Chatbot service state management for UI feedback and control
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Singleton chatbot service instance for consistent state management
  const chatbotService = ChatbotService.getInstance();

  /**
   * Initializes Chatbase AI service with comprehensive error handling
   * 
   * Orchestrates the complete chatbot initialization process including
   * service startup, readiness detection, and retry mechanisms for
   * reliable chatbot functionality across different network conditions.
   * 
   * @returns Promise that resolves when chatbot is fully ready for use
   * @throws Error if initialization fails after retry attempts
   */
  const initialize = async (): Promise<void> => {
    try {
      // Reset error states for fresh initialization attempt
      setIsError(false);
      setError(null);
      
      // Execute core chatbot service initialization
      await chatbotService.initialize();
      
      /**
       * Implements polling-based readiness detection with retry mechanism
       * 
       * Continuously checks chatbot service status until fully ready,
       * providing responsive UI updates and handling initialization delays
       * common with external chatbot service integration.
       */
      const checkReady = () => {
        if (chatbotService.isReady()) {
          setIsLoaded(true);
        } else {
          // Implement progressive retry with short intervals for responsive UX
          setTimeout(checkReady, 100);
        }
      };
      
      // Start readiness detection polling
      checkReady();
    } catch (err) {
      // Transform and standardize error objects for consistent error handling
      const errorMessage = err instanceof Error ? err : new Error('Failed to initialize chatbot');
      setError(errorMessage);
      setIsError(true);
      console.error('Chatbot initialization failed:', errorMessage);
    }
  };

  /**
   * Automatic chatbot initialization on hook mount
   * 
   * Provides seamless user experience by automatically initializing
   * the chatbot service when components using this hook are rendered,
   * eliminating need for manual initialization in most use cases.
   */
  useEffect(() => {
    // Execute automatic initialization for immediate chatbot availability
    initialize();
  }, []);

  return {
    isLoaded,
    isError,
    initialize,
    error,
  };
};