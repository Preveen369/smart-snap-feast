/**
 * OpenAIService - Comprehensive AI-powered culinary content generation service
 * 
 * Integrates with OpenAI's GPT-4 models to provide intelligent recipe generation,
 * personalized cooking tips, and culinary guidance. Features robust error handling,
 * rate limiting, environment-aware configuration, and specialized prompt engineering
 * for high-quality culinary content creation.
 * 
 * @class OpenAIService
 */

/**
 * Message structure for OpenAI Chat Completions API
 * 
 * @interface OpenAIMessage
 * @property role - Message sender role in conversation context
 * @property content - Text content of the message
 */
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Response structure from OpenAI Chat Completions API
 * 
 * @interface OpenAIResponse
 * @property choices - Array of generated response choices
 */
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Configuration options for AI-powered recipe generation
 * 
 * @interface RecipeGenerationOptions
 * @property ingredients - Base ingredients for recipe creation
 * @property dietaryRestrictions - Dietary constraints and preferences
 * @property maxTime - Maximum cooking time in minutes
 * @property difficulty - Recipe complexity level
 * @property servings - Number of portions to serve
 */
interface RecipeGenerationOptions {
  ingredients: string[];
  dietaryRestrictions?: string[];
  maxTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
}

export class OpenAIService {
  // Core service configuration and state management
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';
  private rateLimitDelay = 2000; // Increase to 2 seconds between requests
  private lastRequestTime = 0;

  /**
   * Initializes OpenAI OSS service with help of GROQ API for comprehensive environment validation
   * 
   * Sets up API configuration, validates credentials, and provides detailed
   * debugging information for development and production environments.
   * Implements robust error detection and user-friendly messaging.
   */
  constructor() {
  this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    // Comprehensive environment debugging for development troubleshooting
    console.log('🔍 OpenAI Environment debug:', {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      baseURL: this.baseURL,
      hasViteEnv: !!import.meta.env,
      envKeys: Object.keys(import.meta.env || {}).filter(key => key.includes('OPENAI') || key.includes('API')),
      apiKeyExists: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none'
    });
    
    // Validate API key configuration with specific error messaging
    if (!this.apiKey) {
      console.error('❌ Groq API key not found. Set GROQ_API_KEY in .env file.');
    } else if (!this.apiKey.startsWith('gsk_')) {
      console.error('❌ Invalid Groq API key format. Key should start with "gsk_"');
    } else {
      console.log('✅ Groq Chat service initialized successfully');
    }
  }

  /**
   * Validates OpenAI service configuration status
   * 
   * @returns true if API key is properly configured for service usage
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.startsWith('gsk_'));
  }

  /**
   * Implements intelligent rate limiting for API stability
   * 
   * Prevents API rate limit violations by enforcing minimum delays
   * between consecutive requests, ensuring reliable service operation.
   * 
   * @private
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Executes OpenAI API requests with comprehensive error handling
   * 
   * Manages API communication with environment-aware configuration,
   * intelligent error processing, and robust response validation.
   * Supports both development proxy and production direct API access.
   * 
   * @param messages - Conversation context for AI completion
   * @param temperature - Creativity/randomness control (0-1)
   * @returns Promise resolving to AI-generated content string
   * @throws Error with user-friendly messages for various failure scenarios
   * @private
   */
  private async makeRequest(messages: OpenAIMessage[], temperature = 0.7): Promise<string> {
    console.log('🚀 Making OpenAI request...', {
      configured: this.isConfigured(),
      isDev: import.meta.env.DEV,
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      messageCount: messages.length
    });

    if (!this.isConfigured()) {
  throw new Error('🔑 Groq API key not configured. Please add GROQ_API_KEY to your .env file.');
    }

    // Apply rate limiting for stable API performance
    await this.waitForRateLimit();

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Always use Authorization header for Groq
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        console.log('📡 Using Groq API call with auth header');
      }
      
      // Execute API request with optimized model configuration
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages,
          temperature,
          max_tokens: 2000,
          stream: false,
          top_p: 0.95,
        }),
      });

      // Process API response with detailed error handling
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Network error' } }));
        const errorMessage = this.getErrorMessage(response.status, errorData.error?.message);
        throw new Error(errorMessage);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message.content;
      
      if (!content) {
    throw new Error('🤖 Groq returned empty response. Please try again.');
      }
      
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
  throw new Error('🌐 Network error connecting to Groq. Check your internet connection.');
    }
  }

  /**
   * Transforms HTTP status codes into user-friendly error messages
   * 
   * @param status - HTTP response status code
   * @param message - Optional API error message
   * @returns User-friendly error message with appropriate emoji
   * @private
   */
  private getErrorMessage(status: number, message?: string): string {
    switch (status) {
      case 401:
  return '🔐 Invalid Groq API key. Please check your GROQ_API_KEY.';
      case 429:
  return '⏳ Groq rate limit reached. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
  return '🔧 Groq service temporarily unavailable. Try again in a few minutes.';
      default:
  return `🤖 Groq Error: ${message || 'Unknown error occurred'}`;
    }
  }

  /**
   * Generates complete, web-optimized recipes using advanced AI
   * 
   * Creates comprehensive recipe content including ingredients, instructions,
   * timing, and metadata. Features intelligent prompt engineering, robust
   * JSON validation, and web-ready formatting for immediate display.
   * 
   * @param options - Recipe generation parameters and constraints
   * @returns Promise resolving to complete Recipe object with all metadata
   * @throws Error with specific validation messages for various failure scenarios
   */
  async generateRecipe(options: RecipeGenerationOptions): Promise<any> {
    const { ingredients, dietaryRestrictions = [], maxTime = 60, difficulty = 'medium', servings = 4 } = options;

    if (!ingredients || ingredients.length === 0) {
      throw new Error('🥕 Please add some ingredients to generate a recipe!');
    }

    // Advanced system prompt engineering for culinary expertise
    const systemPrompt = `You are a world-class chef creating recipes for a modern cooking website. Your recipes are practical, delicious, and perfectly formatted for web display.

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just pure JSON starting with { and ending with }.`;
    
    // Detailed user prompt with comprehensive recipe requirements
    const userPrompt = `Create an amazing recipe for a cooking website using: ${ingredients.join(', ')}

🎯 Requirements:
${dietaryRestrictions.length > 0 ? `• Dietary: ${dietaryRestrictions.join(', ')}\n` : ''}• Max time: ${maxTime} minutes
• Difficulty: ${difficulty}
• Servings: ${servings}

📋 JSON Format (exact structure required):
{
  "title": "Appetizing Recipe Name",
  "description": "Mouth-watering description that makes people want to cook this (2-3 sentences)",
  "cookTime": ${Math.min(maxTime - 5, maxTime)},
  "difficulty": "${difficulty}",
  "servings": ${servings},
  "ingredients": [
    { "name": "ingredient", "quantity": "amount", "unit": "unit" }
  ],
  "instructions": [
    "Step 1: Clear action with technique",
    "Step 2: Next action with timing/temp",
    "Continue with detailed steps..."
  ],
  "dietaryTags": [${dietaryRestrictions.length > 0 ? `"${dietaryRestrictions.join('", "')}"` : '"general"'}],
  "tips": [
    "Pro tip for perfect results",
    "Chef's secret for amazing flavor"
  ]
}

🍳 Make it restaurant-quality but home-cookable!`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
  console.log('📤 Sending request to Groq...');
      const response = await this.makeRequest(messages, 0.8);
      
  console.log('📥 Received response from Groq:', {
        hasResponse: !!response,
        responseLength: response ? response.length : 0,
        firstChars: response ? response.substring(0, 100) : 'none'
      });
      
      if (!response || response.trim().length === 0) {
        throw new Error('🤖 Groq returned empty response. Please try again.');
      }
      
      // Advanced JSON extraction and cleaning for web integration reliability
      let cleanedResponse = response.trim();
      
      // Remove markdown formatting that might interfere with JSON parsing
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanedResponse = cleanedResponse.replace(/^json\s*/g, '');
      
      // Robust JSON object extraction with multiple fallback strategies
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      } else {
        // Fallback strategy: locate JSON boundaries manually
        const firstBrace = cleanedResponse.indexOf('{');
        const lastBrace = cleanedResponse.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error('🔧 Invalid response format from Groq. Please try again.');
        }
        
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }
      
      try {
        const recipe = JSON.parse(cleanedResponse);
        
        // Comprehensive recipe validation for web application compatibility
        if (!this.validateRecipeStructure(recipe)) {
          throw new Error('📝 Incomplete recipe generated. Please try again.');
        }
        
        // Ensure unique identifier for web application state management
        if (!recipe.id) {
          recipe.id = `chatgpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        console.log('✅ Recipe generated successfully for website:', recipe.title);
        return recipe;
        
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.error('📄 Raw response:', response);
  throw new Error('🔧 Groq response format error. Please try generating again.');
      }
    } catch (error) {
      console.error('🚨 Recipe generation error:', error);
      
      // Preserve user-friendly error messages while adding context for debugging
      if (error instanceof Error && error.message.includes('🔑')) {
        throw error;
      }
      
      throw new Error('🍳 Failed to generate recipe. Please check your internet connection and try again.');
    }
  }

  /**
   * Validates recipe structure for web application requirements
   * 
   * @param recipe - Recipe object to validate
   * @returns true if recipe meets all structural requirements
   * @private
   */
  private validateRecipeStructure(recipe: any): boolean {
    const requiredFields = ['title', 'description', 'ingredients', 'instructions'];
    const hasRequiredFields = requiredFields.every(field => recipe[field]);
    
    const hasValidIngredients = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
    const hasValidInstructions = Array.isArray(recipe.instructions) && recipe.instructions.length > 0;
    
    return hasRequiredFields && hasValidIngredients && hasValidInstructions;
  }

  /**
   * Improves existing recipes based on user feedback and preferences
   * 
   * @param recipe - Original recipe object to enhance
   * @param improvementRequest - Specific improvement instructions from user
   * @returns Promise resolving to enhanced recipe object
   * @throws Error if improvement generation fails
   */
  async improveRecipe(recipe: any, improvementRequest: string): Promise<any> {
    const systemPrompt = `You are a professional chef. Improve existing recipes based on user feedback. Always respond with valid JSON format.`;
    
    const userPrompt = `Improve this recipe based on the request: "${improvementRequest}"

Current recipe: ${JSON.stringify(recipe, null, 2)}

Please respond with the improved recipe in the same JSON format as the original.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages, 0.7);
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      console.error('Error improving recipe:', error);
      throw error;
    }
  }

  /**
   * Generates comprehensive cooking tips with categorized guidance
   * 
   * Creates detailed, educational cooking advice organized by categories
   * including general techniques, professional secrets, common mistakes,
   * and flavor pairing suggestions for enhanced culinary education.
   * 
   * @param ingredients - Ingredient list for contextualized tips
   * @returns Promise resolving to structured cooking tips object
   */
  async generateCookingTips(ingredients: string[]): Promise<any> {
    const systemPrompt = `You are a world-renowned chef and culinary instructor. Create comprehensive, engaging cooking tips that educate and inspire home cooks.`;
    
    // Detailed prompt for comprehensive tip generation
    const userPrompt = `Create detailed cooking tips for these ingredients: ${ingredients.join(', ')}.

Provide tips in this JSON format:
{
  "generalTips": [
    {
      "title": "Tip Title",
      "content": "Detailed explanation",
      "category": "preparation|cooking|flavor|storage",
      "importance": "high|medium|low",
      "estimatedTime": "2-3 minutes"
    }
  ],
  "proTips": [
    {
      "title": "Professional Secret",
      "content": "Advanced technique explanation",
      "category": "technique|flavor|presentation",
      "chefSecret": true
    }
  ],
  "commonMistakes": [
    {
      "mistake": "What people do wrong",
      "solution": "How to fix it",
      "prevention": "How to avoid it"
    }
  ],
  "flavorPairings": [
    {
      "ingredient": "main ingredient",
      "pairs": ["ingredient1", "ingredient2"],
      "why": "Explanation of why they work together"
    }
  ]
}

Focus on practical, actionable advice that will genuinely improve the cooking experience. Include 3-4 items in each category.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages, 0.7);
      
      try {
        const tips = JSON.parse(response);
        console.log('✅ Generated enhanced cooking tips:', tips);
        return tips;
      } catch (parseError) {
        console.warn('Failed to parse enhanced tips, generating fallback:', parseError);
        // Graceful degradation to simple tips when complex parsing fails
        return this.generateSimpleTips(ingredients);
      }
    } catch (error) {
      console.error('Error generating cooking tips:', error);
      return this.generateSimpleTips(ingredients);
    }
  }

  /**
   * Generates highly personalized, recipe-specific cooking guidance
   * 
   * Creates contextual cooking tips tailored to specific recipes and ingredients.
   * Includes scientific explanations, technique optimization, pitfall prevention,
   * and presentation advice for comprehensive culinary education.
   * 
   * @param recipeTitle - Specific recipe name for contextual relevance
   * @param ingredients - Ingredient list for targeted advice
   * @returns Promise resolving to comprehensive recipe-specific tips
   */
  async generateDynamicCookingTips(recipeTitle: string, ingredients: string[]): Promise<any> {
    // Advanced system prompt for expert-level culinary guidance
    const systemPrompt = `You are a world-class professional chef with decades of experience in fine dining and home cooking. You specialize in creating personalized, actionable cooking tips that transform ordinary cooks into confident chefs. Your advice is always practical, scientifically sound, and designed to improve both technique and flavor.`;
    
    // Comprehensive prompt for recipe-specific tip generation
    const userPrompt = `Create personalized cooking tips for this specific recipe:4

🍽️ Recipe: "${recipeTitle}"
🥘 Key Ingredients: ${ingredients.join(', ')}

Generate comprehensive, recipe-specific tips in this exact JSON format:

{
  "recipeTips": [
    {
      "title": "Recipe-Specific Tip Title",
      "content": "Detailed explanation tailored to this exact recipe and ingredients",
      "category": "preparation|cooking|flavor|plating",
      "importance": "critical|high|medium",
      "estimatedTime": "1-2 minutes",
      "appliesToStep": "Which cooking step this applies to"
    }
  ],
  "ingredientSecrets": [
    {
      "ingredient": "specific ingredient from the recipe", 
      "secret": "Professional technique for handling this ingredient in this dish",
      "impact": "How this technique improves the final dish"
    }
  ],
  "flavorEnhancers": [
    {
      "technique": "Specific flavor enhancement technique",
      "description": "How to apply this technique to this recipe",
      "result": "Expected flavor improvement",
      "timing": "When in the cooking process to apply this"
    }
  ],
  "commonPitfalls": [
    {
      "pitfall": "Common mistake specific to this type of dish",
      "prevention": "How to avoid this mistake",
      "recovery": "How to fix it if it happens",
      "why": "Why this mistake is particularly problematic for this recipe"
    }
  ],
  "presentationTips": [
    {
      "tip": "Plating and presentation advice",
      "description": "Detailed instructions for beautiful presentation"
    }
  ]
}

Requirements:
- All tips must be specifically tailored to "${recipeTitle}" using "${ingredients.join(', ')}"
- Focus on techniques that will significantly improve the final dish
- Include scientific explanations where relevant (e.g., Maillard reaction, emulsification)
- Provide 2-3 items in each category
- Make every tip actionable with clear steps
- Consider the cooking methods likely used in this recipe`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages, 0.8);
      
      console.log('📥 Raw GPT-4o response for dynamic tips:', {
        hasResponse: !!response,
        responseLength: response ? response.length : 0,
        firstChars: response ? response.substring(0, 200) : 'none'
      });
      
      let cleanedResponse = response.trim();
      
      // Clean and extract JSON from AI response
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanedResponse = cleanedResponse.replace(/^json\s*/g, '');
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      try {
        const tips = JSON.parse(cleanedResponse);
        
        // Validate response structure for application compatibility
        if (!tips || typeof tips !== 'object') {
          throw new Error('Invalid tips structure');
        }
        
        console.log('✅ Generated dynamic recipe-specific tips:', tips);
        return tips;
      } catch (parseError) {
        console.warn('Failed to parse dynamic tips, generating recipe-specific fallback:', parseError);
        return this.generateRecipeSpecificFallback(recipeTitle, ingredients);
      }
    } catch (error) {
      console.error('Error generating dynamic cooking tips:', error);
      return this.generateRecipeSpecificFallback(recipeTitle, ingredients);
    }
  }

  /**
   * Generates basic cooking tips as fallback for complex tip generation failures
   * 
   * @param ingredients - Ingredient list for basic tip context
   * @returns Simple but useful cooking tips structure
   * @private
   */
  private async generateSimpleTips(ingredients: string[]): Promise<any> {
    return {
      generalTips: [
        {
          title: "Fresh Ingredients",
          content: `Use fresh ${ingredients[0]} for the best flavor and texture in your dish.`,
          category: "preparation",
          importance: "high",
          estimatedTime: "1 minute"
        },
        {
          title: "Proper Seasoning", 
          content: "Season your ingredients at the right time for maximum flavor absorption.",
          category: "flavor",
          importance: "high",
          estimatedTime: "2 minutes"
        }
      ],
      proTips: [
        {
          title: "Temperature Control",
          content: "Master your cooking temperature for professional results.",
          category: "technique",
          chefSecret: true
        }
      ],
      commonMistakes: [
        {
          mistake: "Overcooking ingredients",
          solution: "Monitor cooking time closely",
          prevention: "Use a timer and check frequently"
        }
      ],
      flavorPairings: [
        {
          ingredient: ingredients[0] || "main ingredient",
          pairs: ["herbs", "spices"],
          why: "These combinations enhance the natural flavors"
        }
      ]
    };
  }

  /**
   * Creates recipe-specific fallback tips when dynamic generation fails
   * 
   * @param recipeTitle - Recipe name for contextual fallback tips
   * @param ingredients - Ingredient list for targeted advice
   * @returns Recipe-specific fallback tips structure
   * @private
   */
  private generateRecipeSpecificFallback(recipeTitle: string, ingredients: string[]): any {
    const mainIngredient = ingredients[0] || "main ingredient";
    const recipeType = this.detectRecipeType(recipeTitle);
    
    return {
      recipeTips: [
        {
          title: `Perfect ${recipeType} Technique`,
          content: `For ${recipeTitle}, focus on proper timing and temperature control to achieve the best results with ${mainIngredient}.`,
          category: "cooking",
          importance: "critical",
          estimatedTime: "2-3 minutes",
          appliesToStep: "Main cooking phase"
        },
        {
          title: "Ingredient Preparation",
          content: `Properly prepare your ${mainIngredient} by washing, cutting to uniform size, and having all ingredients ready before you start cooking ${recipeTitle}.`,
          category: "preparation", 
          importance: "high",
          estimatedTime: "5-10 minutes",
          appliesToStep: "Preparation phase"
        }
      ],
      ingredientSecrets: [
        {
          ingredient: mainIngredient,
          secret: `The key to perfect ${mainIngredient} in ${recipeTitle} is to not overcrowd the pan and maintain consistent heat.`,
          impact: "Better texture and more even cooking"
        }
      ],
      flavorEnhancers: [
        {
          technique: "Layered Seasoning",
          description: `Season ${recipeTitle} at multiple stages - during prep, cooking, and final plating for deeper flavor.`,
          result: "More complex and well-developed taste",
          timing: "Throughout the cooking process"
        }
      ],
      commonPitfalls: [
        {
          pitfall: `Rushing the cooking process for ${recipeType}`,
          prevention: "Allow proper time for each cooking stage and don't turn up the heat too high",
          recovery: "Lower heat and extend cooking time if ingredients are browning too quickly",
          why: `${recipeType} dishes need time to develop proper flavors and textures`
        }
      ],
      presentationTips: [
        {
          tip: "Color and Texture Balance",
          description: `Arrange ${recipeTitle} with attention to color contrast and varied textures for visual appeal.`
        }
      ]
    };
  }

  /**
   * Analyzes recipe titles to determine cooking method categories
   * 
   * @param title - Recipe title for analysis
   * @returns Detected recipe type for contextualized tips
   * @private
   */
  private detectRecipeType(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('stir') || titleLower.includes('fry')) return 'stir-fry';
    if (titleLower.includes('pasta') || titleLower.includes('spaghetti')) return 'pasta';
    if (titleLower.includes('soup') || titleLower.includes('broth')) return 'soup';
    if (titleLower.includes('salad')) return 'salad';
    if (titleLower.includes('curry')) return 'curry';
    if (titleLower.includes('roast') || titleLower.includes('bake')) return 'roasted';
    if (titleLower.includes('grill')) return 'grilled';
    if (titleLower.includes('steam')) return 'steamed';
    
    return 'dish';
  }
}

// Export singleton instance for application-wide OpenAI service access
export const openaiService = new OpenAIService();