import { useState } from 'react';
import { ChefHat, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Recipe, Ingredient, DietaryFilter, DifficultyFilter } from '@/types/recipe';
import { toast } from 'sonner';

interface RecipeGeneratorProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onGenerateRecipe: (recipe: Recipe) => void;
}

export function RecipeGenerator({ ingredients, recipes, onGenerateRecipe }: RecipeGeneratorProps) {
  const [dietary, setDietary] = useState<DietaryFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [maxTime, setMaxTime] = useState<string>('60');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMockRecipe = () => {
    if (ingredients.length === 0) {
      toast.error('Add some ingredients first!');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedIngredients = ingredients.slice(0, Math.min(5, ingredients.length));
      
      const mockRecipe: Recipe = {
        id: Date.now().toString(),
        title: `Delicious ${selectedIngredients[0].name} Dish`,
        image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`,
        cookTime: parseInt(maxTime) > 30 ? 30 : 15,
        difficulty: difficulty === 'all' ? 'medium' : difficulty,
        servings: 4,
        ingredients: selectedIngredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity || '1',
          unit: ing.unit || 'piece',
        })),
        instructions: [
          'Prepare all ingredients',
          'Cook according to preference',
          'Season to taste',
          'Serve hot and enjoy!',
        ],
        dietaryTags: dietary !== 'all' ? [dietary] : [],
        createdAt: Date.now(),
      };

      onGenerateRecipe(mockRecipe);
      setIsGenerating(false);
      toast.success('Recipe generated!');
    }, 1500);
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (dietary !== 'all' && !recipe.dietaryTags.includes(dietary)) return false;
    if (difficulty !== 'all' && recipe.difficulty !== difficulty) return false;
    if (recipe.cookTime > parseInt(maxTime)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Generate Recipe</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Dietary</label>
            <Select value={dietary} onValueChange={(value) => setDietary(value as DietaryFilter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                <SelectItem value="dairy-free">Dairy-Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyFilter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Max Time (min)</label>
            <Select value={maxTime} onValueChange={setMaxTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="120">120 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateMockRecipe} disabled={isGenerating} className="w-full">
          <ChefHat className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Recipe'}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Your Recipes</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-muted-foreground">No recipes yet. Generate one to get started!</p>
            </Card>
          ) : (
            filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <h4 className="font-semibold text-foreground">{recipe.title}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {recipe.dietaryTags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {recipe.cookTime} min
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    {recipe.difficulty}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    {recipe.ingredients.length} ingredients • Serves {recipe.servings}
                  </p>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
