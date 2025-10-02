import { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ingredient, Recipe } from '@/types/recipe';
import { toast } from 'sonner';

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
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
    'keto', 'paleo', 'low-carb', 'high-protein'
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

  const generateMockRecipe = () => {
    if (ingredients.length === 0) {
      toast.error('Add some ingredients first!');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const selectedIngredients = ingredients.slice(0, Math.min(6, ingredients.length));
      
      const mockRecipe: Recipe = {
        id: Date.now().toString(),
        title: 'Cheesy Potato Patties with Soy Mayo Drizzle',
        description: 'Crispy on the outside and cheesy on the inside, these vegetarian potato patties are paired perfectly with a tangy soy mayo drizzle.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80',
        cookTime: 20,
        difficulty: 'medium',
        servings: 4,
        ingredients: [
          { name: '2 large potatoes', quantity: '2', unit: 'large' },
          { name: 'cheddar cheese, grated', quantity: '1', unit: 'cup' },
          { name: 'soy sauce', quantity: '2', unit: 'tablespoons' },
          { name: 'mayonnaise', quantity: '3', unit: 'tablespoons' },
          { name: 'tomato ketchup', quantity: '2', unit: 'tablespoons' },
          { name: 'vegetable oil (for frying)', quantity: '1', unit: 'tablespoon' }
        ],
        instructions: [
          'Squeeze excess moisture from the grated potatoes using a clean kitchen towel.',
          'In a mixing bowl, combine the grated potatoes with the grated cheese.',
          'Add 1 tablespoon of soy sauce to the potato and cheese mixture and mix well.',
          'Form the mixture into small patties, about the size of the palm of your hand.',
          'Heat the vegetable oil in a non-stick frying pan over medium heat.',
          'Fry the patties for about 3-4 minutes on each side until golden brown and crispy.',
          'While the patties are frying, prepare the drizzle by mixing 2 tablespoons of mayonnaise with 1 tablespoon of soy sauce and 2 tablespoons of tomato ketchup in a small bowl.',
          'Once the patties are cooked, remove them from the pan and place them on a paper towel to remove excess oil.',
          'Drizzle the soy mayo over the warm patties before serving.'
        ],
        dietaryTags: selectedDietary.length > 0 ? selectedDietary : ['vegetarian'],
        createdAt: Date.now(),
      };

      onGenerateRecipe(mockRecipe);
      setIsGenerating(false);
      toast.success('Recipe generated!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-orange-500">
            <Plus className="h-5 w-5" />
            <h2 className="text-lg font-semibold">My Pantry</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Add ingredients you have available
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
            <h3 className="text-lg font-semibold">Dietary Preferences</h3>
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
              onClick={generateMockRecipe} 
              disabled={isGenerating} 
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Recipe'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
