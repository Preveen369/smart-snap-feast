export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  addedAt: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  dietaryTags: string[];
  createdAt: number;
}

export type DietaryFilter = 'all' | 'vegetarian' | 'vegan' | 'gluten-free' | 'Dairy Food';
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
