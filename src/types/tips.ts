/**
 * Comprehensive type definitions for AI-powered cooking tips and culinary guidance
 * 
 * Provides structured interfaces for personalized cooking assistance, recipe-specific
 * guidance, and educational culinary content. Supports both dynamic AI-generated tips
 * and curated cooking knowledge for enhanced user learning experience.
 * 
 * @module CookingTipsTypes
 */

/**
 * Recipe-specific cooking tip with contextual guidance
 * 
 * Provides targeted advice tailored to specific recipes and cooking steps.
 * Includes importance ranking and time estimates for optimal cooking workflow.
 * 
 * @interface RecipeTip
 * @property title - Descriptive name for the cooking technique or advice
 * @property content - Detailed explanation of the cooking guidance
 * @property category - Classification of tip type for organized presentation
 * @property importance - Priority level for user attention and learning focus
 * @property estimatedTime - Expected duration for implementing the technique
 * @property appliesToStep - Specific cooking phase where tip should be applied
 */
export interface RecipeTip {
  title: string;
  content: string;
  category: 'preparation' | 'cooking' | 'flavor' | 'plating';
  importance: 'critical' | 'high' | 'medium';
  estimatedTime: string;
  appliesToStep: string;
}

/**
 * Professional ingredient handling techniques and secrets
 * 
 * Encapsulates specialized knowledge for optimal ingredient preparation,
 * storage, and utilization to maximize flavor and texture outcomes.
 * 
 * @interface IngredientSecret
 * @property ingredient - Specific ingredient name this secret applies to
 * @property secret - Professional technique or handling method
 * @property impact - Expected improvement in final dish quality
 */
export interface IngredientSecret {
  ingredient: string;
  secret: string;
  impact: string;
}

/**
 * Advanced flavor enhancement techniques for culinary excellence
 * 
 * Provides sophisticated methods to elevate taste profiles and create
 * memorable dining experiences through professional flavor development.
 * 
 * @interface FlavorEnhancer
 * @property technique - Name of the flavor enhancement method
 * @property description - Step-by-step implementation instructions
 * @property result - Expected flavor improvement or transformation
 * @property timing - Optimal moment in cooking process to apply technique
 */
export interface FlavorEnhancer {
  technique: string;
  description: string;
  result: string;
  timing: string;
}

/**
 * Common cooking mistakes with prevention and recovery strategies
 * 
 * Educational content to help cooks avoid frequent pitfalls and recover
 * from cooking errors with professional guidance and scientific explanation.
 * 
 * @interface CommonPitfall
 * @property pitfall - Description of the common cooking mistake
 * @property prevention - Proactive measures to avoid the mistake
 * @property recovery - Corrective actions if mistake has already occurred
 * @property why - Scientific or culinary explanation of why this matters
 */
export interface CommonPitfall {
  pitfall: string;
  prevention: string;
  recovery: string;
  why: string;
}

/**
 * Visual presentation and plating guidance for aesthetic appeal
 * 
 * Professional advice for creating visually stunning dish presentations
 * that enhance the overall dining experience and food photography.
 * 
 * @interface PresentationTip
 * @property tip - Concise presentation technique or principle
 * @property description - Detailed instructions for implementation
 */
export interface PresentationTip {
  tip: string;
  description: string;
}

/**
 * Comprehensive collection of AI-generated, recipe-specific cooking guidance
 * 
 * Aggregates all types of personalized cooking tips into a unified structure
 * for complete culinary education and recipe-specific assistance.
 * 
 * @interface DynamicCookingTips
 * @property recipeTips - Recipe-specific techniques and methods
 * @property ingredientSecrets - Professional ingredient handling knowledge
 * @property flavorEnhancers - Advanced flavor development techniques
 * @property commonPitfalls - Mistake prevention and recovery guidance
 * @property presentationTips - Visual presentation and plating advice
 */
export interface DynamicCookingTips {
  recipeTips: RecipeTip[];
  ingredientSecrets: IngredientSecret[];
  flavorEnhancers: FlavorEnhancer[];
  commonPitfalls: CommonPitfall[];
  presentationTips: PresentationTip[];
}

/**
 * General cooking tip for foundational culinary knowledge
 * 
 * Provides broad cooking principles and techniques applicable across
 * multiple recipes and cooking scenarios for skill development.
 * 
 * @interface GeneralTip
 * @property title - Name of the cooking principle or technique
 * @property content - Detailed explanation and application guidance
 * @property category - Classification for organized learning progression
 * @property importance - Priority level for skill development focus
 * @property estimatedTime - Time investment required for mastery
 */
export interface GeneralTip {
  title: string;
  content: string;
  category: 'preparation' | 'cooking' | 'flavor' | 'storage';
  importance: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

/**
 * Professional chef secrets and advanced culinary techniques
 * 
 * Exclusive knowledge typically found in professional kitchens,
 * providing insider techniques for exceptional cooking results.
 * 
 * @interface ProTip
 * @property title - Name of the professional technique
 * @property content - Detailed explanation of the advanced method
 * @property category - Classification of professional skill area
 * @property chefSecret - Always true to indicate professional-level content
 */
export interface ProTip {
  title: string;
  content: string;
  category: 'technique' | 'flavor' | 'presentation';
  chefSecret: true;
}

/**
 * Common cooking error with solution and prevention strategies
 * 
 * Educational content focusing on frequently encountered cooking mistakes
 * with practical solutions for immediate improvement.
 * 
 * @interface CommonMistake
 * @property mistake - Description of the frequently made error
 * @property solution - Immediate corrective action to resolve the issue
 * @property prevention - Proactive measures to avoid future occurrences
 */
export interface CommonMistake {
  mistake: string;
  solution: string;
  prevention: string;
}

/**
 * Ingredient combination guidance for optimal flavor harmony
 * 
 * Curated knowledge about which ingredients work well together,
 * with scientific or cultural explanations for successful pairings.
 * 
 * @interface FlavorPairing
 * @property ingredient - Primary ingredient for pairing recommendations
 * @property pairs - Array of complementary ingredients
 * @property why - Explanation of why these combinations work effectively
 */
export interface FlavorPairing {
  ingredient: string;
  pairs: string[];
  why: string;
}

/**
 * Structured collection of fundamental cooking knowledge and guidance
 * 
 * Comprehensive educational content covering basic to advanced cooking
 * concepts for systematic culinary skill development and knowledge building.
 * 
 * @interface BasicCookingTips
 * @property generalTips - Foundational cooking principles and techniques
 * @property proTips - Professional-level secrets and advanced methods
 * @property commonMistakes - Error prevention and correction guidance
 * @property flavorPairings - Ingredient combination recommendations
 */
export interface BasicCookingTips {
  generalTips: GeneralTip[];
  proTips: ProTip[];
  commonMistakes: CommonMistake[];
  flavorPairings: FlavorPairing[];
}