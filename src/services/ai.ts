/**
 * Main AI service that orchestrates all AI providers
 */

import { openaiService } from './openai';
import { geminiService } from './gemini';
import { Recipe, Ingredient } from '@/types/recipe';

export interface AIServiceOptions {
  preferredProvider?: 'openai' | 'spoonacular' | 'auto';
  includeNutrition?: boolean;
  maxRecipes?: number;
}

export class AIService {
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

    if (ingredientNames.length === 0) {
      throw new Error('Please add some ingredients to generate a recipe.');
    }

    try {
      console.log('🚀 Starting recipe generation process...', {
        ingredientCount: ingredientNames.length,
        ingredients: ingredientNames,
        options
      });
      
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

      if (!openaiRecipe || !openaiRecipe.title) {
        throw new Error('🤖 ChatGPT generated an incomplete recipe. Please try again.');
      }

      const formattedRecipe = this.formatRecipe(openaiRecipe, 'chatgpt');
      console.log('✅ Recipe formatted and ready:', formattedRecipe.title);
      
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
      
      // Website-friendly error messages
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        // Pass through already formatted emoji errors
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
      
      // Pass through the original error with context for debugging
      throw new Error(`Recipe generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }



  async generateRecipeImage(recipeTitle: string, ingredients: string[], description?: string): Promise<string> {
    try {
      console.log('🎨 Generating custom image for recipe:', recipeTitle);
      
      if (geminiService.isConfigured()) {
        const imageUrl = await geminiService.generateRecipeImage(recipeTitle, ingredients, description);
        return imageUrl;
      } else {
        console.warn('⚠️ Gemini not configured, using fallback image');
        return this.getFallbackImageUrl(recipeTitle, ingredients);
      }
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      return this.getFallbackImageUrl(recipeTitle, ingredients);
    }
  }

  async getRecipeEnhancements(recipe: Recipe): Promise<{
    cookingTips?: string[];
    customImage?: string;
  }> {
    const enhancements: any = {};

    try {
      // Get cooking tips from OpenAI and generate custom image
      const ingredientNames = recipe.ingredients.map(ing => ing.name);
      const [cookingTips, customImage] = await Promise.all([
        openaiService.generateCookingTips(ingredientNames).catch(error => {
          console.warn('Failed to get cooking tips:', error);
          return [];
        }),
        this.generateRecipeImage(recipe.title, ingredientNames, recipe.description).catch(error => {
          console.warn('Failed to generate custom image:', error);
          return null;
        })
      ]);

      enhancements.cookingTips = cookingTips;
      if (customImage) {
        enhancements.customImage = customImage;
      }
    } catch (error) {
      console.warn('Failed to get recipe enhancements:', error);
    }

    return enhancements;
  }

  private getFallbackImageUrl(title: string, ingredients: string[]): string {
    // Enhanced fallback image selection based on recipe content
    const dishType = this.detectDishType(title, ingredients);
    return `https://images.unsplash.com/photo-${this.getFoodPhotoId(dishType)}?w=800&h=600&fit=crop&auto=format&q=80`;
  }

  private detectDishType(title: string, ingredients: string[]): string {
    const titleLower = title.toLowerCase();
    const allText = (title + ' ' + ingredients.join(' ')).toLowerCase();

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

  private getFoodPhotoId(dishType: string): string {
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



  private formatRecipe(recipeData: any, source: string): Recipe {
    // Enhanced validation for website display
    if (!recipeData.title) {
      throw new Error('📝 Recipe missing title - please try generating again.');
    }
    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      throw new Error('🥕 Recipe missing ingredients - please try generating again.');
    }
    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      throw new Error('📋 Recipe missing instructions - please try generating again.');
    }

    // Format ingredients for website display
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

    // Format instructions for website display
    const formattedInstructions = recipeData.instructions.map((instruction: string, index: number) => {
      // Ensure each instruction is properly formatted
      const cleanInstruction = instruction.replace(/^Step \d+:?\s*/i, '').trim();
      return `Step ${index + 1}: ${cleanInstruction}`;
    });

    // Get ingredient names for image generation
    const ingredientNames = formattedIngredients.map(ing => ing.name);
    
    return {
      id: recipeData.id || `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: recipeData.title.trim(),
      description: recipeData.description || 'A delicious ChatGPT-generated recipe perfect for your kitchen.',
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

  private validateCookTime(cookTime: any): number {
    const time = parseInt(String(cookTime));
    return isNaN(time) || time < 1 ? 30 : Math.min(time, 480); // Max 8 hours
  }

  private validateDifficulty(difficulty: any): 'easy' | 'medium' | 'hard' {
    const validDifficulties = ['easy', 'medium', 'hard'] as const;
    const normalized = String(difficulty).toLowerCase();
    return validDifficulties.includes(normalized as any) ? normalized as any : 'medium';
  }

  private validateServings(servings: any): number {
    const count = parseInt(String(servings));
    return isNaN(count) || count < 1 ? 4 : Math.min(count, 20); // Max 20 servings
  }

}

export const aiService = new AIService();

// Export individual services for direct access if needed
export { openaiService, geminiService };