/**
 * TipPersonalizationPanel - Advanced AI-powered cooking tips and guidance system
 * 
 * Provides comprehensive, context-aware cooking tips tailored to specific recipes.
 * Features dynamic tip generation, interactive completion tracking, favorites management,
 * and categorized tip organization for enhanced cooking experience.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Star, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  ChefHat, 
  Timer, 
  TrendingUp,
  CheckCircle2,
  Heart,
  Eye,
  EyeOff,
  Filter,
  Zap,
  Target,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recipe } from '@/types/recipe';
import { DynamicCookingTips, BasicCookingTips } from '@/types/tips';
import { aiService } from '@/services/ai';
import { toast } from 'sonner';

interface TipPersonalizationPanelProps {
  recipe: Recipe;
  className?: string;
}

export function TipPersonalizationPanel({ recipe, className }: TipPersonalizationPanelProps) {
  // Core state management for dynamic tip system
  const [dynamicTips, setDynamicTips] = useState<DynamicCookingTips | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // User interaction state management for tip engagement
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set());
  const [favoriteTips, setFavoriteTips] = useState<Set<string>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  
  // UI state management for filtering and navigation
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('recipe-tips');

  /**
   * Effect hook to trigger tip generation when recipe changes
   * Automatically regenerates tips when a new recipe is selected
   */
  useEffect(() => {
    generateDynamicTips();
  }, [recipe.id, recipe.title]);

  /**
   * Generates AI-powered, recipe-specific cooking tips
   * 
   * Communicates with AI service to create personalized cooking guidance
   * based on recipe ingredients, techniques, and complexity. Includes
   * comprehensive error handling and user feedback.
   */
  const generateDynamicTips = async () => {
    setIsLoading(true);
    try {
      console.log('🎯 Generating dynamic tips for recipe:', recipe.title);
      
      // Request AI-enhanced recipe tips through service layer
      const enhancements = await aiService.getRecipeEnhancements(recipe);
      
      if (enhancements.cookingTips) {
        setDynamicTips(enhancements.cookingTips);
        console.log('✅ Dynamic tips loaded successfully:', enhancements.cookingTips);
        toast.success('🧑‍🍳 Personalized cooking tips generated!');
      } else {
        throw new Error('No tips generated');
      }
    } catch (error) {
      console.error('❌ Failed to generate dynamic tips:', error);
      toast.error('Failed to generate personalized tips. Please try again.');
      // Graceful degradation: could implement fallback static tips here
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggles completion status of individual cooking tips
   * 
   * Manages user progress tracking with persistent state and provides
   * immediate feedback for learning engagement and skill development.
   * 
   * @param tipId - Unique identifier for the tip being toggled
   */
  const toggleTipCompletion = (tipId: string) => {
    const newCompleted = new Set(completedTips);
    if (newCompleted.has(tipId)) {
      newCompleted.delete(tipId);
      toast.success('Tip unmarked as completed');
    } else {
      newCompleted.add(tipId);
      toast.success('Great job! Tip mastered 🎉');
    }
    setCompletedTips(newCompleted);
  };

  /**
   * Toggles favorite status for cooking tips
   * 
   * Enables users to bookmark valuable tips for future reference
   * and quick access during cooking sessions.
   * 
   * @param tipId - Unique identifier for the tip being favorited
   */
  const toggleTipFavorite = (tipId: string) => {
    const newFavorites = new Set(favoriteTips);
    if (newFavorites.has(tipId)) {
      newFavorites.delete(tipId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(tipId);
      toast.success('Added to favorites! ❤️');
    }
    setFavoriteTips(newFavorites);
  };

  /**
   * Toggles expanded view for lengthy tip content
   * 
   * Manages content visibility for tips with extensive descriptions,
   * improving readability and reducing cognitive load.
   * 
   * @param tipId - Unique identifier for the tip being expanded/collapsed
   */
  const toggleTipExpansion = (tipId: string) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId);
    } else {
      newExpanded.add(tipId);
    }
    setExpandedTips(newExpanded);
  };

  /**
   * Returns appropriate icon based on tip importance level
   * 
   * Provides visual hierarchy for tip prioritization to help users
   * focus on the most critical cooking techniques first.
   * 
   * @param importance - Importance level string (critical, high, medium, low)
   * @returns JSX element containing the appropriate icon
   */
  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return <Target className="h-4 w-4 text-red-500" />;
      case 'high': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'medium': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <Lightbulb className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * Returns category-specific icon for tip classification
   * 
   * Enhances visual organization by providing contextual icons
   * for different types of cooking guidance and techniques.
   * 
   * @param category - Category string (preparation, cooking, flavor, etc.)
   * @returns JSX element containing the category-appropriate icon
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'preparation': return <ChefHat className="h-4 w-4" />;
      case 'cooking': return <Timer className="h-4 w-4" />;
      case 'flavor': return <Sparkles className="h-4 w-4" />;
      case 'plating': return <Palette className="h-4 w-4" />;
      case 'technique': return <TrendingUp className="h-4 w-4" />;
      case 'presentation': return <Award className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  /**
   * Renders interactive tip card with full functionality
   * 
   * Creates comprehensive tip display with completion tracking, favorites,
   * expansion controls, and contextual information. Provides consistent
   * UI patterns across all tip categories.
   * 
   * @param tip - Tip object containing content and metadata
   * @param tipId - Unique identifier for tip tracking
   * @param icon - Icon element for visual identification
   * @param bgColor - Background color class for visual categorization
   * @param borderColor - Border color class for visual consistency
   * @returns JSX element representing complete tip card
   */
  const renderTipCard = (
    tip: any,
    tipId: string,
    icon: React.ReactNode,
    bgColor: string = 'bg-white',
    borderColor: string = 'border-gray-200'
  ) => {
    // Calculate tip display state for interactive elements
    const isCompleted = completedTips.has(tipId);
    const isFavorite = favoriteTips.has(tipId);
    const isExpanded = expandedTips.has(tipId);
    const shouldTruncate = tip.content?.length > 150;

    return (
      <Card key={tipId} className={`group relative transition-all duration-200 ${
        isCompleted ? 'bg-green-50 border-green-200 shadow-sm' : `${bgColor} ${borderColor} hover:shadow-md hover:border-blue-300`
      }`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">{icon}</div>
              <div className="flex-1">
                {/* Tip header with importance and category indicators */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className={`font-semibold text-sm ${isCompleted ? 'line-through text-green-700' : 'text-gray-900'}`}>
                    {tip.title}
                  </h4>
                  {tip.importance && getImportanceIcon(tip.importance)}
                  {tip.category && getCategoryIcon(tip.category)}
                </div>
                
                {/* Main tip content with expansion control */}
                <p className={`text-sm leading-relaxed ${isCompleted ? 'text-green-600' : 'text-gray-600'} ${
                  shouldTruncate && !isExpanded ? 'line-clamp-3' : ''
                }`}>
                  {tip.content || tip.description || tip.secret}
                </p>
                
                {/* Content expansion toggle for lengthy tips */}
                {shouldTruncate && (
                  <button
                    onClick={() => toggleTipExpansion(tipId)}
                    className="text-xs text-blue-500 hover:text-blue-600 mt-1 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
                
                {/* Contextual metadata display */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {tip.estimatedTime && (
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {tip.estimatedTime}
                    </span>
                  )}
                  {tip.appliesToStep && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {tip.appliesToStep}
                    </span>
                  )}
                  {tip.timing && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {tip.timing}
                    </span>
                  )}
                </div>

                {/* Enhanced tip information sections */}
                {tip.impact && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong className="text-blue-800">Impact:</strong> 
                    <span className="text-blue-700 ml-1">{tip.impact}</span>
                  </div>
                )}
                
                {tip.result && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                    <strong className="text-green-800">Result:</strong> 
                    <span className="text-green-700 ml-1">{tip.result}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Interactive action buttons with hover reveal */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleTipCompletion(tipId)}
                className={`p-1.5 rounded-full transition-colors ${
                  isCompleted 
                    ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                    : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                }`}
                title={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => toggleTipFavorite(tipId)}
                className={`p-1.5 rounded-full transition-colors ${
                  isFavorite 
                    ? 'text-red-500 bg-red-100 hover:bg-red-200' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Loading state with contextual feedback
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">🧑‍🍳 Chef AI is analyzing your recipe...</h3>
          <p className="text-sm text-muted-foreground">
            Generating personalized tips for "{recipe.title}"
          </p>
        </div>
      </div>
    );
  }

  // Error state with retry functionality
  if (!dynamicTips) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Unable to Generate Tips</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn't generate personalized tips for this recipe at the moment.
          </p>
          <Button onClick={generateDynamicTips} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced header with progress tracking */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="h-7 w-7 text-blue-500" />
              Smart Cooking Tips
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered, personalized guidance for "{recipe.title}"
            </p>
          </div>
          
          {/* User progress indicators */}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium">{completedTips.size}</span>
            <span className="text-gray-600">completed</span>
            <Heart className="h-4 w-4 text-red-500 ml-3" />
            <span className="font-medium">{favoriteTips.size}</span>
            <span className="text-gray-600">favorited</span>
          </div>
        </div>
      </div>

      {/* Categorized tips interface with tabbed navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recipe-tips" className="text-xs">Recipe Tips</TabsTrigger>
          <TabsTrigger value="ingredients" className="text-xs">Ingredients</TabsTrigger>
          <TabsTrigger value="flavor" className="text-xs">Flavor</TabsTrigger>
          <TabsTrigger value="pitfalls" className="text-xs">Avoid Mistakes</TabsTrigger>
          <TabsTrigger value="presentation" className="text-xs">Presentation</TabsTrigger>
        </TabsList>

        {/* Recipe-specific cooking techniques and methods */}
        <TabsContent value="recipe-tips" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-lg">Recipe-Specific Tips</h3>
          </div>
          
          {dynamicTips.recipeTips && dynamicTips.recipeTips.length > 0 ? (
            <div className="space-y-3">
              {dynamicTips.recipeTips.map((tip, index) => 
                renderTipCard(
                  tip,
                  `recipe-tip-${index}`,
                  <Target className="h-4 w-4 text-blue-500" />,
                  'bg-blue-50',
                  'border-blue-200'
                )
              )}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No recipe-specific tips available</p>
            </Card>
          )}
        </TabsContent>

        {/* Ingredient handling and preparation secrets */}
        <TabsContent value="ingredients" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-lg">Ingredient Secrets</h3>
          </div>
          
          {dynamicTips.ingredientSecrets && dynamicTips.ingredientSecrets.length > 0 ? (
            <div className="space-y-3">
              {dynamicTips.ingredientSecrets.map((secret, index) => 
                renderTipCard(
                  secret,
                  `ingredient-secret-${index}`,
                  <Award className="h-4 w-4 text-purple-500" />,
                  'bg-purple-50',
                  'border-purple-200'
                )
              )}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No ingredient secrets available</p>
            </Card>
          )}
        </TabsContent>

        {/* Flavor enhancement and seasoning guidance */}
        <TabsContent value="flavor" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <h3 className="font-semibold text-lg">Flavor Enhancers</h3>
          </div>
          
          {dynamicTips.flavorEnhancers && dynamicTips.flavorEnhancers.length > 0 ? (
            <div className="space-y-3">
              {dynamicTips.flavorEnhancers.map((enhancer, index) => 
                renderTipCard(
                  enhancer,
                  `flavor-enhancer-${index}`,
                  <Sparkles className="h-4 w-4 text-pink-500" />,
                  'bg-pink-50',
                  'border-pink-200'
                )
              )}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No flavor enhancement tips available</p>
            </Card>
          )}
        </TabsContent>

        {/* Common cooking mistakes and prevention strategies */}
        <TabsContent value="pitfalls" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-lg">Avoid Common Pitfalls</h3>
          </div>
          
          {dynamicTips.commonPitfalls && dynamicTips.commonPitfalls.length > 0 ? (
            <div className="space-y-3">
              {dynamicTips.commonPitfalls.map((pitfall, index) => {
                const tipId = `pitfall-${index}`;
                const isCompleted = completedTips.has(tipId);
                const isFavorite = favoriteTips.has(tipId);

                return (
                  // Specialized pitfall card with prevention and recovery guidance
                  <Card key={tipId} className={`group relative transition-all duration-200 ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200 hover:shadow-md'
                  }`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            {/* Pitfall identification section */}
                            <div>
                              <strong className="text-amber-800 text-sm">Pitfall:</strong>
                              <p className={`text-sm ${isCompleted ? 'line-through text-green-700' : 'text-amber-700'} mt-1`}>
                                {pitfall.pitfall}
                              </p>
                            </div>
                            {/* Prevention strategy section */}
                            <div>
                              <strong className="text-green-800 text-sm">Prevention:</strong>
                              <p className="text-sm text-green-700 mt-1">{pitfall.prevention}</p>
                            </div>
                            {/* Recovery technique section */}
                            <div>
                              <strong className="text-blue-800 text-sm">Recovery:</strong>
                              <p className="text-sm text-blue-700 mt-1">{pitfall.recovery}</p>
                            </div>
                            {/* Educational explanation section */}
                            <div>
                              <strong className="text-gray-800 text-sm">Why it matters:</strong>
                              <p className="text-sm text-gray-700 mt-1 italic">{pitfall.why}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Interactive controls for pitfall tracking */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleTipCompletion(tipId)}
                            className={`p-1.5 rounded-full transition-colors ${
                              isCompleted 
                                ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleTipFavorite(tipId)}
                            className={`p-1.5 rounded-full transition-colors ${
                              isFavorite 
                                ? 'text-red-500 bg-red-100 hover:bg-red-200' 
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No common pitfalls identified</p>
            </Card>
          )}
        </TabsContent>

        {/* Visual presentation and plating techniques */}
        <TabsContent value="presentation" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">Presentation Tips</h3>
          </div>
          
          {dynamicTips.presentationTips && dynamicTips.presentationTips.length > 0 ? (
            <div className="space-y-3">
              {dynamicTips.presentationTips.map((tip, index) => 
                renderTipCard(
                  tip,
                  `presentation-tip-${index}`,
                  <Palette className="h-4 w-4 text-indigo-500" />,
                  'bg-indigo-50',
                  'border-indigo-200'
                )
              )}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No presentation tips available</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Progress achievement feedback */}
      {completedTips.size > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              Excellent progress! You've mastered {completedTips.size} tip{completedTips.size !== 1 ? 's' : ''} for this recipe.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}