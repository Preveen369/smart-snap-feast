import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { IngredientScanner } from '@/components/IngredientScanner';
import { RecipeGenerator } from '@/components/RecipeGenerator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Ingredient, Recipe } from '@/types/recipe';

const Index = () => {
  const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>('pantry-ingredients', []);
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('generated-recipes', []);

  const handleAddIngredient = (ingredient: Ingredient) => {
    setIngredients([...ingredients, ingredient]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleGenerateRecipe = (recipe: Recipe) => {
    setRecipes([recipe, ...recipes]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kitchen Wizard</h1>
              <p className="text-sm text-muted-foreground">Smart recipes from your pantry</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-8">
          <div>
            <IngredientScanner
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              onGenerateRecipe={handleGenerateRecipe}
            />
          </div>
          <div>
            <RecipeGenerator
              ingredients={ingredients}
              recipes={recipes}
              onGenerateRecipe={handleGenerateRecipe}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
