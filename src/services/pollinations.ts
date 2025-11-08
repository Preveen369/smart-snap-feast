/**
 * PollinationsImageService - Advanced AI-powered recipe image generation service
 * 
 * Integrates with Pollinations AI for creating high-quality, contextual
 * food photography based on recipe titles and ingredient combinations. Provides
 * multiple styling options, error handling, and fallback mechanisms for robust
 * image generation in culinary applications.
 * 
 * @class PollinationsImageService
 */

/**
 * Configuration options for Pollinations image generation
 * 
 * @interface PollinationsImageOptions
 * @property style - Visual style preference for generated food photography
 * @property quality - Image quality setting affecting resolution and detail
 * @property format - Output image format for web optimization
 */
export interface PollinationsImageOptions {
  style?: 'food-photography' | 'minimalist' | 'rustic' | 'elegant';
  quality?: 'standard' | 'high';
  format?: 'webp' | 'png' | 'jpg';
}

export class PollinationsImageService {
  // Pollinations AI configuration for image generation
  private baseUrl: string = 'https://pollinations.ai/p/';
  private defaultModel: string = 'flux';
  
  /**
   * Initializes Pollinations AI service
   * 
   * Sets up Pollinations AI client with default configuration.
   * No API key required for Pollinations AI service.
   */
  constructor() {
    // Pollinations AI doesn't require API key - free to use
    console.log('✅ Image generation service initialized with Pollinations AI');
  }

  /**
   * Generates contextual recipe images using Pollinations AI
   * 
   * Creates professional-quality food photography based on recipe context,
   * ingredient composition, and styling preferences. Utilizes advanced AI
   * image generation with comprehensive error handling and response processing.
   * 
   * @param recipeTitle - Recipe name for contextual image generation
   * @param ingredients - Array of ingredient names for visual reference
   * @param options - Styling and quality configuration options
   * @returns Promise resolving to base64 data URL of generated image
   * @throws Error with specific messaging for various failure scenarios
   */
  async generateRecipeImage(
    recipeTitle: string, 
    ingredients: string[], 
    options: PollinationsImageOptions = {}
  ): Promise<string> {
    try {
      console.log('🎨 Generating recipe image with Pollinations AI for:', recipeTitle);
      
      // Create contextually rich prompt for optimal food image generation
      const prompt = this.createImagePrompt(recipeTitle, ingredients, options);
      
      console.log('📝 Using prompt:', prompt);
      
      // Configure image generation parameters
      const width = options.quality === 'high' ? 1024 : 768;
      const height = options.quality === 'high' ? 1024 : 768;
      const seed = Math.floor(Math.random() * 1000000); // Random seed for variety
      const model = this.defaultModel;
      
      // Construct Pollinations AI URL
      const imageUrl = `${this.baseUrl}${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      
      console.log('🔗 Generated image URL:', imageUrl);
      
      // For browser compatibility, return the direct URL instead of trying to fetch and convert
      // This avoids CORS issues with Pollinations AI
      return imageUrl;
      
    } catch (error) {
      console.error('❌ Pollinations AI image generation failed:', error);
      
      // Transform technical errors into user-friendly messages for web interface
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('rate limit') || msg.includes('429')) {
          throw new Error('⏳ Pollinations AI rate limit reached. Please wait and try again.');
        }
        if (msg.includes('network') || msg.includes('fetch')) {
          throw new Error('🌐 Network error connecting to Pollinations AI. Please check your internet connection.');
        }
        if (msg.includes('timeout')) {
          throw new Error('⏱️ Image generation timeout. Please try again.');
        }
      }
      
      // Preserve original error context for debugging while providing user context
      throw new Error(`Pollinations AI image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates comprehensive, style-aware prompts for optimal food photography
   * 
   * Constructs detailed AI prompts incorporating recipe context, ingredient
   * information, and visual styling preferences to generate appetizing,
   * professional-quality food images suitable for culinary applications.
   * 
   * @param recipeTitle - Recipe name for contextual relevance
   * @param ingredients - Ingredient list for visual composition guidance
   * @param options - Styling preferences and quality settings
   * @returns Detailed prompt string optimized for food image generation
   * @private
   */
  private createImagePrompt(
    recipeTitle: string, 
    ingredients: string[], 
    options: PollinationsImageOptions
  ): string {
    const style = options.style || 'food-photography';
    const quality = options.quality || 'high';
    
    // Construct base prompt with recipe context for accurate representation
    const basePrompt = `Create a professional ${style} style image of "${recipeTitle}"`;
    
    // Include key ingredients for visual authenticity and composition guidance
    const ingredientContext = ingredients.length > 0 
      ? ` featuring visible ${ingredients.slice(0, 3).join(', ')}` 
      : '';
    
    // Comprehensive style descriptions for consistent visual aesthetics
    const styleDescriptions = {
      'food-photography': 'with professional lighting, shallow depth of field, and appetizing presentation on a clean white or wooden surface',
      'minimalist': 'with clean, simple composition, neutral colors, and minimal props on a plain background',
      'rustic': 'with warm, natural lighting, wooden textures, and homestyle presentation with rustic tableware',
      'elegant': 'with sophisticated plating, fine dining presentation, and elegant garnishing on premium dinnerware'
    };
    
    // Quality specifications for appropriate resolution and detail levels
    const qualityDescriptor = quality === 'high' 
      ? 'Ultra-high quality, 4K resolution, restaurant-quality presentation' 
      : 'High quality, professional presentation';
    
    return `${basePrompt}${ingredientContext}. ${styleDescriptions[style]}. ${qualityDescriptor}. The dish should look fresh, delicious, and inviting. Avoid any text, logos, or watermarks in the image.`;
  }

  /**
   * Generates multiple stylistic variations of recipe images
   * 
   * Creates diverse visual interpretations of the same recipe using different
   * artistic styles. Provides options for A/B testing, user preference selection,
   * and enhanced visual variety in recipe presentations.
   * 
   * @param recipeTitle - Recipe name for consistent context across variations
   * @param ingredients - Ingredient list for visual consistency
   * @param count - Number of variations to generate (max 3)
   * @returns Promise resolving to array of generated image URLs
   * @throws Error if all variation generation attempts fail
   */
  async generateImageVariations(
    recipeTitle: string,
    ingredients: string[],
    count: number = 3
  ): Promise<string[]> {
    // Predefined style collection for diverse visual interpretations
    const styles: PollinationsImageOptions['style'][] = ['food-photography', 'minimalist', 'elegant'];
    const promises = styles.slice(0, count).map(style => 
      this.generateRecipeImage(recipeTitle, ingredients, { style })
    );
    
    try {
      // Execute parallel generation with error isolation for partial success
      const results = await Promise.allSettled(promises);
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);
    } catch (error) {
      console.error('Failed to generate image variations:', error);
      throw error;
    }
  }

  /**
   * Validates Pollinations AI service availability
   * 
   * Pollinations AI is always available as it's a free service.
   * 
   * @returns true since Pollinations AI doesn't require configuration
   */
  isConfigured(): boolean {
    return true; // Pollinations AI is always available
  }
}

// Export singleton instance for application-wide Pollinations AI image service access
export const pollinationsService = new PollinationsImageService();

// Export with gemini name for backward compatibility
export const geminiService = pollinationsService;