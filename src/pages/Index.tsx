import { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';
import { IngredientScanner } from '@/components/IngredientScanner';
import { RecipeGenerator } from '@/components/RecipeGenerator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRecipes } from '@/hooks/useFirebase';
import { Ingredient, Recipe } from '@/types/recipe';
import { toast } from 'sonner';

const Index = () => {
  // Use a consistent user ID (in production, this would come from authentication)
  const USER_ID = 'demo-user-001';
  
  const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>('pantry-ingredients', []);
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('generated-recipes', []);
  
  // Firebase hooks for cloud storage
  const { 
    recipes: firebaseRecipes, 
    addRecipe: saveToFirebase, 
    deleteRecipe: deleteFromFirebase,
    loading: firebaseLoading 
  } = useRecipes(USER_ID);

  const handleAddIngredient = (ingredient: Ingredient) => {
    setIngredients([...ingredients, ingredient]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleGenerateRecipe = async (recipe: Recipe) => {
    try {
      // Save to Firebase first to get the Firebase ID
      const firebaseRecipe = {
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        dietaryTags: recipe.dietaryTags,
        userId: USER_ID,
      };
      
      const firebaseId = await saveToFirebase(firebaseRecipe);
      
      // Update the recipe with Firebase ID and save to local storage
      const recipeWithFirebaseId = {
        ...recipe,
        firebaseId, // Store Firebase ID for easy deletion later
      };
      
      setRecipes([recipeWithFirebaseId, ...recipes]);
      toast.success('Recipe saved successfully! ☁️');
    } catch (error) {
      console.error('Failed to save recipe to Firebase:', error);
      // Still save to local storage even if Firebase fails
      setRecipes([recipe, ...recipes]);
      toast.error('Recipe saved locally, but cloud sync failed');
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      // Find the recipe to delete
      const recipeToDelete = recipes.find(r => r.id === recipeId);
      
      // Delete from local storage
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      
      // Delete from Firebase using the stored firebaseId
      if (recipeToDelete?.firebaseId) {
        await deleteFromFirebase(recipeToDelete.firebaseId);
        toast.success('Recipe deleted successfully! 🗑️');
      } else if (recipeToDelete) {
        // Fallback: Try to find by matching title and userId
        const firebaseRecipe = firebaseRecipes.find(
          r => r.title === recipeToDelete.title && r.userId === USER_ID
        );
        
        if (firebaseRecipe?.id) {
          await deleteFromFirebase(firebaseRecipe.id);
          toast.success('Recipe deleted successfully! 🗑️');
        } else {
          toast.success('Recipe removed from local storage');
        }
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast.error('Failed to delete recipe from cloud');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 lg:py-8 max-w-7xl">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">Smart Snap Feast</h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                AI-powered cooking assistant for your kitchen
                {firebaseLoading && ' • Syncing...'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[350px_1fr] gap-3 sm:gap-4 md:gap-6 lg:gap-8">
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
              onDeleteRecipe={handleDeleteRecipe}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
