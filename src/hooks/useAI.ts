/**
 * useAI - Comprehensive React hooks for AI-powered culinary operations
 * 
 * Provides robust state management, error handling, and user feedback for
 * AI service interactions including recipe generation, enhancements, and
 * cooking tips. Features automatic retry mechanisms, toast notifications,
 * and comprehensive error recovery for reliable AI integration.
 * 
 * @module AIHooks
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Standardized state structure for AI operation tracking
 * 
 * @template T - Type of data returned by AI operations
 * @interface AIOperationState
 * @property data - Result data from successful AI operations
 * @property isLoading - Loading state indicator for UI feedback
 * @property error - Error message string for user-friendly error display
 */
export interface AIOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic hook for managing AI operation lifecycle with comprehensive error handling
 * 
 * Provides standardized state management for any AI operation including loading states,
 * error handling, success feedback, and retry mechanisms. Ensures consistent user
 * experience across all AI-powered features in Smart Snap Feast.
 * 
 * @template T - Type of data expected from AI operations
 * @returns Object containing state and operation control functions
 */
export function useAIOperation<T>() {
  // Centralized state management for AI operation lifecycle
  const [state, setState] = useState<AIOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  /**
   * Executes AI operations with comprehensive state management and user feedback
   * 
   * Handles the complete operation lifecycle including loading states, error handling,
   * success notifications, and data persistence. Provides configurable toast
   * notifications and error messaging for optimal user experience.
   * 
   * @param operation - Async function that performs the AI operation
   * @param options - Configuration for user feedback and error handling
   * @returns Promise resolving to operation result data
   * @throws Re-throws original error after state management for upstream handling
   */
  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showToast?: boolean;
    }
  ) => {
    // Initialize loading state with error reset for clean operation start
    setState({ data: null, isLoading: true, error: null });

    try {
      // Execute AI operation and capture result for state management
      const result = await operation();
      setState({ data: result, isLoading: false, error: null });
      
      // Provide success feedback when configured and not explicitly disabled
      if (options?.successMessage && options?.showToast !== false) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      // Transform errors into user-friendly messages for UI display
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState({ data: null, isLoading: false, error: errorMessage });
      
      // Display error notification unless explicitly disabled
      if (options?.showToast !== false) {
        toast.error(options?.errorMessage || errorMessage);
      }
      
      // Re-throw for upstream error handling while maintaining state consistency
      throw error;
    }
  }, []);

  /**
   * Resets AI operation state to initial values
   * 
   * Clears all state data, loading indicators, and error messages
   * for fresh operation execution or component cleanup.
   */
  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  /**
   * Retry mechanism for failed AI operations with same configuration
   * 
   * @param operation - AI operation function to retry
   * @param options - Same options as original execute call
   * @returns Promise resolving to retry operation result
   */
  const retry = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showToast?: boolean;
    }
  ) => {
    return execute(operation, options);
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

/**
 * Specialized hook for AI-powered recipe generation operations
 * 
 * Provides streamlined interface for recipe creation with ingredient-based
 * generation, dietary restrictions, difficulty settings, and comprehensive
 * error handling. Integrates with aiService for robust recipe creation.
 * 
 * @returns Object containing recipe generation state and functions
 */
export function useRecipeGeneration() {
  const { execute, ...state } = useAIOperation<any>();

  /**
   * Generates AI-powered recipes based on ingredients and preferences
   * 
   * Creates comprehensive recipes using advanced AI with ingredient analysis,
   * dietary constraint handling, and cooking complexity optimization.
   * Provides immediate user feedback and error recovery mechanisms.
   * 
   * @param ingredients - Array of ingredient objects for recipe base
   * @param options - Recipe generation preferences and UI configuration
   * @returns Promise resolving to complete Recipe object with metadata
   */
  const generateRecipe = useCallback((
    ingredients: any[],
    options: {
      dietaryRestrictions?: string[];
      maxTime?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      servings?: number;
      showToast?: boolean;
    } = {}
  ) => {
    return execute(
      async () => {
        // Dynamic import for optimal bundle splitting and loading performance
        const { aiService } = await import('@/services/ai');
        return aiService.generateRecipe(ingredients, {
          dietaryRestrictions: options.dietaryRestrictions,
          maxTime: options.maxTime,
          difficulty: options.difficulty,
          servings: options.servings,
        });
      },
      {
        successMessage: 'Recipe generated successfully!',
        errorMessage: 'Failed to generate recipe. Please try again.',
        showToast: options.showToast,
      }
    );
  }, [execute]);

  return {
    ...state,
    generateRecipe,
  };
}

/**
 * Specialized hook for AI-powered recipe enhancement operations
 * 
 * Provides intelligent recipe improvements including personalized cooking tips,
 * technique suggestions, and culinary guidance based on recipe content and
 * user preferences. Enhances existing recipes with AI-generated insights.
 * 
 * @returns Object containing enhancement state and functions
 */
export function useRecipeEnhancements() {
  const { execute, ...state } = useAIOperation<{
    cookingTips?: string[];
  }>();

  /**
   * Retrieves AI-generated enhancements for existing recipes
   * 
   * Analyzes recipe content to provide personalized cooking tips, technique
   * improvements, and culinary guidance. Creates contextual advice tailored
   * to specific recipes and cooking methods.
   * 
   * @param recipe - Recipe object to enhance with AI-generated insights
   * @param options - Configuration for error handling and user feedback
   * @returns Promise resolving to enhancement data with cooking tips
   */
  const getEnhancements = useCallback((
    recipe: any,
    options?: { showToast?: boolean }
  ) => {
    return execute(
      async () => {
        // Dynamic import for code splitting and performance optimization
        const { aiService } = await import('@/services/ai');
        return aiService.getRecipeEnhancements(recipe);
      },
      {
        errorMessage: 'Failed to load recipe enhancements.',
        showToast: options?.showToast !== false,
      }
    );
  }, [execute]);

  return {
    ...state,
    getEnhancements,
  };
}

/**
 * Advanced retry mechanism with exponential backoff for API resilience
 * 
 * Implements intelligent retry logic for handling API rate limits, temporary
 * service unavailability, and network issues. Features exponential backoff,
 * jitter for request distribution, and user progress feedback.
 * 
 * @returns Object containing retry execution function and status tracking
 */
export function useRetryWithBackoff() {
  // Retry state management for user feedback and operation control
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Executes operations with intelligent retry and exponential backoff
   * 
   * Implements robust retry mechanism with progressive delays for API resilience.
   * Handles rate limiting, server errors, and network issues with user feedback
   * and automatic recovery. Distinguishes between retryable and permanent errors.
   * 
   * @template T - Type of data returned by the operation
   * @param operation - Async function to execute with retry logic
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @param baseDelay - Base delay in milliseconds for retry calculation
   * @returns Promise resolving to operation result after successful execution
   * @throws Final error if all retry attempts are exhausted
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    setIsRetrying(true);
    let lastError: Error;

    // Execute operation with progressive retry attempts and exponential backoff
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        // Reset retry state on successful execution
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Exhaust all retry attempts before final failure
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw lastError;
        }

        // Intelligent error classification for retry decision making
        const isRetryableError = 
          lastError.message.includes('429') ||
          lastError.message.includes('rate limit') ||
          lastError.message.includes('503') ||
          lastError.message.includes('502');

        // Skip retry for permanent errors (authentication, validation, etc.)
        if (!isRetryableError) {
          setIsRetrying(false);
          throw lastError;
        }

        // Calculate exponential backoff with jitter for distributed retry timing
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        setRetryCount(attempt + 1);
        
        // Provide user feedback for retry progress and expected wait time
        toast.info(`Retrying in ${Math.ceil(delay / 1000)} seconds... (Attempt ${attempt + 2}/${maxRetries + 1})`);
        
        // Execute delay before next retry attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsRetrying(false);
    throw lastError!;
  }, []);

  /**
   * Resets retry state for fresh operation execution
   * 
   * Clears retry counters and status indicators for component
   * cleanup or new operation initiation.
   */
  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    reset,
  };
}