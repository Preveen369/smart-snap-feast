/**
 * IngredientScanner - Interactive ingredient management and recipe generation component
 * 
 * Provides a comprehensive interface for managing ingredients and generating AI-powered recipes.
 * Features manual ingredient input, dietary preference selection, cooking parameters,
 * and intelligent recipe generation with custom AI-generated images.
 * 
 * @component
 */

import { useState } from 'react';
import { Plus, Trash2, Sparkles, Package, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ingredient, Recipe } from '@/types/recipe';
import { toast } from 'sonner';
import { aiService } from '@/services/ai';

interface IngredientScannerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Ingredient) => void;
  onRemoveIngredient: (id: string) => void;
  onGenerateRecipe: (recipe: Recipe) => void;
}

export function IngredientScanner({ ingredients, onAddIngredient, onRemoveIngredient, onGenerateRecipe }: IngredientScannerProps) {
  // Component state management for user input and preferences
  const [inputValue, setInputValue] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [maxTime, setMaxTime] = useState<string>('15 min');
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Available dietary restriction options for recipe filtering
   * Includes common dietary preferences and restrictions
   */
  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'Dairy Food', 
    'keto', 'Non-Veg', 'low-carb', 'high-protein'
  ];

  /**
   * Handles adding a new ingredient to the pantry
   * Creates a new ingredient object with unique ID and timestamp
   */
  const handleAdd = () => {
    if (!inputValue.trim()) return;

    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: inputValue.trim(),
      addedAt: Date.now(),
    };

    onAddIngredient(newIngredient);
    setInputValue('');
  };

  /**
   * Handles Enter key press for quick ingredient addition
   * Provides keyboard accessibility for the add ingredient feature
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  /**
   * Manages dietary preference selection state
   * Updates the selected dietary restrictions array based on user interaction
   * 
   * @param dietary - The dietary option being toggled
   * @param checked - Whether the option is being selected or deselected
   */
  const handleDietaryChange = (dietary: string, checked: boolean) => {
    if (checked) {
      setSelectedDietary([...selectedDietary, dietary]);
    } else {
      setSelectedDietary(selectedDietary.filter(d => d !== dietary));
    }
  };

  /**
   * Generates an AI-powered recipe based on selected ingredients and preferences
   * 
   * Orchestrates the entire recipe generation process including:
   * - Input validation
   * - AI service communication
   * - Progress feedback with toast notifications
   * - Error handling and user feedback
   * - Success confirmation with appropriate messaging
   */
  const generateRecipe = async () => {
    // Validate that ingredients are available before proceeding
    if (ingredients.length === 0) {
      toast.error('Add some ingredients first!');
      return;
    }

    setIsGenerating(true);

    try {
      // Parse time constraint from string format
      const maxTimeNum = parseInt(maxTime.replace(' min', ''));
      
      // Provide user feedback for longer operations (image generation)
      setTimeout(() => {
        if (isGenerating) {
          toast.info('🎨 Generating recipe image with AI...');
        }
      }, 2000);

      // Call AI service with user preferences and constraints
      const recipe = await aiService.generateRecipe(ingredients, {
        dietaryRestrictions: selectedDietary,
        maxTime: maxTimeNum,
        difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        servings: 4,
      });

      onGenerateRecipe(recipe);
      
      // Provide contextual success feedback based on generated content
      if (recipe.image && recipe.image.startsWith('blob:')) {
        toast.success('🎨 AI recipe with custom image generated successfully!');
      } else {
        toast.success('AI recipe generated successfully!');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pantry Management Section - Ingredient input and display */}
      <Card className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Section header with descriptive icon and title */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            <h2 className="text-base sm:text-lg font-semibold text-black">My Pantry</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Add ingredients manually or from AI scan
          </p>

          {/* Ingredient input controls with add button */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add ingredient..."
              className="flex-1 text-sm sm:text-base"
            />
            <Button 
              onClick={handleAdd} 
              size="icon"
              className="bg-orange-500 hover:bg-orange-600 shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Dynamic ingredient list display with empty state */}
          <div className="space-y-1">
            {ingredients.length === 0 ? (
              <div className="py-6 sm:py-4 text-center">
                <p className="text-muted-foreground text-xs sm:text-sm">No ingredients yet. Add some to get started!</p>
              </div>
            ) : (
              ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-1.5 rounded hover:bg-muted/50">
                  <Checkbox id={ingredient.id} defaultChecked className="h-4 w-4 sm:h-5 sm:w-5" />
                  <label 
                    htmlFor={ingredient.id} 
                    className="flex-1 text-xs sm:text-sm cursor-pointer"
                  >
                    {ingredient.name}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-6 sm:w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveIngredient(ingredient.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Recipe Generation Controls - Preferences and parameters */}
      <Card className="p-3 sm:p-4">
        <div className="space-y-4">
          {/* Dietary Preferences Selection Grid */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Dietary Preferences
            </h3>
            {/* Grid layout for dietary options with checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2">
              {dietaryOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option}
                    checked={selectedDietary.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <label htmlFor={option} className="text-xs sm:text-sm cursor-pointer capitalize">
                    {option.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe Generation Controls - Time and difficulty constraints */}
          <div className="space-y-3">
            {/* Two-column grid for cooking parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Maximum cooking time selector */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">Max Cook Time</label>
                <Select value={maxTime} onValueChange={setMaxTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 min">15 min</SelectItem>
                    <SelectItem value="30 min">30 min</SelectItem>
                    <SelectItem value="60 min">60 min</SelectItem>
                    <SelectItem value="120 min">120 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipe difficulty level selector */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Primary action button for AI recipe generation */}
            <Button 
              onClick={generateRecipe} 
              disabled={isGenerating} 
              className="w-full bg-orange-500 hover:bg-orange-600 h-10 sm:h-11 text-sm sm:text-base"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate AI Recipe'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
