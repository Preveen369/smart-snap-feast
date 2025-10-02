/**
 * OpenAI API Service for recipe generation and AI-powered text generation
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface RecipeGenerationOptions {
  ingredients: string[];
  dietaryRestrictions?: string[];
  maxTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = import.meta.env.DEV ? '/api/openai' : 'https://api.openai.com/v1';
  private rateLimitDelay = 1000; // 1 second delay between requests
  private lastRequestTime = 0;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    // Debug logging for troubleshooting
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
    
    if (!this.apiKey) {
      console.error('❌ OpenAI API key not found. Set VITE_OPENAI_API_KEY in .env file.');
    } else if (!this.apiKey.startsWith('sk-')) {
      console.error('❌ Invalid OpenAI API key format. Key should start with "sk-"');
    } else {
      console.log('✅ ChatGPT service initialized successfully');
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.startsWith('sk-'));
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private async makeRequest(messages: OpenAIMessage[], temperature = 0.7): Promise<string> {
    console.log('🚀 Making OpenAI request...', {
      configured: this.isConfigured(),
      isDev: import.meta.env.DEV,
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      messageCount: messages.length
    });

    if (!this.isConfigured()) {
      throw new Error('🔑 ChatGPT API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    // Rate limiting for better website performance
    await this.waitForRateLimit();

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header only for production (direct API calls)
      if (!import.meta.env.DEV && this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        console.log('📡 Using direct API call with auth header');
      } else {
        console.log('🔄 Using development proxy (no auth header needed)');
      }
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages,
          temperature,
          max_tokens: 2000,
          stream: false,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Network error' } }));
        const errorMessage = this.getErrorMessage(response.status, errorData.error?.message);
        throw new Error(errorMessage);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message.content;
      
      if (!content) {
        throw new Error('🤖 ChatGPT returned empty response. Please try again.');
      }
      
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('🌐 Network error connecting to ChatGPT. Check your internet connection.');
    }
  }

  private getErrorMessage(status: number, message?: string): string {
    switch (status) {
      case 401:
        return '🔐 Invalid ChatGPT API key. Please check your VITE_OPENAI_API_KEY.';
      case 429:
        return '⏳ ChatGPT rate limit reached. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
        return '🔧 ChatGPT service temporarily unavailable. Try again in a few minutes.';
      default:
        return `🤖 ChatGPT Error: ${message || 'Unknown error occurred'}`;
    }
  }

  async generateRecipe(options: RecipeGenerationOptions): Promise<any> {
    const { ingredients, dietaryRestrictions = [], maxTime = 60, difficulty = 'medium', servings = 4 } = options;

    if (!ingredients || ingredients.length === 0) {
      throw new Error('🥕 Please add some ingredients to generate a recipe!');
    }

    const systemPrompt = `You are a world-class chef creating recipes for a modern cooking website. Your recipes are practical, delicious, and perfectly formatted for web display.

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just pure JSON starting with { and ending with }.`;
    
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
      console.log('📤 Sending request to OpenAI...');
      const response = await this.makeRequest(messages, 0.8);
      
      console.log('📥 Received response from OpenAI:', {
        hasResponse: !!response,
        responseLength: response ? response.length : 0,
        firstChars: response ? response.substring(0, 100) : 'none'
      });
      
      if (!response || response.trim().length === 0) {
        throw new Error('🤖 ChatGPT returned empty response. Please try again.');
      }
      
      // Advanced JSON cleaning for website integration
      let cleanedResponse = response.trim();
      
      // Remove any markdown formatting
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanedResponse = cleanedResponse.replace(/^json\s*/g, '');
      
      // Extract JSON object more robustly
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      } else {
        // Fallback: find first { and last }
        const firstBrace = cleanedResponse.indexOf('{');
        const lastBrace = cleanedResponse.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error('🔧 Invalid response format from ChatGPT. Please try again.');
        }
        
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }
      
      try {
        const recipe = JSON.parse(cleanedResponse);
        
        // Validate recipe structure for website display
        if (!this.validateRecipeStructure(recipe)) {
          throw new Error('📝 Incomplete recipe generated. Please try again.');
        }
        
        // Add website-specific ID if not present
        if (!recipe.id) {
          recipe.id = `chatgpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        console.log('✅ Recipe generated successfully for website:', recipe.title);
        return recipe;
        
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.error('📄 Raw response:', response);
        throw new Error('🔧 ChatGPT response format error. Please try generating again.');
      }
    } catch (error) {
      console.error('🚨 Recipe generation error:', error);
      
      // Re-throw with user-friendly message if it's already formatted
      if (error instanceof Error && error.message.includes('�')) {
        throw error;
      }
      
      throw new Error('🍳 Failed to generate recipe. Please check your internet connection and try again.');
    }
  }

  private validateRecipeStructure(recipe: any): boolean {
    const requiredFields = ['title', 'description', 'ingredients', 'instructions'];
    const hasRequiredFields = requiredFields.every(field => recipe[field]);
    
    const hasValidIngredients = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
    const hasValidInstructions = Array.isArray(recipe.instructions) && recipe.instructions.length > 0;
    
    return hasRequiredFields && hasValidIngredients && hasValidInstructions;
  }

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

  async generateCookingTips(ingredients: string[]): Promise<any> {
    const systemPrompt = `You are a world-renowned chef and culinary instructor. Create comprehensive, engaging cooking tips that educate and inspire home cooks.`;
    
    const userPrompt = `Create detailed cooking tips for these ingredients: ${ingredients.join(', ')}.

Provide tips in this JSON format:
{
  "generalTips": [
    {
      "title": "Tip Title",
      "content": "Detailed explanation",
      "difficulty": "beginner|intermediate|advanced",
      "category": "preparation|cooking|flavor|storage",
      "importance": "high|medium|low",
      "estimatedTime": "2-3 minutes"
    }
  ],
  "proTips": [
    {
      "title": "Professional Secret",
      "content": "Advanced technique explanation",
      "difficulty": "advanced",
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
        // Fallback to simple tips
        return this.generateSimpleTips(ingredients);
      }
    } catch (error) {
      console.error('Error generating cooking tips:', error);
      return this.generateSimpleTips(ingredients);
    }
  }

  private async generateSimpleTips(ingredients: string[]): Promise<any> {
    return {
      generalTips: [
        {
          title: "Fresh Ingredients",
          content: `Use fresh ${ingredients[0]} for the best flavor and texture in your dish.`,
          difficulty: "beginner",
          category: "preparation",
          importance: "high",
          estimatedTime: "1 minute"
        },
        {
          title: "Proper Seasoning", 
          content: "Season your ingredients at the right time for maximum flavor absorption.",
          difficulty: "beginner",
          category: "flavor",
          importance: "high",
          estimatedTime: "2 minutes"
        }
      ],
      proTips: [
        {
          title: "Temperature Control",
          content: "Master your cooking temperature for professional results.",
          difficulty: "intermediate",
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
}

export const openaiService = new OpenAIService();