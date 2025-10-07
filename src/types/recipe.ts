/**
 * Core type definitions for Smart Snap Feast recipe management system
 * 
 * Provides comprehensive TypeScript interfaces for ingredient tracking,
 * recipe data modeling, and filtering mechanisms. Ensures type safety
 * across the entire application while supporting AI-powered recipe
 * generation and user interaction features.
 * 
 * @module RecipeTypes
 */

/**
 * Ingredient data model for pantry management and recipe composition
 * 
 * Represents individual ingredients with quantity tracking, metadata,
 * and temporal information for inventory management and recipe generation.
 * 
 * @interface Ingredient
 * @property id - Unique identifier for ingredient tracking and state management
 * @property name - Human-readable ingredient name for display and AI processing
 * @property quantity - Optional amount specification for recipe calculations
 * @property unit - Optional measurement unit for cooking precision
 * @property addedAt - Timestamp for inventory tracking and freshness management
 */
export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  addedAt: number;
}

/**
 * Comprehensive recipe data model for culinary content management
 * 
 * Encapsulates complete recipe information including metadata, ingredients,
 * cooking instructions, and AI-generated enhancements. Designed for
 * optimal user experience and integration with AI cooking assistance.
 * 
 * @interface Recipe
 * @property id - Unique recipe identifier for database operations and UI state
 * @property title - Recipe name optimized for search and display
 * @property description - Optional marketing description for user engagement
 * @property image - Optional visual representation (URL or base64 data)
 * @property cookTime - Total cooking time in minutes for planning
 * @property difficulty - Skill level requirement for cooking complexity assessment
 * @property servings - Number of portions for ingredient scaling calculations
 * @property ingredients - Structured ingredient list with precise measurements
 * @property instructions - Step-by-step cooking directions for user guidance
 * @property dietaryTags - Classification tags for dietary filtering and preferences
 * @property createdAt - Creation timestamp for sorting and management
 */
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  dietaryTags: string[];
  createdAt: number;
}

/**
 * Dietary preference filter types for recipe discovery and personalization
 * 
 * Enables users to filter recipes based on dietary restrictions and preferences.
 * Supports inclusive filtering with 'all' option for unrestricted browsing.
 * 
 * @type DietaryFilter
 */
export type DietaryFilter = 'all' | 'vegetarian' | 'vegan' | 'gluten-free' | 'Dairy Food';

/**
 * Cooking complexity filter types for skill-based recipe selection
 * 
 * Allows filtering recipes by cooking difficulty to match user skill levels
 * and available time commitments. Includes 'all' for comprehensive viewing.
 * 
 * @type DifficultyFilter
 */
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
