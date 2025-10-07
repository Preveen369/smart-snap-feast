/**
 * useLocalStorage - React hook for persistent state management with localStorage
 * 
 * Provides seamless integration between React state and browser localStorage,
 * enabling persistent data storage across browser sessions. Features automatic
 * serialization/deserialization, error handling, and type safety for reliable
 * client-side data persistence in the Smart Snap Feast application.
 * 
 * @template T - The type of data being stored
 * @param key - Unique localStorage key for data identification
 * @param initialValue - Default value when no stored data exists
 * @returns Tuple containing current value and setter function
 * 
 * @example
 * const [recipes, setRecipes] = useLocalStorage<Recipe[]>('user-recipes', []);
 * const [preferences, setPreferences] = useLocalStorage('user-prefs', { theme: 'light' });
 */

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  /**
   * Initialize state with localStorage data or fallback to initial value
   * 
   * Attempts to retrieve and deserialize stored data from localStorage.
   * Implements robust error handling for corrupted data, missing keys,
   * and JSON parsing failures with graceful fallback to initial value.
   */
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Attempt to retrieve stored data from localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      // Graceful degradation: return initial value on any storage error
      return initialValue;
    }
  });

  /**
   * Updates both React state and localStorage with new value
   * 
   * Provides flexible value updating supporting both direct values and
   * functional updates. Automatically handles JSON serialization and
   * localStorage persistence with comprehensive error handling.
   * 
   * @param value - New value or function that returns new value based on current state
   */
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Support both direct values and functional state updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update React state for immediate UI reactivity
      setStoredValue(valueToStore);
      
      // Persist to localStorage for cross-session data retention
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      // Note: React state is still updated even if localStorage fails
      // This ensures UI consistency while logging storage issues
    }
  };

  // Return state and setter as immutable tuple for consistent hook interface
  return [storedValue, setValue] as const;
}
