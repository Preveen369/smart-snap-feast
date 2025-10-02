import { useState } from 'react';
import { ChefHat, Clock, Users, Trash2, List, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recipe, Ingredient } from '@/types/recipe';

interface RecipeGeneratorProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onGenerateRecipe: (recipe: Recipe) => void;
}

export function RecipeGenerator({ ingredients, recipes, onGenerateRecipe }: RecipeGeneratorProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(4);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  return (
    <div className="space-y-6">
      {/* Your Recipes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your Recipes</h3>
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
              <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-all hover:border-orange-200" onClick={() => setSelectedRecipe(recipe)}>
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
                        setSelectedRecipe(recipe);
                      }}
                    >
                      View Recipe
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive text-xs px-2 py-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
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
              <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-sm transition-all hover:border-orange-200" onClick={() => setSelectedRecipe(recipe)}>
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
                          setSelectedRecipe(recipe);
                        }}
                      >
                        <ChefHat className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive text-xs px-1 py-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete
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
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg">{selectedRecipe.title}</DialogTitle>
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
                {selectedRecipe.description || 'Crispy on the outside and cheesy on the inside, these vegetarian potato patties are paired perfectly with a tangy soy mayo drizzle.'}
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

              {/* Ingredients */}
              <div>
                <h4 className="font-medium text-base mb-2">Ingredients:</h4>
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-medium text-base mb-2">Instructions:</h4>
                <div className="space-y-2.5">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2.5">
                      <div className="w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
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
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Customize
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
