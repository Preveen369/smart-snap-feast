/**
 * ChatbotService - Chatbase AI integration service for Smart Snap Feast
 * 
 * Provides seamless integration with Chatbase AI chatbot functionality.
 * Implements singleton pattern for application-wide chatbot management,
 * dynamic script loading, and robust initialization handling with error recovery.
 * Converts JavaScript embed code to TypeScript with enhanced type safety.
 * 
 * @class ChatbotService
 */

/**
 * Type definition for Chatbase function interface
 * Extends base function with optional queue property for command buffering
 * 
 * @interface ChatbaseFunction
 */
interface ChatbaseFunction {
  (...args: any[]): any;
  q?: any[];
}

/**
 * Global window interface extension for Chatbase integration
 * Ensures type safety when accessing chatbase instance on window object
 */
declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
  }
}

class ChatbotService {
  // Singleton instance for application-wide chatbot management
  private static instance: ChatbotService;
  
  // Service state tracking for initialization flow control
  private isInitialized = false;
  private isLoading = false;

  /**
   * Private constructor implementing singleton pattern
   * Prevents direct instantiation, ensuring single chatbot service instance
   * 
   * @private
   */
  private constructor() {}

  /**
   * Retrieves singleton instance of ChatbotService
   * 
   * Implements lazy initialization pattern for efficient resource management.
   * Ensures only one chatbot service instance exists throughout application lifecycle.
   * 
   * @returns ChatbotService singleton instance
   * @static
   */
  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  /**
   * Initializes Chatbase AI chatbot with dynamic script loading
   * 
   * Orchestrates the complete chatbot initialization process including:
   * - Prevention of duplicate initialization attempts
   * - Dynamic Chatbase function setup with command queuing
   * - Proxy implementation for enhanced function interception
   * - Asynchronous script loading with error handling
   * - State management for initialization tracking
   * 
   * @returns Promise that resolves when initialization is complete
   * @throws Error if script loading or initialization fails
   */
  public async initialize(): Promise<void> {
    // Prevent concurrent initialization attempts for reliable service state
    if (this.isInitialized || this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // Setup Chatbase function with command queuing if not already initialized
      if (!window.chatbase || (typeof window.chatbase === 'function' && window.chatbase("getState") !== "initialized")) {
        // Create command queuing function for pre-initialization command buffering
        window.chatbase = (...args: any[]) => {
          if (!window.chatbase!.q) {
            window.chatbase!.q = [];
          }
          window.chatbase!.q!.push(args);
        };

        // Implement proxy pattern for enhanced function call interception and method routing
        window.chatbase = new Proxy(window.chatbase, {
          get(target, prop) {
            if (prop === "q") {
              return target.q;
            }
            // Route method calls through the target function with proper context
            return (...args: any[]) => target(prop as string, ...args);
          }
        });
      }

      // Load external Chatbase script with error handling and state tracking
      await this.loadChatbaseScript();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
    } finally {
      // Ensure loading state is cleared regardless of success or failure
      this.isLoading = false;
    }
  }

  /**
   * Dynamically loads Chatbase script with duplicate prevention
   * 
   * Implements safe script loading with duplicate detection, proper DOM manipulation,
   * and promise-based completion tracking. Handles both success and error scenarios
   * for robust chatbot integration.
   * 
   * @returns Promise that resolves when script loading completes successfully
   * @throws Error if script fails to load from CDN
   * @private
   */
  private loadChatbaseScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prevent duplicate script loading by checking for existing script element
      if (document.getElementById("O6G41wBMqv9-b0OGX5aay")) {
        resolve();
        return;
      }

      // Create and configure script element for Chatbase CDN integration
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "O6G41wBMqv9-b0OGX5aay";
      script.setAttribute("domain", "www.chatbase.co");
      
      // Setup event handlers for load completion and error scenarios
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load chatbase script'));
      
      // Inject script into DOM to trigger loading process
      document.body.appendChild(script);
    });
  }

  /**
   * Retrieves current Chatbase service initialization state
   * 
   * Safely queries the Chatbase instance for its current operational state
   * with error handling for scenarios where chatbase is not yet available.
   * 
   * @returns Current state string or undefined if unavailable
   */
  public getState(): string | undefined {
    try {
      return window.chatbase?.("getState") as string;
    } catch {
      // Graceful degradation when chatbase is not available or throws errors
      return undefined;
    }
  }

  /**
   * Checks if chatbot service is fully ready for user interaction
   * 
   * Validates both internal service initialization and external Chatbase
   * service readiness to ensure complete functionality before user engagement.
   * 
   * @returns true if chatbot is fully initialized and ready for use
   */
  public isReady(): boolean {
    return this.isInitialized && this.getState() === "initialized";
  }
}

// Export singleton instance for application-wide chatbot service access
export default ChatbotService;