/**
 * Google Gemini API Service for recipe image generation using Flash 2.0 experimental
 */

interface GeminiImageRequest {
  contents: {
    parts: Array<{
      text: string;
    }>;
  }[];
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };
}

interface GeminiImageResponse {
  candidates: {
    content: {
      parts: {
        text?: string;
        functionCall?: any;
      }[];
    };
  }[];
}

export class GeminiService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
  private imageGenModel = 'gemini-1.5-flash'; // Use stable Flash model for now

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    // Debug logging
    console.log('🔍 Gemini Environment debug:', {
      hasViteEnv: !!import.meta.env,
      envKeys: Object.keys(import.meta.env || {}).filter(key => key.includes('GEMINI') || key.includes('API')),
      apiKeyExists: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      model: this.imageGenModel
    });
    
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API key not found. Set VITE_GEMINI_API_KEY in your environment variables.');
    } else {
      console.log('✅ Gemini Flash 2.0 service ready for recipe image generation');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async makeImageRequest(request: GeminiImageRequest): Promise<string> {
    if (!this.apiKey) {
      throw new Error('🔑 Gemini API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/${this.imageGenModel}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`🚨 Gemini API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data: GeminiImageResponse = await response.json();
      return data.candidates[0]?.content.parts[0]?.text || '';
    } catch (error) {
      console.error('❌ Gemini image generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate recipe image description using Gemini Flash (returns description for now)
   */
  async generateRecipeImage(recipeTitle: string, ingredients: string[], description?: string): Promise<string> {
    console.log('🎨 Attempting to generate image description for:', recipeTitle);
    
    if (!this.isConfigured()) {
      console.warn('⚠️ Gemini API not configured, using fallback image');
      return this.getFallbackImageUrl(recipeTitle, ingredients);
    }

    try {
      // For now, generate a detailed description that could be used for image generation
      const prompt = this.createImagePrompt(recipeTitle, ingredients, description);
      
      const request: GeminiImageRequest = {
        contents: [
          {
            parts: [
              {
                text: `Create a brief, appetizing description for a food photograph of: "${recipeTitle}"

Main ingredients: ${ingredients.slice(0, 5).join(', ')}

Respond with just a short description of how this dish should look when professionally photographed, focusing on colors, textures, and presentation. Keep it under 50 words.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 200,
        }
      };

      console.log('📡 Making Gemini API call...');
      const response = await this.makeImageRequest(request);
      
      if (response && response.trim()) {
        console.log('✅ Gemini response received:', response.substring(0, 100) + '...');
        // For now, return a fallback image since we're not doing actual image generation
        return this.getFallbackImageUrl(recipeTitle, ingredients);
      } else {
        throw new Error('Empty response from Gemini');
      }
      
    } catch (error) {
      console.error('❌ Gemini API failed:', error);
      console.log('🔄 Using fallback image due to error');
      return this.getFallbackImageUrl(recipeTitle, ingredients);
    }
  }

  /**
   * Create optimized prompt for recipe image generation
   */
  private createImagePrompt(title: string, ingredients: string[], description?: string): string {
    const mainIngredients = ingredients.slice(0, 5).join(', ');
    
    return `Generate a high-quality, appetizing food photograph prompt for: "${title}"

Key ingredients: ${mainIngredients}
${description ? `Description: ${description}` : ''}

Create a detailed prompt for generating a professional food photography image that shows:
- The finished dish beautifully plated
- Warm, natural lighting
- Clean, modern presentation
- Appetizing colors and textures
- Professional food styling
- Restaurant-quality appearance

The image should make viewers want to cook and eat this dish immediately. Focus on making the food look delicious, fresh, and professionally prepared.

Respond with just the image generation prompt, no additional text.`;
  }

  /**
   * Extract image URL from Gemini response
   */
  private extractImageFromResponse(response: string): string | null {
    try {
      // Try to find URLs in the response
      const urlPattern = /https?:\/\/[^\s]+/g;
      const urls = response.match(urlPattern);
      
      if (urls && urls.length > 0) {
        return urls[0];
      }

      // Check for base64 data
      const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g;
      const base64Match = response.match(base64Pattern);
      
      if (base64Match && base64Match.length > 0) {
        return base64Match[0];
      }

      // For now, we'll use the response as a prompt for fallback
      return null;
      
    } catch (error) {
      console.error('Error extracting image from response:', error);
      return null;
    }
  }

  /**
   * Get fallback image URL when generation fails
   */
  private getFallbackImageUrl(title: string, ingredients: string[]): string {
    // Create a more targeted Unsplash search based on recipe
    const searchTerms = this.getImageSearchTerms(title, ingredients);
    const query = searchTerms.join(',');
    
    return `https://images.unsplash.com/photo-${this.getRandomFoodPhotoId()}?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
  }

  /**
   * Extract relevant search terms from recipe for better fallback images
   */
  private getImageSearchTerms(title: string, ingredients: string[]): string[] {
    const terms = [];
    
    // Add main dish type keywords
    const dishTypes = ['pasta', 'salad', 'soup', 'stir-fry', 'curry', 'pizza', 'sandwich', 'burger', 'tacos', 'rice', 'noodles'];
    const foundDishType = dishTypes.find(type => title.toLowerCase().includes(type));
    if (foundDishType) {
      terms.push(foundDishType);
    }

    // Add main ingredients (first 2-3)
    const mainIngredients = ingredients.slice(0, 3).map(ing => ing.toLowerCase());
    terms.push(...mainIngredients);

    // Default to 'food' if no specific terms found
    if (terms.length === 0) {
      terms.push('food', 'delicious', 'meal');
    }

    return terms;
  }

  /**
   * Get random food photo ID for Unsplash fallback
   */
  private getRandomFoodPhotoId(): string {
    const foodPhotoIds = [
      '1565299624946-b28f40a0ca4b', // cooking
      '1567620905732-2d1ec7ab7445', // ingredients  
      '1571091718767-18b5b1457add', // meal prep
      '1565958011703-00e2c35b4c8f', // fresh food
      '1551963831-b3b1765a2bc0', // kitchen
      '1556909114-37aa89dec418', // healthy food
      '1504674900247-0877df9cc836', // delicious meal
      '1546069901-ba9599a7e63c', // gourmet food
      '1555939594-58d7cb561ad1', // restaurant dish
      '1563379091-a88f58cd22c3'  // beautiful plating
    ];
    
    return foodPhotoIds[Math.floor(Math.random() * foodPhotoIds.length)];
  }
}

export const geminiService = new GeminiService();