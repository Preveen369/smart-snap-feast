/// <reference types="vite/client" />

// Chatbase AI Chatbot global declarations
interface ChatbaseFunction {
  (...args: any[]): any;
  q?: any[];
}

declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
  }
}
