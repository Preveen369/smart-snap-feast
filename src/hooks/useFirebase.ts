// Custom React hooks for Firebase Firestore operations
import { useState, useEffect, useCallback } from "react";
import {
  FirebaseRecipe,
  FirebaseIngredient,
  UserPreferences,
  CookingSession,
  saveRecipe,
  getRecipe,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  saveIngredient,
  getUserIngredients,
  deleteIngredient,
  clearUserIngredients,
  saveUserPreferences,
  getUserPreferences,
  saveCookingSession,
  updateCookingSession,
  getActiveCookingSession,
  completeCookingSession,
} from "../services/firebase";

// Hook for managing recipes
export function useRecipes(userId?: string) {
  const [recipes, setRecipes] = useState<FirebaseRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedRecipes = await getUserRecipes(userId);
      setRecipes(fetchedRecipes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = useCallback(async (recipe: Omit<FirebaseRecipe, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const recipeId = await saveRecipe(recipe);
      await fetchRecipes();
      return recipeId;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecipes]);

  const updateExistingRecipe = useCallback(async (
    recipeId: string,
    updates: Partial<FirebaseRecipe>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updateRecipe(recipeId, updates);
      await fetchRecipes();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecipes]);

  const removeRecipe = useCallback(async (recipeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRecipe(recipeId);
      await fetchRecipes();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe: updateExistingRecipe,
    deleteRecipe: removeRecipe,
    refetch: fetchRecipes,
  };
}

// Hook for managing a single recipe
export function useRecipe(recipeId?: string) {
  const [recipe, setRecipe] = useState<FirebaseRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipe = useCallback(async () => {
    if (!recipeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedRecipe = await getRecipe(recipeId);
      setRecipe(fetchedRecipe);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    loading,
    error,
    refetch: fetchRecipe,
  };
}

// Hook for managing ingredients
export function useIngredients(userId?: string) {
  const [ingredients, setIngredients] = useState<FirebaseIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchIngredients = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedIngredients = await getUserIngredients(userId);
      setIngredients(fetchedIngredients);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const addIngredient = useCallback(async (ingredient: Omit<FirebaseIngredient, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const ingredientId = await saveIngredient(ingredient);
      await fetchIngredients();
      return ingredientId;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIngredients]);

  const removeIngredient = useCallback(async (ingredientId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteIngredient(ingredientId);
      await fetchIngredients();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIngredients]);

  const clearAllIngredients = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await clearUserIngredients(userId);
      await fetchIngredients();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchIngredients]);

  return {
    ingredients,
    loading,
    error,
    addIngredient,
    removeIngredient,
    clearAllIngredients,
    refetch: fetchIngredients,
  };
}

// Hook for managing user preferences
export function useUserPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedPreferences = await getUserPreferences(userId);
      setPreferences(fetchedPreferences);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (
    newPreferences: Omit<UserPreferences, 'id'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await saveUserPreferences(newPreferences);
      await fetchPreferences();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}

// Hook for managing cooking sessions
export function useCookingSession(userId?: string, recipeId?: string) {
  const [session, setSession] = useState<CookingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    if (!userId || !recipeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const activeSession = await getActiveCookingSession(userId, recipeId);
      setSession(activeSession);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, recipeId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const startSession = useCallback(async (sessionData: Omit<CookingSession, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = await saveCookingSession(sessionData);
      await fetchSession();
      return sessionId;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSession]);

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<CookingSession>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updateCookingSession(sessionId, updates);
      await fetchSession();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSession]);

  const completeSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await completeCookingSession(sessionId);
      await fetchSession();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
    startSession,
    updateSession,
    completeSession,
    refetch: fetchSession,
  };
}
