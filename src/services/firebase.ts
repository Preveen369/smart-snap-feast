// Firebase Firestore service for database operations
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentReference,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Collection names - aligned with Smart Snap Feast features
export const COLLECTIONS = {
  RECIPES: "recipes",                    // AI-generated recipes
  INGREDIENTS: "ingredients",            // User's pantry ingredients
  COOKING_SESSIONS: "cookingSessions",   // Active cooking mode sessions
  USER_PREFERENCES: "userPreferences",   // Dietary preferences and settings
  COOKING_TIPS: "cookingTips",          // Personalized cooking tips
  RECIPE_RATINGS: "recipeRatings",      // User ratings and feedback
} as const;

// Generic Firestore operations

/**
 * Add a document to a collection
 */
export async function addDocument<T>(
  collectionName: string,
  data: T
): Promise<DocumentReference> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get a document by ID
 */
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection with optional filters
 */
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints) 
      : collectionRef;
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

// Recipe-specific operations aligned with Smart Snap Feast Recipe type

export interface FirebaseRecipe {
  id?: string;
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
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function saveRecipe(recipe: Omit<FirebaseRecipe, 'id'>): Promise<string> {
  const docRef = await addDocument(COLLECTIONS.RECIPES, recipe);
  return docRef.id;
}

export async function getRecipe(recipeId: string): Promise<FirebaseRecipe | null> {
  return getDocument<FirebaseRecipe>(COLLECTIONS.RECIPES, recipeId);
}

export async function getUserRecipes(userId: string): Promise<FirebaseRecipe[]> {
  const recipes = await getDocuments<FirebaseRecipe>(COLLECTIONS.RECIPES, [
    where("userId", "==", userId),
  ]);
  // Sort in memory instead of using Firestore orderBy to avoid index requirement
  return recipes.sort((a, b) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<FirebaseRecipe>
): Promise<void> {
  return updateDocument(COLLECTIONS.RECIPES, recipeId, updates);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.RECIPES, recipeId);
}

// Ingredient management operations

export interface FirebaseIngredient {
  id?: string;
  name: string;
  quantity?: string;
  unit?: string;
  addedAt?: Timestamp;
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function saveIngredient(
  ingredient: Omit<FirebaseIngredient, 'id'>
): Promise<string> {
  const docRef = await addDocument(COLLECTIONS.INGREDIENTS, ingredient);
  return docRef.id;
}

export async function getUserIngredients(userId: string): Promise<FirebaseIngredient[]> {
  const ingredients = await getDocuments<FirebaseIngredient>(COLLECTIONS.INGREDIENTS, [
    where("userId", "==", userId),
  ]);
  // Sort in memory instead of using Firestore orderBy to avoid index requirement
  return ingredients.sort((a, b) => {
    const timeA = a.addedAt?.toMillis() || 0;
    const timeB = b.addedAt?.toMillis() || 0;
    return timeB - timeA;
  });
}

export async function deleteIngredient(ingredientId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.INGREDIENTS, ingredientId);
}

export async function clearUserIngredients(userId: string): Promise<void> {
  const ingredients = await getUserIngredients(userId);
  const deletePromises = ingredients.map(ing => ing.id && deleteIngredient(ing.id));
  await Promise.all(deletePromises.filter(Boolean));
}

// User preferences operations

export interface UserPreferences {
  id?: string;
  userId: string;
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  defaultServings: number;
  defaultDifficulty: 'easy' | 'medium' | 'hard';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function saveUserPreferences(
  preferences: Omit<UserPreferences, 'id'>
): Promise<string> {
  const existing = await getDocuments<UserPreferences>(COLLECTIONS.USER_PREFERENCES, [
    where("userId", "==", preferences.userId),
    limit(1),
  ]);
  
  if (existing.length > 0 && existing[0].id) {
    await updateDocument(COLLECTIONS.USER_PREFERENCES, existing[0].id, preferences);
    return existing[0].id;
  }
  
  const docRef = await addDocument(COLLECTIONS.USER_PREFERENCES, preferences);
  return docRef.id;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const preferences = await getDocuments<UserPreferences>(COLLECTIONS.USER_PREFERENCES, [
    where("userId", "==", userId),
    limit(1),
  ]);
  return preferences.length > 0 ? preferences[0] : null;
}

// Cooking session operations (for tracking active cooking mode)

export interface CookingSession {
  id?: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  completedSteps: number[];
  checkedIngredients: string[];
  servings: number;
  startedAt?: Timestamp;
  lastUpdatedAt?: Timestamp;
  completedAt?: Timestamp;
}

export async function saveCookingSession(
  session: Omit<CookingSession, 'id'>
): Promise<string> {
  const docRef = await addDocument(COLLECTIONS.COOKING_SESSIONS, session);
  return docRef.id;
}

export async function updateCookingSession(
  sessionId: string,
  updates: Partial<CookingSession>
): Promise<void> {
  return updateDocument(COLLECTIONS.COOKING_SESSIONS, sessionId, updates);
}

export async function getActiveCookingSession(
  userId: string,
  recipeId: string
): Promise<CookingSession | null> {
  const sessions = await getDocuments<CookingSession>(COLLECTIONS.COOKING_SESSIONS, [
    where("userId", "==", userId),
    where("recipeId", "==", recipeId),
    where("completedAt", "==", null),
    orderBy("startedAt", "desc"),
    limit(1),
  ]);
  return sessions.length > 0 ? sessions[0] : null;
}

export async function completeCookingSession(sessionId: string): Promise<void> {
  return updateDocument(COLLECTIONS.COOKING_SESSIONS, sessionId, {
    completedAt: Timestamp.now(),
  });
}
