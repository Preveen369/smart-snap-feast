import { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, Trash2, List, Grid3X3, Sparkles, Star, CheckCircle2, AlertTriangle, Heart, Lightbulb, Award, Timer, TrendingUp, Utensils, Share2, Copy, Mail, MessageCircle, Facebook, Twitter, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(4);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [enhancements, setEnhancements] = useState<any>(null);
  const [loadingEnhancements, setLoadingEnhancements] = useState(false);
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set());
  const [favoriteTips, setFavoriteTips] = useState<Set<string>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const [selectedTipCategory, setSelectedTipCategory] = useState<string>('all');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [cookingMode, setCookingMode] = useState<boolean>(false);
  const [ingredientQuantityMultiplier, setIngredientQuantityMultiplier] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const handleDeleteRecipe = (recipeId: string, recipeTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      onDeleteRecipe(recipeId);
      toast.success('Recipe deleted successfully');
      
      // Close modal if the deleted recipe is currently selected
      if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe(null);
      }
    }
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setEnhancements(null);
    setLoadingEnhancements(true);
    setCompletedTips(new Set());
    setFavoriteTips(new Set());
    setExpandedTips(new Set());
    setSelectedTipCategory('all');
    setCheckedIngredients(new Set());
    setCompletedSteps(new Set());
    setCurrentStep(0);

    setCookingMode(false);
    setIngredientQuantityMultiplier(1);

    try {
      const recipeEnhancements = await aiService.getRecipeEnhancements(recipe);
      setEnhancements(recipeEnhancements);
    } catch (error) {
      console.error('Error loading recipe enhancements:', error);
      toast.error('Failed to load additional recipe information');
    } finally {
      setLoadingEnhancements(false);
    }
  };

  const toggleTipCompletion = (tipId: string) => {
    const newCompleted = new Set(completedTips);
    if (newCompleted.has(tipId)) {
      newCompleted.delete(tipId);
      toast.success('Tip unmarked as completed');
    } else {
      newCompleted.add(tipId);
      toast.success('Great job! Tip marked as completed 🎉');
    }
    setCompletedTips(newCompleted);
  };

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

  const toggleTipExpansion = (tipId: string) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId);
    } else {
      newExpanded.add(tipId);
    }
    setExpandedTips(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'preparation': return <ChefHat className="h-4 w-4" />;
      case 'cooking': return <Timer className="h-4 w-4" />;
      case 'flavor': return <Sparkles className="h-4 w-4" />;
      case 'storage': return <Users className="h-4 w-4" />;
      case 'technique': return <TrendingUp className="h-4 w-4" />;
      case 'presentation': return <Award className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

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

  const toggleStepCompletion = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
      toast.success('Step unmarked');
    } else {
      newCompleted.add(stepIndex);
      toast.success(`Step ${stepIndex + 1} completed! 🎉`);
      // Auto-advance to next step
      if (stepIndex === currentStep && stepIndex < (selectedRecipe?.instructions.length || 0) - 1) {
        setCurrentStep(stepIndex + 1);
      }
    }
    setCompletedSteps(newCompleted);
  };



  const calculateAdjustedQuantity = (quantity: string) => {
    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity)) return quantity;
    return (numericQuantity * ingredientQuantityMultiplier * (servings / (selectedRecipe?.servings || 4))).toFixed(1);
  };

  const getIngredientSubstitutions = (ingredient: string) => {
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

  // Share recipe helper functions
  const formatRecipeForSharing = (recipe: Recipe): string => {
    const ingredientsList = recipe.ingredients
      .map(ing => `• ${ing.quantity} ${ing.unit} ${ing.name}`)
      .join('\n');
    
    const instructionsList = recipe.instructions
      .map((inst, i) => `${i + 1}. ${inst}`)
      .join('\n\n');

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Recipe copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy recipe');
    }
  };

  const shareViaEmail = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const subject = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
    const body = encodeURIComponent(recipeText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const body = encodeURIComponent(`Check out this recipe: ${recipe.title}\n\n${recipeText}`);
    window.open(`sms:?body=${body}`);
  };

  const shareViaWhatsApp = (recipe: Recipe) => {
    const recipeText = formatRecipeForSharing(recipe);
    const text = encodeURIComponent(recipeText);
    window.open(`https://wa.me/?text=${text}`);
  };

  const shareViaTwitter = (recipe: Recipe) => {
    const text = encodeURIComponent(`🍽️ Just discovered this amazing recipe: ${recipe.title}! ⏱️ ${recipe.cookTime} min | 👥 ${recipe.servings} servings | Created with Smart Snap Feast ✨`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  const shareViaFacebook = (recipe: Recipe) => {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`Check out this delicious recipe: ${recipe.title}! Created with Smart Snap Feast.`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`);
  };

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
    <div className="space-y-6">
      {/* Your Recipes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-500" />
              Your Recipes
            </h3>
            <p className="text-sm text-muted-foreground">Delicious recipes created just for you</p>
          </div>
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1.5 h-auto rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-gray-900 hover:bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1.5 h-auto rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900 hover:bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {recipes.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">No recipes yet. Generate one to get started!</p>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-all hover:border-orange-200" onClick={() => handleRecipeSelect(recipe)}>
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute top-1 right-1 bg-white/95 rounded-sm px-1 py-0.5 text-xs flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {recipe.cookTime}m
                    </div>
                    <div className="absolute bottom-1 right-1 bg-white/95 rounded-sm px-1 py-0.5 text-xs flex items-center gap-0.5">
                      <Users className="h-2.5 w-2.5" />
                      {recipe.servings}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 text-base line-clamp-1">{recipe.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
                      {recipe.description || 'Crispy on the outside and cheesy on the inside, these vegetarian potato patties are paired perfectly...'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                        <ChefHat className="h-3 w-3" />
                        {recipe.difficulty}
                      </div>
                      {recipe.dietaryTags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm bg-orange-50 text-orange-600 border-orange-200 px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.dietaryTags.length > 2 && (
                        <span className="text-sm text-muted-foreground">+{recipe.dietaryTags.length - 2}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 h-auto"
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
                      className="text-destructive hover:text-destructive text-xs px-2 py-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecipe(recipe.id, recipe.title);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {recipes.map((recipe) => (
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
                  <h4 className="font-medium text-foreground mb-1 text-sm line-clamp-1">{recipe.title}</h4>
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

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-xl font-semibold">{selectedRecipe.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Recipe Image */}
              <div className="aspect-[3/1] w-full overflow-hidden rounded-lg bg-muted relative">
                {selectedRecipe.image && (
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Recipe Info */}
              <p className="text-muted-foreground">
                {selectedRecipe.description || 'A delicious recipe created with your ingredients.'}
              </p>

              <div className="grid grid-cols-3 gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <Clock className="h-3 w-3" />
                  </div>
                  <p className="font-medium text-sm">{selectedRecipe.cookTime} min</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <Users className="h-3 w-3" />
                  </div>
                  <p className="font-medium text-sm">{servings} servings</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <ChefHat className="h-3 w-3" />
                  </div>
                  <p className="font-medium text-sm capitalize">{selectedRecipe.difficulty}</p>
                </div>
              </div>

              <Tabs defaultValue="recipe" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recipe">Recipe</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recipe" className="space-y-4">
                  {/* Interactive Ingredients */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-base flex items-center gap-2">
                        🥘 Interactive Ingredients
                        <span className="text-sm text-muted-foreground">({checkedIngredients.size}/{selectedRecipe.ingredients.length})</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Adjust quantities:</span>
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
                                <span className={`text-sm font-medium ${
                                  isChecked ? 'line-through text-green-700' : 'text-gray-800'
                                }`}>
                                  {calculateAdjustedQuantity(ingredient.quantity)} {ingredient.unit} {ingredient.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {checkedIngredients.size === selectedRecipe.ingredients.length && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                          <span className="text-green-700 font-medium">🎉 All ingredients ready! Time to cook!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Instructions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-base flex items-center gap-2">
                        👨‍🍳 Step-by-Step Instructions
                        <span className="text-sm text-muted-foreground">({completedSteps.size}/{selectedRecipe.instructions.length})</span>
                      </h4>
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
                    
                    {/* Progress Bar */}
                    <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-300 ease-out"
                        style={{ width: `${(completedSteps.size / selectedRecipe.instructions.length) * 100}%` }}
                      />
                    </div>
                    
                    {/* Current Step Highlight in Cooking Mode */}
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
                        
                        {/* Navigation */}
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
                                <p className={`text-sm leading-relaxed mb-2 font-semibold ${
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
                      
                      {completedSteps.size === selectedRecipe.instructions.length && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl text-center">
                          <div className="text-2xl mb-2">🎉</div>
                          <h5 className="font-semibold text-green-800 mb-1">Congratulations!</h5>
                          <p className="text-green-700 text-sm">You've completed all cooking steps. Enjoy your delicious meal!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>



                <TabsContent value="tips" className="space-y-6">
                  {loadingEnhancements ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                      <p className="text-sm text-muted-foreground mt-4">🧑‍🍳 Our AI chef is preparing personalized tips for you...</p>
                    </div>
                  ) : enhancements?.cookingTips ? (
                    <div className="space-y-6">
                      {/* Progress Header */}
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-orange-500" />
                            Interactive Cooking Tips
                          </h5>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{completedTips.size}</span>
                            <span className="text-muted-foreground">completed</span>
                          </div>
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                          {['all', 'preparation', 'cooking', 'flavor', 'technique'].map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedTipCategory(category)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedTipCategory === category
                                  ? 'bg-orange-500 text-white shadow-sm'
                                  : 'bg-white text-gray-600 hover:bg-orange-100 border'
                              }`}
                            >
                              {category === 'all' ? 'All Tips' : category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* General Tips */}
                      {enhancements.cookingTips.generalTips && (
                        <div className="space-y-3">
                          <h6 className="font-medium text-base flex items-center gap-2 text-gray-700">
                            <Lightbulb className="h-4 w-4 text-orange-500" />
                            Essential Cooking Tips
                          </h6>
                          {enhancements.cookingTips.generalTips
                            .filter((tip: any) => selectedTipCategory === 'all' || tip.category === selectedTipCategory)
                            .map((tip: any, index: number) => {
                              const tipId = `general-${index}`;
                              const isCompleted = completedTips.has(tipId);
                              const isFavorite = favoriteTips.has(tipId);
                              const isExpanded = expandedTips.has(tipId);
                              
                              return (
                                <div key={tipId} className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                  isCompleted 
                                    ? 'bg-green-50 border-green-200 shadow-sm' 
                                    : 'bg-white border-gray-200 hover:border-orange-200 hover:shadow-md'
                                }`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(tip.category)}
                                        <h5 className={`font-medium ${isCompleted ? 'line-through text-green-700' : 'text-gray-800'}`}>
                                          {tip.title}
                                        </h5>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                                          {tip.difficulty}
                                        </span>
                                        {tip.importance === 'high' && (
                                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        )}
                                      </div>
                                      
                                      <p className={`text-sm leading-relaxed ${isCompleted ? 'text-green-600' : 'text-gray-600'} ${
                                        !isExpanded ? 'line-clamp-2' : ''
                                      }`}>
                                        {tip.content}
                                      </p>
                                      
                                      {tip.estimatedTime && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                          <Timer className="h-3 w-3" />
                                          {tip.estimatedTime}
                                        </div>
                                      )}
                                      
                                      {tip.content.length > 100 && (
                                        <button
                                          onClick={() => toggleTipExpansion(tipId)}
                                          className="text-xs text-orange-500 hover:text-orange-600 mt-1 font-medium"
                                        >
                                          {isExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => toggleTipCompletion(tipId)}
                                        className={`p-1.5 rounded-full transition-colors ${
                                          isCompleted 
                                            ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                            : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                                        }`}
                                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
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
                              );
                            })}
                        </div>
                      )}

                      {/* Pro Tips */}
                      {enhancements.cookingTips.proTips && enhancements.cookingTips.proTips.length > 0 && (
                        <div className="space-y-3">
                          <h6 className="font-medium text-base flex items-center gap-2 text-gray-700">
                            <Award className="h-4 w-4 text-purple-500" />
                            Professional Chef Secrets
                          </h6>
                          {enhancements.cookingTips.proTips.map((tip: any, index: number) => {
                            const tipId = `pro-${index}`;
                            const isCompleted = completedTips.has(tipId);
                            const isFavorite = favoriteTips.has(tipId);
                            
                            return (
                              <div key={tipId} className={`group relative p-4 rounded-xl border-2 bg-gradient-to-r from-purple-50 to-indigo-50 ${
                                isCompleted ? 'border-purple-300' : 'border-purple-200 hover:border-purple-300'
                              } transition-all duration-200`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Award className="h-4 w-4 text-purple-500" />
                                      <h5 className={`font-medium ${isCompleted ? 'line-through text-purple-700' : 'text-gray-800'}`}>
                                        {tip.title}
                                      </h5>
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                        Chef Secret
                                      </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${isCompleted ? 'text-purple-600' : 'text-gray-600'}`}>
                                      {tip.content}
                                    </p>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => toggleTipCompletion(tipId)}
                                      className={`p-1.5 rounded-full transition-colors ${
                                        isCompleted 
                                          ? 'text-purple-600 bg-purple-100 hover:bg-purple-200' 
                                          : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
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
                            );
                          })}
                        </div>
                      )}

                      {/* Common Mistakes */}
                      {enhancements.cookingTips.commonMistakes && enhancements.cookingTips.commonMistakes.length > 0 && (
                        <div className="space-y-3">
                          <h6 className="font-medium text-base flex items-center gap-2 text-gray-700">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Avoid These Common Mistakes
                          </h6>
                          {enhancements.cookingTips.commonMistakes.map((mistake: any, index: number) => (
                            <div key={index} className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <span className="font-medium text-amber-800">Mistake: </span>
                                    <span className="text-amber-700">{mistake.mistake}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-800">Solution: </span>
                                    <span className="text-green-700">{mistake.solution}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-800">Prevention: </span>
                                    <span className="text-blue-700">{mistake.prevention}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Flavor Pairings */}
                      {enhancements.cookingTips.flavorPairings && enhancements.cookingTips.flavorPairings.length > 0 && (
                        <div className="space-y-3">
                          <h6 className="font-medium text-base flex items-center gap-2 text-gray-700">
                            <Sparkles className="h-4 w-4 text-pink-500" />
                            Perfect Flavor Combinations
                          </h6>
                          {enhancements.cookingTips.flavorPairings.map((pairing: any, index: number) => (
                            <div key={index} className="p-4 rounded-xl bg-pink-50 border border-pink-200">
                              <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-pink-800 capitalize">{pairing.ingredient}</span>
                                    <span className="text-pink-600">pairs beautifully with:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {pairing.pairs.map((pair: string, pairIndex: number) => (
                                      <span key={pairIndex} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                                        {pair}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-sm text-pink-700 italic">{pairing.why}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Completion Summary */}
                      {completedTips.size > 0 && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">
                              Great progress! You've completed {completedTips.size} tip{completedTips.size !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg mb-2">No cooking tips available</p>
                      <p className="text-sm">Our AI chef is still learning about this recipe!</p>
                    </div>
                  )}
                </TabsContent>


              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Servings</span>
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
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Save Recipe
                </Button>
                <Button variant="outline" onClick={() => setIsShareModalOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Recipe Modal */}
      {selectedRecipe && (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5 text-orange-500" />
                Share Recipe: {selectedRecipe.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Recipe Card Display */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    {selectedRecipe.image && (
                      <img
                        src={selectedRecipe.image}
                        alt={selectedRecipe.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{selectedRecipe.title}</h5>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {selectedRecipe.description || 'A delicious recipe created with Smart Snap Feast'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedRecipe.cookTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedRecipe.servings}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
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

              {/* Share Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Share Options</h4>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start"
                    onClick={() => handleShareRecipe('copy')}
                  >
                    <Copy className="h-4 w-4 mr-3 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Copy to Clipboard</div>
                      <div className="text-xs text-muted-foreground">Copy recipe text</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start"
                    onClick={() => handleShareRecipe('download')}
                  >
                    <Download className="h-4 w-4 mr-3 text-green-500" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Download</div>
                      <div className="text-xs text-muted-foreground">Save as text file</div>
                    </div>
                  </Button>
                </div>

                {/* Communication Apps */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-gray-700">Share via Apps</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-blue-50"
                      onClick={() => handleShareRecipe('email')}
                    >
                      <Mail className="h-4 w-4 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium text-sm">Email</div>
                        <div className="text-xs text-muted-foreground">Send via email app</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-green-50"
                      onClick={() => handleShareRecipe('whatsapp')}
                    >
                      <MessageCircle className="h-4 w-4 mr-3 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium text-sm">WhatsApp</div>
                        <div className="text-xs text-muted-foreground">Share on WhatsApp</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-gray-50"
                      onClick={() => handleShareRecipe('sms')}
                    >
                      <MessageCircle className="h-4 w-4 mr-3 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium text-sm">SMS</div>
                        <div className="text-xs text-muted-foreground">Send as text message</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-gray-700">Social Media</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-blue-50"
                      onClick={() => handleShareRecipe('twitter')}
                    >
                      <Twitter className="h-4 w-4 mr-3 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium text-sm">Twitter</div>
                        <div className="text-xs text-muted-foreground">Tweet recipe</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="justify-start h-auto p-3 hover:bg-blue-50"
                      onClick={() => handleShareRecipe('facebook')}
                    >
                      <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium text-sm">Facebook</div>
                        <div className="text-xs text-muted-foreground">Share on Facebook</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Native Share (if supported) */}
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
