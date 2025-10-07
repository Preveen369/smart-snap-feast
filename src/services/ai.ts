/**
 * AIService - Central orchestration layer for AI-powered recipe generation
 * 
 * Coordinates multiple AI providers (OpenAI, Gemini) to deliver comprehensive
 * recipe generation capabilities including content creation, image generation,
 * cooking tips, and recipe enhancements. Provides fallback mechanisms and
 * robust error handling for production reliability.
 * 
 * @class AIService
 */

import { openaiService } from './openai';
import { geminiService } from './gemini';
import { Recipe, Ingredient } from '@/types/recipe';

/**
 * Configuration options for AI service operations
 * 
 * @interface AIServiceOptions
 * @property preferredProvider - AI provider preference for recipe generation
 * @property includeNutrition - Whether to include nutritional analysis
 * @property maxRecipes - Maximum number of recipes to generate
 */
export interface AIServiceOptions {
  preferredProvider?: 'openai' | 'spoonacular' | 'auto';
  includeNutrition?: boolean;
  maxRecipes?: number;
}

export class AIService {
  /**
   * Generates a complete recipe with AI-powered content and image
   * 
   * Orchestrates the full recipe generation pipeline including content creation
   * via OpenAI, image generation via Gemini, and comprehensive error handling.
   * Provides detailed logging and user-friendly error messages for web interface.
   * 
   * @param ingredients - Array of ingredient objects to base recipe on
   * @param options - Recipe generation preferences and constraints
   * @returns Promise resolving to complete Recipe object with all metadata
   * @throws Error with user-friendly messages for various failure scenarios
   */
  async generateRecipe(
    ingredients: Ingredient[],
    options: {
      dietaryRestrictions?: string[];
      maxTime?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      servings?: number;
    } = {}
  ): Promise<Recipe> {
    const ingredientNames = ingredients.map(ing => ing.name);

    // Validate input requirements before processing
    if (ingredientNames.length === 0) {
      throw new Error('Please add some ingredients to generate a recipe.');
    }

    try {
      console.log('🚀 Starting recipe generation process...', {
        ingredientCount: ingredientNames.length,
        ingredients: ingredientNames,
        options
      });
      
      // Primary recipe generation via OpenAI service
      const openaiRecipe = await openaiService.generateRecipe({
        ingredients: ingredientNames,
        dietaryRestrictions: options.dietaryRestrictions,
        maxTime: options.maxTime,
        difficulty: options.difficulty,
        servings: options.servings,
      });

      console.log('📄 OpenAI recipe received:', {
        hasTitle: !!openaiRecipe?.title,
        hasIngredients: !!openaiRecipe?.ingredients,
        hasInstructions: !!openaiRecipe?.instructions,
        title: openaiRecipe?.title
      });

      // Validate recipe completeness before proceeding
      if (!openaiRecipe || !openaiRecipe.title) {
        throw new Error('🤖 ChatGPT generated an incomplete recipe. Please try again.');
      }

      const formattedRecipe = this.formatRecipe(openaiRecipe, 'chatgpt');
      console.log('✅ Recipe formatted and ready:', formattedRecipe.title);
      
      // Enhance recipe with AI-generated image via Gemini
      try {
        const ingredientNames = ingredients.map(ing => ing.name);
        console.log('🎨 Generating Gemini image for recipe...');
        const geminiImage = await this.generateRecipeImage(formattedRecipe.title, ingredientNames);
        formattedRecipe.image = geminiImage;
        console.log('✅ Gemini image generated and attached to recipe');
      } catch (error) {
        console.warn('⚠️ Gemini image generation failed, keeping fallback image:', error);
        // Recipe retains fallback image from formatRecipe method for graceful degradation
      }
      
      return formattedRecipe;
    } catch (error) {
      console.error('❌ ChatGPT recipe generation failed:', error);
      console.error('📊 Detailed error info:', {
        errorType: typeof error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined,
        ingredientCount: ingredientNames.length,
        ingredients: ingredientNames,
        options
      });
      
      // Transform technical errors into user-friendly web interface messages
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        // Pass through pre-formatted emoji error messages
        if (error.message.includes('API key not configured') || msg.includes('not configured')) {
          throw new Error('🔑 ChatGPT API not configured. Please add your OpenAI API key to the .env file.');
        }
        if (msg.includes('429') || msg.includes('rate limit')) {
          throw new Error('⏳ Too many requests to ChatGPT. Please wait 30 seconds and try again.');
        }
        if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid') && msg.includes('key')) {
          throw new Error('🔐 Invalid ChatGPT API key. Please check your VITE_OPENAI_API_KEY in .env file.');
        }
        if (msg.includes('network') || msg.includes('fetch') || msg.includes('cors') || msg.includes('blocked')) {
          throw new Error('🌐 Connection error. Please check your internet and try again.');
        }
        if (msg.includes('empty') || msg.includes('incomplete')) {
          throw new Error('🤖 ChatGPT returned incomplete response. Please try again.');
        }
      }
      
      // Preserve original error context for debugging while providing user context
      throw new Error(`Recipe generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates AI-powered recipe images using Gemini with fallback handling
   * 
   * Creates visually appealing recipe images based on recipe content and ingredients.
   * Implements graceful degradation with curated fallback images when AI generation fails.
   * 
   * @param recipeTitle - Title of the recipe for image context
   * @param ingredients - Array of ingredient names for visual reference
   * @param description - Optional recipe description for additional context
   * @returns Promise resolving to image URL (either generated or fallback)
   */
  async generateRecipeImage(recipeTitle: string, ingredients: string[], description?: string): Promise<string> {
    try {
      console.log('🎨 Generating Gemini AI image for recipe:', recipeTitle);
      return await geminiService.generateRecipeImage(recipeTitle, ingredients);
    } catch (error) {
      console.warn('🖼️ Gemini image generation failed, using fallback:', error);
      return this.getFallbackImageUrl(recipeTitle, ingredients);
    }
  }

  /**
   * Generates recipe with non-blocking image generation for optimal UX
   * 
   * Prioritizes fast recipe delivery by generating content first, then enhancing
   * with AI images asynchronously. Provides callback mechanism for progressive
   * image loading without blocking the user interface.
   * 
   * @param ingredients - Array of ingredient objects for recipe generation
   * @param options - Generation preferences with optional image callback
   * @returns Promise resolving to Recipe with immediate fallback image
   */
  async generateRecipeWithAsyncImage(
    ingredients: Ingredient[],
    options: {
      dietaryRestrictions?: string[];
      maxTime?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      servings?: number;
      onImageGenerated?: (recipeId: string, imageUrl: string) => void;
    } = {}
  ): Promise<Recipe> {
    const ingredientNames = ingredients.map(ing => ing.name);

    // Priority: Generate recipe content immediately for responsive UX
    const recipe = await this.generateRecipe(ingredients, {
      dietaryRestrictions: options.dietaryRestrictions,
      maxTime: options.maxTime,
      difficulty: options.difficulty,
      servings: options.servings,
    });

    // Enhancement: Generate AI image asynchronously without blocking UI
    if (options.onImageGenerated) {
      // Execute Gemini image generation in background for progressive enhancement
      setTimeout(async () => {
        try {
          console.log('🎨 Starting async Gemini image generation...');
          const geminiImage = await this.generateRecipeImage(recipe.title, ingredientNames);
          console.log('✅ Async Gemini image generated successfully');
          options.onImageGenerated!(recipe.id, geminiImage);
        } catch (error) {
          console.warn('⚠️ Async Gemini image generation failed, keeping fallback:', error);
          // Maintain existing fallback image for consistent user experience
          options.onImageGenerated!(recipe.id, recipe.image);
        }
      }, 100);
    }

    return recipe;
  }

  /**
   * Generates comprehensive recipe enhancements and personalized content
   * 
   * Provides additional AI-powered features including dynamic cooking tips,
   * custom imagery, and personalized guidance based on recipe complexity
   * and ingredient combinations.
   * 
   * @param recipe - Base recipe object to enhance
   * @returns Promise resolving to enhancement object with tips and custom content
   */
  async getRecipeEnhancements(recipe: Recipe): Promise<{
    cookingTips?: any;
    customImage?: string;
  }> {
    const enhancements: any = {};

    try {
      // Generate intelligent cooking tips based on recipe-specific context
      const ingredientNames = recipe.ingredients.map(ing => ing.name);
      const cookingTips = await openaiService.generateDynamicCookingTips(recipe.title, ingredientNames).catch(error => {
        console.warn('Failed to get dynamic cooking tips, falling back to basic tips:', error);
        // Graceful degradation: Use basic tips when dynamic generation fails
        return openaiService.generateCookingTips(ingredientNames);
      });

      enhancements.cookingTips = cookingTips;
    } catch (error) {
      console.warn('Failed to get recipe enhancements:', error);
    }

    return enhancements;
  }

  /**
   * Provides intelligent fallback images based on recipe content analysis
   * 
   * Uses content analysis to select appropriate food photography from curated
   * image collections when AI image generation is unavailable. Ensures
   * consistent visual quality across all recipe presentations.
   * 
   * @param title - Recipe title for content analysis
   * @param ingredients - Ingredient list for dish type detection
   * @returns High-quality fallback image URL from curated collection
   * @private
   */
  private getFallbackImageUrl(title: string, ingredients: string[]): string {
    // Intelligent dish type detection for appropriate fallback selection
    const dishType = this.detectDishType(title, ingredients);
    return `https://images.unsplash.com/photo-${this.getFoodPhotoId(dishType)}?w=800&h=600&fit=crop&auto=format&q=80`;
  }

  /**
   * Analyzes recipe content to determine dish type for appropriate imagery
   * 
   * Performs intelligent text analysis on recipe titles and ingredients
   * to categorize dishes for optimal fallback image selection.
   * 
   * @param title - Recipe title for primary analysis
   * @param ingredients - Ingredient array for contextual analysis
   * @returns Dish type category string for image selection
   * @private
   */
  private detectDishType(title: string, ingredients: string[]): string {
    const titleLower = title.toLowerCase();
    const allText = (title + ' ' + ingredients.join(' ')).toLowerCase();

    // Intelligent pattern matching for accurate dish categorization
    if (titleLower.includes('pasta') || allText.includes('spaghetti') || allText.includes('linguine')) return 'pasta';
    if (titleLower.includes('salad') || allText.includes('lettuce') || allText.includes('greens')) return 'salad';
    if (titleLower.includes('soup') || allText.includes('broth') || allText.includes('stock')) return 'soup';
    if (titleLower.includes('curry') || allText.includes('spice') || allText.includes('coconut milk')) return 'curry';
    if (titleLower.includes('stir') || titleLower.includes('fry') || allText.includes('wok')) return 'stirfry';
    if (titleLower.includes('pizza') || allText.includes('cheese') && allText.includes('tomato')) return 'pizza';
    if (titleLower.includes('sandwich') || titleLower.includes('burger')) return 'sandwich';
    if (titleLower.includes('rice') || allText.includes('grain')) return 'rice';
    
    return 'general';
  }

  /**
   * Maps dish types to curated, high-quality food photography IDs
   * 
   * Maintains a collection of professional food photography identifiers
   * for consistent, appetizing visual presentation across all recipe types.
   * 
   * @param dishType - Categorized dish type for image selection
   * @returns Unsplash photo ID for the corresponding dish category
   * @private
   */
  private getFoodPhotoId(dishType: string): string {
    // Curated collection of professional food photography for optimal presentation
    const photoIds = {
      pasta: '1565299624946-b28f40a0ca4b',
      salad: '1567620905732-2d1ec7ab7445', 
      soup: '1571091718767-18b5b1457add',
      curry: '1565958011703-00e2c35b4c8f',
      stirfry: '1551963831-b3b1765a2bc0',
      pizza: '1556909114-37aa89dec418',
      sandwich: '1504674900247-0877df9cc836',
      rice: '1546069901-ba9599a7e63c',
      general: '1555939594-58d7cb561ad1'
    };

    return photoIds[dishType as keyof typeof photoIds] || photoIds.general;
  }

  /**
   * Formats and validates raw AI recipe data for web application consumption
   * 
   * Transforms AI-generated recipe data into standardized Recipe objects with
   * comprehensive validation, error handling, and web-optimized formatting.
   * Ensures data integrity and user-friendly presentation across the application.
   * 
   * @param recipeData - Raw recipe data from AI service
   * @param source - AI provider identifier for tracking and debugging
   * @returns Fully formatted and validated Recipe object
   * @throws Error with specific validation messages for missing required data
   * @private
   */
  private formatRecipe(recipeData: any, source: string): Recipe {
    // Comprehensive validation for reliable web application display
    if (!recipeData.title) {
      throw new Error('📝 Recipe missing title - please try generating again.');
    }
    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      throw new Error('🥕 Recipe missing ingredients - please try generating again.');
    }
    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      throw new Error('📋 Recipe missing instructions - please try generating again.');
    }

    // Transform ingredients into consistent format for UI components
    const formattedIngredients = recipeData.ingredients.map((ing: any) => {
      if (typeof ing === 'string') {
        return { name: ing, quantity: '1', unit: 'piece' };
      }
      return {
        name: ing.name || 'Unknown ingredient',
        quantity: ing.quantity || '1',
        unit: ing.unit || 'piece'
      };
    });

    // Format instructions with consistent step numbering for cooking interface
    const formattedInstructions = recipeData.instructions.map((instruction: string, index: number) => {
      // Clean and standardize instruction formatting for readability
      const cleanInstruction = instruction.replace(/^Step \d+:?\s*/i, '').trim();
      return `Step ${index + 1}: ${cleanInstruction}`;
    });

    // Extract ingredient names for image generation context
    const ingredientNames = formattedIngredients.map(ing => ing.name);
    
    return {
      id: recipeData.id || `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: recipeData.title.trim(),
      description: recipeData.description || 'A delicious AI-generated recipe perfect for your kitchen.',
      image: recipeData.image || this.getFallbackImageUrl(recipeData.title, ingredientNames),
      cookTime: this.validateCookTime(recipeData.cookTime),
      difficulty: this.validateDifficulty(recipeData.difficulty),
      servings: this.validateServings(recipeData.servings),
      ingredients: formattedIngredients,
      instructions: formattedInstructions,
      dietaryTags: Array.isArray(recipeData.dietaryTags) ? recipeData.dietaryTags : ['general'],
      createdAt: Date.now(),
    };
  }

  /**
   * Validates and normalizes cooking time values for UI consistency
   * 
   * @param cookTime - Raw cooking time value from AI service
   * @returns Validated cooking time in minutes (1-480 range)
   * @private
   */
  private validateCookTime(cookTime: any): number {
    const time = parseInt(String(cookTime));
    return isNaN(time) || time < 1 ? 30 : Math.min(time, 480); // Reasonable range: 1 minute to 8 hours
  }

  /**
   * Validates and normalizes difficulty level for consistent UI display
   * 
   * @param difficulty - Raw difficulty value from AI service
   * @returns Validated difficulty level from defined enum
   * @private
   */
  private validateDifficulty(difficulty: any): 'easy' | 'medium' | 'hard' {
    const validDifficulties = ['easy', 'medium', 'hard'] as const;
    const normalized = String(difficulty).toLowerCase();
    return validDifficulties.includes(normalized as any) ? normalized as any : 'medium';
  }

  /**
   * Validates and normalizes serving count for practical cooking portions
   * 
   * @param servings - Raw serving count from AI service
   * @returns Validated serving count (1-20 range)
   * @private
   */
  private validateServings(servings: any): number {
    const count = parseInt(String(servings));
    return isNaN(count) || count < 1 ? 4 : Math.min(count, 20); // Practical range: 1-20 servings
  }
}

// Export singleton instance for application-wide AI service access
export const aiService = new AIService();

// Export individual AI service providers for specialized direct access when needed
export { openaiService, geminiService };