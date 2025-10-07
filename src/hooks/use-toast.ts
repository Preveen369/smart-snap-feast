/**
 * useToast - Advanced toast notification system for Smart Snap Feast
 * 
 * Provides comprehensive toast notification management with React state integration,
 * automatic lifecycle handling, and flexible customization options. Implements
 * reducer pattern for predictable state management and supports multiple toast
 * types with configurable display duration and user interaction handling.
 * 
 * @module ToastSystem
 */

import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

/**
 * Maximum number of toasts to display simultaneously
 * Prevents UI overflow and maintains clean notification experience
 */
const TOAST_LIMIT = 1;

/**
 * Delay before automatically removing dismissed toasts from DOM
 * Extended duration allows for smooth exit animations and user interaction
 */
const TOAST_REMOVE_DELAY = 1000000;

/**
 * Enhanced toast interface with Smart Snap Feast specific properties
 * 
 * @interface ToasterToast
 * @extends ToastProps - Base toast properties from UI component
 * @property id - Unique identifier for toast tracking and state management
 * @property title - Optional toast header for prominent messaging
 * @property description - Optional detailed content for comprehensive notifications
 * @property action - Optional interactive element for user engagement
 */
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

/**
 * Action type constants for reducer pattern implementation
 * Ensures type safety and predictable state transitions
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// Global counter for unique toast ID generation
let count = 0;

/**
 * Generates unique toast identifiers with overflow protection
 * 
 * Implements safe counter increment with automatic rollover to prevent
 * memory issues during extended application usage.
 * 
 * @returns Unique string identifier for toast instances
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

/**
 * Discriminated union for toast reducer actions
 * 
 * Provides type-safe action definitions for all toast state mutations
 * with specific payload structures for each operation type.
 */
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

/**
 * Toast system state interface for reducer pattern
 * 
 * @interface State
 * @property toasts - Array of active toast instances with metadata
 */
interface State {
  toasts: ToasterToast[];
}

/**
 * Timeout tracking for automatic toast removal
 * Maps toast IDs to timeout handles for cleanup management
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedules toast removal with automatic cleanup
 * 
 * Implements deferred removal system to allow for smooth animations
 * and prevents duplicate timeout registration for the same toast.
 * 
 * @param toastId - Unique identifier of toast to schedule for removal
 */
const addToRemoveQueue = (toastId: string) => {
  // Prevent duplicate timeout registration for same toast
  if (toastTimeouts.has(toastId)) {
    return;
  }

  // Schedule automatic removal after configured delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Toast state reducer implementing predictable state management
 * 
 * Handles all toast state mutations through action dispatch pattern,
 * ensuring consistent behavior and enabling time-travel debugging.
 * Implements toast limit enforcement and automatic lifecycle management.
 * 
 * @param state - Current toast system state
 * @param action - State mutation action with payload
 * @returns Updated state after action processing
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Enforce toast limit by keeping only most recent toasts
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      // Update specific toast while preserving others
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Schedule removal for specific toast or all toasts
      // Note: Side effect intentionally kept inline for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Mark toasts as closed to trigger exit animations
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      // Remove specific toast or clear all toasts
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

/**
 * Global state change listeners for React integration
 * Enables multiple components to subscribe to toast state changes
 */
const listeners: Array<(state: State) => void> = [];

/**
 * In-memory state storage for toast system
 * Persists toast state across component re-renders and unmounts
 */
let memoryState: State = { toasts: [] };

/**
 * Dispatches actions to toast reducer and notifies subscribers
 * 
 * Central dispatch function that processes all state mutations
 * and propagates changes to subscribed React components.
 * 
 * @param action - State mutation action to process
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Toast configuration interface for external API
 * Omits internal ID field that's automatically generated
 */
type Toast = Omit<ToasterToast, "id">;

/**
 * Creates and displays a new toast notification
 * 
 * Primary API function for displaying toast messages with automatic
 * ID generation, lifecycle management, and interaction handling.
 * Returns control object for programmatic toast manipulation.
 * 
 * @param props - Toast configuration options and content
 * @returns Object containing toast ID and control functions
 */
function toast({ ...props }: Toast) {
  const id = genId();

  // Create update function bound to specific toast ID
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  
  // Create dismiss function for programmatic toast removal
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // Add toast to state with automatic lifecycle integration
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * React hook for toast system integration
 * 
 * Provides React components with access to toast state and control functions.
 * Automatically manages subscription lifecycle and provides reactive updates
 * when toast state changes occur.
 * 
 * @returns Object containing current toast state and control functions
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  // Subscribe to global toast state changes with automatic cleanup
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
