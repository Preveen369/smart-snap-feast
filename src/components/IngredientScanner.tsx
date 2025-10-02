import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Ingredient } from '@/types/recipe';

interface IngredientScannerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Ingredient) => void;
  onRemoveIngredient: (id: string) => void;
}

export function IngredientScanner({ ingredients, onAddIngredient, onRemoveIngredient }: IngredientScannerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;

    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      unit: unit.trim() || undefined,
      addedAt: Date.now(),
    };

    onAddIngredient(newIngredient);
    setName('');
    setQuantity('');
    setUnit('');
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Pantry</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Ingredient Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Tomatoes"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Quantity</label>
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="2"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Unit</label>
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="cups"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add to Pantry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {ingredients.length === 0 ? (
          <Card className="col-span-full p-8 text-center">
            <p className="text-muted-foreground">No ingredients yet. Add some to get started!</p>
          </Card>
        ) : (
          ingredients.map((ingredient) => (
            <Card key={ingredient.id} className="relative p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                onClick={() => onRemoveIngredient(ingredient.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{ingredient.name}</p>
                {ingredient.quantity && (
                  <p className="text-sm text-muted-foreground">
                    {ingredient.quantity} {ingredient.unit}
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
