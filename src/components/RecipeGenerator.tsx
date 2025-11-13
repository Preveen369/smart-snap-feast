/**
 * RecipeGenerator - Comprehensive recipe management and interactive cooking component
 * 
 * Provides advanced recipe visualization, interactive cooking mode, ingredient tracking,
 * step-by-step cooking guidance, sharing capabilities, and personalized cooking tips.
 * Features both list and grid view modes for optimal user experience.
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, Trash2, List, Grid3X3, Sparkles, Star, CheckCircle2, AlertTriangle, Heart, Lightbulb, Award, Timer, TrendingUp, Utensils, Share2, Copy, Mail, MessageCircle, Facebook, Twitter, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipPersonalizationPanel } from '@/components/TipPersonalizationPanel';
import { Recipe, Ingredient } from '@/types/recipe';
import { aiService } from '@/services/ai';
import { toast } from 'sonner';

interface RecipeGeneratorProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onGenerateRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export function RecipeGenerator({ ingredients, recipes, onGenerateRecipe, onDeleteRecipe }: RecipeGeneratorProps) {
  // Core component state management for recipe interaction
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(4);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Interactive cooking state management
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [cookingMode, setCookingMode] = useState<boolean>(false);
  const [ingredientQuantityMultiplier, setIngredientQuantityMultiplier] = useState<number>(1);
  
  // UI state management for modals and sharing
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  /**
   * Handles recipe deletion with confirmation dialog
   * 
   * Provides user confirmation before deletion and manages cleanup
   * of currently selected recipe if it matches the deleted one.
   * 
   * @param recipeId - Unique identifier of the recipe to delete
   * @param recipeTitle - Title of the recipe for confirmation display
   */
  const handleDeleteRecipe = (recipeId: string, recipeTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      onDeleteRecipe(recipeId);
      toast.success('Recipe deleted successfully');
      
      // Cleanup: Close modal if the deleted recipe is currently selected
      if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe(null);
      }
    }
  };

  /**
   * Handles recipe selection and initializes cooking session state
   * 
   * Resets all interactive cooking states when switching between recipes
   * to provide a clean cooking experience for each recipe.
   * 
   * @param recipe - Recipe object to select and display
   */
  const handleRecipeSelect = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    // Reset all cooking interaction states for new recipe
    setCheckedIngredients(new Set());
    setCompletedSteps(new Set());
    setCurrentStep(0);
    setCookingMode(false);
    setIngredientQuantityMultiplier(1);
  };

  /**
   * Toggles ingredient check status in interactive ingredient list
   * 
   * Manages ingredient completion tracking with user feedback.
   * Provides visual and toast notifications for user actions.
   * 
   * @param ingredientId - Unique identifier for the ingredient being toggled
   */
  const toggleIngredientCheck = (ingredientId: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientId)) {
      newChecked.delete(ingredientId);
      toast.success('Ingredient unchecked');
    } else {
      newChecked.add(ingredientId);
      toast.success('Ingredient checked! ✅');
    }
    setCheckedIngredients(newChecked);
  };

  /**
   * Toggles cooking step completion status with auto-progression
   * 
   * Manages step completion tracking and automatically advances
   * to the next step when current step is completed in cooking mode.
   * 
   * @param stepIndex - Index of the cooking step being toggled
   */
  const toggleStepCompletion = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
      toast.success('Step unmarked');
    } else {
      newCompleted.add(stepIndex);
      toast.success(`Step ${stepIndex + 1} completed! 🎉`);
      // Auto-advance to next step in cooking mode for seamless experience
      if (stepIndex === currentStep && stepIndex < (selectedRecipe?.instructions.length || 0) - 1) {
        setCurrentStep(stepIndex + 1);
      }
    }
    setCompletedSteps(newCompleted);
  };

  /**
   * Calculates adjusted ingredient quantities based on serving size and multiplier
   * 
   * Dynamically adjusts ingredient quantities based on user preferences
   * for serving size modifications and quantity multipliers.
   * 
   * @param quantity - Original ingredient quantity as string
   * @returns Adjusted quantity string or original if non-numeric
   */
  const calculateAdjustedQuantity = (quantity: string) => {
    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity)) return quantity;
    return (numericQuantity * ingredientQuantityMultiplier * (servings / (selectedRecipe?.servings || 4))).toFixed(1);
  };

  /**
   * Provides ingredient substitution suggestions for dietary preferences
   * 
   * Returns array of alternative ingredients for common cooking ingredients
   * to accommodate dietary restrictions and ingredient availability.
   * 
   * @param ingredient - Name of the ingredient to find substitutions for
   * @returns Array of substitute ingredient names
   */
  const getIngredientSubstitutions = (ingredient: string) => {
    // Comprehensive substitution database for common ingredients
    const substitutions: { [key: string]: string[] } = {
      'butter': ['coconut oil', 'olive oil', 'margarine'],
      'milk': ['almond milk', 'soy milk', 'oat milk'],
      'eggs': ['flax eggs', 'chia eggs', 'applesauce'],
      'flour': ['almond flour', 'coconut flour', 'oat flour'],
      'sugar': ['honey', 'maple syrup', 'stevia'],
      'salt': ['sea salt', 'himalayan salt', 'herb salt']
    };
    
    return substitutions[ingredient.toLowerCase()] || [];
  };

  /**
   * Formats recipe data into shareable text format
   * 
   * Creates a comprehensive, formatted text representation of the recipe
   * including all essential information for sharing across platforms.
   * 
   * @param recipe - Recipe object to format for sharing
   * @returns Formatted recipe string ready for sharing
   */
  const formatRecipeForSharing = (recipe: Recipe): string => {
    // Format ingredients list with bullets for readability
    const ingredientsList = recipe.ingredients
      .map(ing => `• ${ing.quantity} ${ing.unit} ${ing.name}`)
      .join('\n');
    
    // Format instructions with numbered steps
    const instructionsList = recipe.instructions
      .map((inst, i) => `${i + 1}. ${inst}`)
      .join('\n\n');

    // Include dietary information if available
    const dietaryInfo = recipe.dietaryTags.length > 0 
      ? `\n🥗 Dietary: ${recipe.dietaryTags.join(', ')}`
      : '';

    return `🍽️ ${recipe.title}

📝 ${recipe.description || 'A delicious recipe created with Smart Snap Feast'}

⏱️ Cook Time: ${recipe.cookTime} minutes
👥 Servings: ${recipe.servings}
🎯 Difficulty: ${recipe.difficulty}${dietaryInfo}

🛒 Ingredients:
${ingredientsList}

👨‍🍳 Instructions:
${instructionsList}

✨ Created with Smart Snap Feast - AI-powered recipe generation!`;
  };

  /**
   * Copies formatted recipe text to user's clipboard
   * 
   * Utilizes modern clipboard API with error handling and user feedback
   * through toast notifications for successful or failed operations.
   * 
   * @param text - Formatted recipe text to copy to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Recipe copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy recipe');
    }
  };

  /**
   * Opens email client with pre-formatted recipe content
   * 
   * Constructs mailto link with encoded recipe content for sharing
   * via user's default email application.
   * 
   * @param recipe - Recipe object to share via email
   */
  const shareViaEmail = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const subject = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
    const body = encodeURIComponent(recipeText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  /**
   * Opens SMS client with pre-formatted recipe content
   * 
   * Constructs SMS URI with encoded recipe content for sharing
   * via user's default messaging application.
   * 
   * @param recipe - Recipe object to share via SMS
   */
  const shareViaSMS = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const body = encodeURIComponent(`Check out this recipe: ${recipe.title}\n\n${recipeText}`);
    window.open(`sms:?body=${body}`);
  };

  /**
   * Opens WhatsApp with pre-formatted recipe content
   * 
   * Utilizes WhatsApp Web API to share formatted recipe content
   * directly through WhatsApp messaging platform.
   * 
   * @param recipe - Recipe object to share via WhatsApp
   */
  const shareViaWhatsApp = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const text = encodeURIComponent(recipeText);
    window.open(`https://wa.me/?text=${text}`);
  };

  /**
   * Opens Twitter with pre-formatted recipe tweet
   * 
   * Creates concise, engaging tweet content optimized for Twitter's
   * character limit while including key recipe information.
   * 
   * @param recipe - Recipe object to share via Twitter
   */
  const shareViaTwitter = (recipe: Recipe) => {
    const text = encodeURIComponent(`🍽️ Just discovered this amazing recipe: ${recipe.title}! ⏱️ ${recipe.cookTime} min | 👥 ${recipe.servings} servings | Created with Smart Snap Feast ✨`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  /**
   * Opens Facebook with pre-formatted recipe sharing content
   * 
   * Utilizes Facebook's sharing API to create engaging social media
   * posts with recipe information and app attribution.
   * 
   * @param recipe - Recipe object to share via Facebook
   */
  const shareViaFacebook = (recipe: Recipe) => {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`Check out this delicious recipe: ${recipe.title}! Created with Smart Snap Feast.`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`);
  };

  /**
   * Downloads recipe as formatted text file
   * 
   * Creates downloadable text file with complete recipe information
   * using browser's download functionality with proper filename generation.
   * 
   * @param recipe - Recipe object to download as text file
   */
  const downloadRecipe = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const blob = new Blob([recipeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Recipe downloaded successfully!');
  };

  /**
   * Central sharing method dispatcher
   * 
   * Routes sharing requests to appropriate platform-specific methods
   * based on user selection from sharing modal interface.
   * 
   * @param method - Sharing method identifier (copy, email, sms, etc.)
   */
  const handleShareRecipe = (method: string) => {
    if (!selectedRecipe) return;

    switch (method) {
      case 'copy':
        copyToClipboard(formatRecipeForSharing(selectedRecipe));
        break;
      case 'email':
        shareViaEmail(selectedRecipe);
        break;
      case 'sms':
        shareViaSMS(selectedRecipe);
        break;
      case 'whatsapp':
        shareViaWhatsApp(selectedRecipe);
        break;
      case 'twitter':
        shareViaTwitter(selectedRecipe);
        break;
      case 'facebook':
        shareViaFacebook(selectedRecipe);
        break;
      case 'download':
        downloadRecipe(selectedRecipe);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Recipe Collection Display Section - List and Grid Views */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Your Recipes
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Delicious recipes created just for you</p>
          </div>
          {/* View Mode Toggle - Switch between list and grid layouts */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 sm:px-3 py-1.5 h-auto rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-gray-900 hover:bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 sm:px-3 py-1.5 h-auto rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900 hover:bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        {/* Empty State Display */}
        {recipes.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">No recipes yet. Generate one to get started!</p>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              // Recipe List Item with comprehensive information display
              <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-all hover:border-orange-200" onClick={() => handleRecipeSelect(recipe)}>
                <div className="flex flex-col sm:flex-row gap-3 p-3">
                  <div className="relative w-full sm:w-20 h-40 sm:h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute top-1 right-1 bg-white/95 rounded-sm px-1.5 py-0.5 text-xs flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {recipe.cookTime}m
                    </div>
                    <div className="absolute bottom-1 right-1 bg-white/95 rounded-sm px-1.5 py-0.5 text-xs flex items-center gap-0.5">
                      <Users className="h-2.5 w-2.5" />
                      {recipe.servings}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base line-clamp-1">{recipe.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
                      {recipe.description || 'Crispy on the outside and cheesy on the inside, these vegetarian potato patties are paired perfectly...'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                        <ChefHat className="h-3 w-3" />
                        {recipe.difficulty}
                      </div>
                      {recipe.dietaryTags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs sm:text-sm bg-orange-50 text-orange-600 border-orange-200 px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.dietaryTags.length > 2 && (
                        <span className="text-sm text-muted-foreground">+{recipe.dietaryTags.length - 2}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col gap-1.5 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1.5 sm:py-1 h-auto flex-1 sm:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecipeSelect(recipe);
                      }}
                    >
                      View Recipe
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive text-xs px-3 py-1.5 sm:px-2 sm:py-1 h-auto flex-1 sm:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecipe(recipe.id, recipe.title);
                      }}
                    >
                      <Trash2 className="h-3 w-3 sm:mr-0" />
                      <span className="sm:hidden ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Recipe Grid Layout for visual browsing
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2">
            {recipes.map((recipe) => (
              // Compact Recipe Card for grid display
              <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-all hover:border-orange-200" onClick={() => handleRecipeSelect(recipe)}>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute top-1 right-1 bg-white/95 rounded px-1 py-0.5 text-xs flex items-center gap-0.5">
                    <Clock className="h-2 w-2" />
                    {recipe.cookTime}m
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white/95 rounded px-1 py-0.5 text-xs flex items-center gap-0.5">
                    <Users className="h-2 w-2" />
                    {recipe.servings}
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="font-medium text-foreground mb-1 text-xs sm:text-sm line-clamp-1">{recipe.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {recipe.description || 'Crispy on the outside and cheesy on the inside, these vegetarian potato patties are paired perfectly...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                        <ChefHat className="h-2.5 w-2.5" />
                        {recipe.difficulty}
                      </div>
                      {recipe.dietaryTags.slice(0, 1).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-orange-50 text-orange-600 border-orange-200 px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecipeSelect(recipe);
                        }}
                      >
                        <ChefHat className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive text-xs px-1 py-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id, recipe.title);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Recipe Detail Modal - Full cooking experience */}
      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg sm:text-xl font-semibold pr-8">{selectedRecipe.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Hero Recipe Image Display */}
              <div className="aspect-video sm:aspect-[3/1] w-full overflow-hidden rounded-lg bg-muted relative">
                {selectedRecipe.image && (
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Recipe Metadata and Description */}
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedRecipe.description || 'A delicious recipe created with your ingredients.'}
              </p>

              {/* Recipe Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <p className="font-medium text-xs sm:text-sm">{selectedRecipe.cookTime} min</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <p className="font-medium text-xs sm:text-sm">{servings} servings</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <ChefHat className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <p className="font-medium text-xs sm:text-sm capitalize">{selectedRecipe.difficulty}</p>
                </div>
              </div>

              {/* Tabbed Interface for Recipe Content and Tips */}
              <Tabs defaultValue="recipe" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recipe">Recipe</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recipe" className="space-y-4">
                  {/* Interactive Ingredients Checklist Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                      <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
                        🥘 Interactive Ingredients
                        <span className="text-xs sm:text-sm text-muted-foreground">({checkedIngredients.size}/{selectedRecipe.ingredients.length})</span>
                      </h4>
                      {/* Quantity Adjustment Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden sm:inline">Adjust quantities:</span>
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                          <button
                            onClick={() => setIngredientQuantityMultiplier(0.5)}
                            className={`px-2 py-1 text-xs rounded ${ingredientQuantityMultiplier === 0.5 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                          >
                            ½×
                          </button>
                          <button
                            onClick={() => setIngredientQuantityMultiplier(1)}
                            className={`px-2 py-1 text-xs rounded ${ingredientQuantityMultiplier === 1 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                          >
                            1×
                          </button>
                          <button
                            onClick={() => setIngredientQuantityMultiplier(2)}
                            className={`px-2 py-1 text-xs rounded ${ingredientQuantityMultiplier === 2 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                          >
                            2×
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dynamic Ingredient Checklist with Visual Feedback */}
                    <div className="space-y-2 bg-gradient-to-r from-gray-50 to-orange-50 p-4 rounded-lg border border-gray-200">
                      {selectedRecipe.ingredients.map((ingredient, index) => {
                        const ingredientId = `ingredient-${index}`;
                        const isChecked = checkedIngredients.has(ingredientId);
                        const substitutions = getIngredientSubstitutions(ingredient.name);
                        
                        return (
                          <div key={index} className={`group relative p-3 rounded-lg border-2 transition-all duration-200 ${
                            isChecked 
                              ? 'bg-green-50 border-green-200 shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-orange-200 hover:shadow-md'
                          }`}>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleIngredientCheck(ingredientId)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isChecked 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="h-3 w-3" />}
                              </button>
                              
                              <div className="flex-1">
                                <span className={`text-xs sm:text-sm font-medium ${
                                  isChecked ? 'line-through text-green-700' : 'text-gray-800'
                                }`}>
                                  {calculateAdjustedQuantity(ingredient.quantity)} {ingredient.unit} {ingredient.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Completion Celebration Message */}
                      {checkedIngredients.size === selectedRecipe.ingredients.length && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                          <span className="text-green-700 font-medium text-xs sm:text-sm">🎉 All ingredients ready! Time to cook!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Cooking Instructions Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                      <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
                        👨‍🍳 Step-by-Step Instructions
                        <span className="text-xs sm:text-sm text-muted-foreground">({completedSteps.size}/{selectedRecipe.instructions.length})</span>
                      </h4>
                      {/* Cooking Mode Toggle for Focused Experience */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant={cookingMode ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCookingMode(!cookingMode)}
                          className="text-xs"
                        >
                          {cookingMode ? 'Exit' : 'Enter'} Cooking Mode
                        </Button>
                      </div>
                    </div>
                    
                    {/* Visual Progress Tracking Bar */}
                    <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-300 ease-out"
                        style={{ width: `${(completedSteps.size / selectedRecipe.instructions.length) * 100}%` }}
                      />
                    </div>
                    
                    {/* Focused Current Step Display in Cooking Mode */}
                    {cookingMode && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Current: Step {currentStep + 1}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800">{selectedRecipe.instructions[currentStep]}</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => toggleStepCompletion(currentStep)}
                            disabled={completedSteps.has(currentStep)}
                            className="text-xs"
                          >
                            {completedSteps.has(currentStep) ? '✅ Completed' : 'Mark Complete'}
                          </Button>
                        </div>
                        
                        {/* Step Navigation Controls */}
                        <div className="flex justify-between mt-3 pt-3 border-t border-orange-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="text-xs"
                          >
                            ← Previous
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep(Math.min(selectedRecipe.instructions.length - 1, currentStep + 1))}
                            disabled={currentStep === selectedRecipe.instructions.length - 1}
                            className="text-xs"
                          >
                            Next →
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Complete Step-by-Step Instructions List */}
                    <div className="space-y-3">
                      {selectedRecipe.instructions.map((instruction, index) => {
                        const isCompleted = completedSteps.has(index);
                        const isCurrent = cookingMode && index === currentStep;
                        return (
                          <div key={index} className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            isCompleted 
                              ? 'bg-green-50 border-green-200 shadow-sm' 
                              : isCurrent
                              ? 'bg-orange-50 border-orange-300 shadow-md ring-2 ring-orange-200'
                              : 'bg-white border-gray-200 hover:border-orange-200 hover:shadow-md'
                          }`}>
                            <div className="flex gap-3">
                              <div className="relative">
                                <button
                                  onClick={() => toggleStepCompletion(index)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                    isCompleted 
                                      ? 'bg-green-500 text-white' 
                                      : isCurrent
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  }`}
                                >
                                  {isCompleted ? '✓' : index + 1}
                                </button>
                              </div>
                              
                              <div className="flex-1">
                                <p className={`text-xs sm:text-sm leading-relaxed mb-2 font-semibold ${
                                  isCompleted ? 'line-through text-green-700' : 'text-gray-800'
                                }`}>
                                  {instruction}
                                </p>
                                
                                {/* Interactive Controls */}
                                <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                                  isCurrent ? 'opacity-100' : ''
                                }`}>
                                  {!isCompleted && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleStepCompletion(index)}
                                      className="text-xs px-2 py-1 h-auto text-green-600 hover:bg-green-50"
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                  )}
                                  
                                  {!cookingMode && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentStep(index);
                                        setCookingMode(true);
                                      }}
                                      className="text-xs px-2 py-1 h-auto text-orange-600 hover:bg-orange-50"
                                    >
                                      <ChefHat className="h-3 w-3 mr-1" />
                                      Focus
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Recipe Completion Celebration */}
                      {completedSteps.size === selectedRecipe.instructions.length && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl text-center">
                          <div className="text-2xl mb-2">🎉</div>
                          <h5 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">Congratulations!</h5>
                          <p className="text-green-700 text-xs sm:text-sm">You've completed all cooking steps. Enjoy your delicious meal!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Personalized Cooking Tips Tab */}
                <TabsContent value="tips" className="space-y-6">
                  <TipPersonalizationPanel recipe={selectedRecipe} />
                </TabsContent>
              </Tabs>

              {/* Recipe Action Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm">Servings</span>
                  <Select value={servings.toString()} onValueChange={(value) => setServings(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base">
                  Save Recipe
                </Button>
                <Button variant="outline" onClick={() => setIsShareModalOpen(true)} className="text-sm sm:text-base">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Comprehensive Recipe Sharing Modal */}
      {selectedRecipe && (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2 pr-8">
                <Share2 className="h-5 w-5 text-orange-500" />
                Share Recipe: {selectedRecipe.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Recipe Preview Card for Sharing */}
              <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                <div className="bg-white rounded-lg p-3 sm:p-4 border shadow-sm">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    {selectedRecipe.image && (
                      <img
                        src={selectedRecipe.image}
                        alt={selectedRecipe.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{selectedRecipe.title}</h5>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {selectedRecipe.description || 'A delicious recipe created with Smart Snap Feast'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {selectedRecipe.cookTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {selectedRecipe.servings}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {selectedRecipe.difficulty}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedRecipe.dietaryTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-Platform Sharing Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Share Options</h4>
                
                {/* Quick Copy and Download Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start text-left"
                    onClick={() => handleShareRecipe('copy')}
                  >
                    <Copy className="h-4 w-4 mr-2 sm:mr-3 text-blue-500 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-xs sm:text-sm">Copy to Clipboard</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">Copy recipe text</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start text-left"
                    onClick={() => handleShareRecipe('download')}
                  >
                    <Download className="h-4 w-4 mr-2 sm:mr-3 text-green-500 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-xs sm:text-sm">Download</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">Save as text file</div>
                    </div>
                  </Button>
                </div>

                {/* Communication Platform Integration */}
                <div className="space-y-2">
                  <h5 className="font-medium text-xs sm:text-sm text-gray-700">Share via Apps</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-blue-50 text-left"
                      onClick={() => handleShareRecipe('email')}
                    >
                      <Mail className="h-4 w-4 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-xs sm:text-sm">Email</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Send via email app</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-green-50 text-left"
                      onClick={() => handleShareRecipe('whatsapp')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-xs sm:text-sm">WhatsApp</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Share on WhatsApp</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-gray-50 text-left"
                      onClick={() => handleShareRecipe('sms')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 sm:mr-3 text-gray-600 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-xs sm:text-sm">SMS</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Send as text message</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Social Media Platform Integration */}
                <div className="space-y-2">
                  <h5 className="font-medium text-xs sm:text-sm text-gray-700">Social Media</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-blue-50 text-left"
                      onClick={() => handleShareRecipe('twitter')}
                    >
                      <Twitter className="h-4 w-4 mr-2 sm:mr-3 text-blue-500 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-xs sm:text-sm">Twitter</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Tweet recipe</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-blue-50 text-left"
                      onClick={() => handleShareRecipe('facebook')}
                    >
                      <Facebook className="h-4 w-4 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-xs sm:text-sm">Facebook</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Share on Facebook</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Native Browser Sharing API Integration */}
                {navigator.share && (
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedRecipe.title,
                          text: selectedRecipe.description || 'Check out this amazing recipe!',
                          url: window.location.href,
                        }).catch((error) => console.log('Error sharing:', error));
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    More sharing options
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
