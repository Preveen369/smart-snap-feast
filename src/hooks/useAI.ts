/**
 * Custom hooks for AI operations with error handling and state management
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AIOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAIOperation<T>() {
  const [state, setState] = useState<AIOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showToast?: boolean;
    }
  ) => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const result = await operation();
      setState({ data: result, isLoading: false, error: null });
      
      if (options?.successMessage && options?.showToast !== false) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState({ data: null, isLoading: false, error: errorMessage });
      
      if (options?.showToast !== false) {
        toast.error(options?.errorMessage || errorMessage);
      }
      
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

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
 * Hook for image analysis operations
 */
export function useImageAnalysis() {
  const { execute, ...state } = useAIOperation<{
    ingredients: string[];
    suggestions: string[];
    nutritionalInfo?: any;
  }>();

  const analyzeImage = useCallback((
    file: File,
    options?: { showToast?: boolean }
  ) => {
    return execute(
      async () => {
        const { aiService } = await import('@/services/ai');
        return aiService.analyzeImage(file);
      },
      {
        successMessage: 'Image analyzed successfully!',
        errorMessage: 'Failed to analyze image. Please try again.',
        showToast: options?.showToast,
      }
    );
  }, [execute]);

  return {
    ...state,
    analyzeImage,
  };
}

/**
 * Hook for recipe generation operations
 */
export function useRecipeGeneration() {
  const { execute, ...state } = useAIOperation<any>();

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
 * Hook for recipe enhancement operations
 */
export function useRecipeEnhancements() {
  const { execute, ...state } = useAIOperation<{
    cookingTips?: string[];
  }>();

  const getEnhancements = useCallback((
    recipe: any,
    options?: { showToast?: boolean }
  ) => {
    return execute(
      async () => {
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
 * Utility hook for handling API rate limits and retries
 */
export function useRetryWithBackoff() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    setIsRetrying(true);
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw lastError;
        }

        // Check if it's a rate limit error (429) or server error (5xx)
        const isRetryableError = 
          lastError.message.includes('429') ||
          lastError.message.includes('rate limit') ||
          lastError.message.includes('503') ||
          lastError.message.includes('502');

        if (!isRetryableError) {
          setIsRetrying(false);
          throw lastError;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        setRetryCount(attempt + 1);
        
        toast.info(`Retrying in ${Math.ceil(delay / 1000)} seconds... (Attempt ${attempt + 2}/${maxRetries + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsRetrying(false);
    throw lastError!;
  }, []);

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