import { useState } from 'react';
import { ChefHat, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Smart Snap Feast</h1>
          <p className="text-muted-foreground">Create amazing recipes with what you have</p>
        </div>

        <Tabs defaultValue="pantry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pantry" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pantry
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pantry">
            <IngredientScanner
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
            />
          </TabsContent>

          <TabsContent value="recipes">
            <RecipeGenerator
              ingredients={ingredients}
              recipes={recipes}
              onGenerateRecipe={handleGenerateRecipe}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
