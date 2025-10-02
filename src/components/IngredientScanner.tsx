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
  const [inputValue, setInputValue] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [maxTime, setMaxTime] = useState<string>('15 min');
  const [isGenerating, setIsGenerating] = useState(false);

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'Dairy Food', 
    'keto', 'Non-Veg', 'low-carb', 'high-protein'
  ];

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    if (checked) {
      setSelectedDietary([...selectedDietary, dietary]);
    } else {
      setSelectedDietary(selectedDietary.filter(d => d !== dietary));
    }
  };



  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast.error('Add some ingredients first!');
      return;
    }

    setIsGenerating(true);

    try {
      const maxTimeNum = parseInt(maxTime.replace(' min', ''));
      const recipe = await aiService.generateRecipe(ingredients, {
        dietaryRestrictions: selectedDietary,
        maxTime: maxTimeNum,
        difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        servings: 4,
      });

      onGenerateRecipe(recipe);
      toast.success('AI recipe generated successfully!');
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">

      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-black">My Pantry</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Add ingredients manually or from AI scan
          </p>

          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add ingredient..."
              className="flex-1"
            />
            <Button 
              onClick={handleAdd} 
              size="icon"
              className="bg-orange-500 hover:bg-orange-600 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            {ingredients.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-muted-foreground text-sm">No ingredients yet. Add some to get started!</p>
              </div>
            ) : (
              ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center gap-3 p-1.5 rounded hover:bg-muted/50">
                  <Checkbox id={ingredient.id} defaultChecked />
                  <label 
                    htmlFor={ingredient.id} 
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {ingredient.name}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveIngredient(ingredient.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          {/* Dietary Preferences Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Dietary Preferences
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {dietaryOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option}
                    checked={selectedDietary.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                  />
                  <label htmlFor={option} className="text-sm cursor-pointer capitalize">
                    {option.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe Generation Controls */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Max Cook Time</label>
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

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Difficulty</label>
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

            <Button 
              onClick={generateRecipe} 
              disabled={isGenerating} 
              className="w-full bg-orange-500 hover:bg-orange-600"
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
