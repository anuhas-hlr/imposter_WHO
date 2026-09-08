import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types/game';
import defaultCategoriesData from '../assets/data/defaultCategories.json';

const CUSTOM_CATEGORIES_KEY = '@imposter_custom_categories_v1';

export const defaultCategories: Category[] = defaultCategoriesData as Category[];

export async function getAllCategories(): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const custom: Category[] = raw ? JSON.parse(raw) : [];
    return [...defaultCategories, ...custom];
  } catch (error) {
    console.error('Failed to load categories:', error);
    return defaultCategories;
  }
}

export async function saveCustomCategory(category: Omit<Category, 'isCustom'>): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const custom: Category[] = raw ? JSON.parse(raw) : [];
    const newCategory: Category = {
      ...category,
      isCustom: true,
      id: category.id || `custom_${Date.now()}`,
    };
    const updated = [...custom, newCategory];
    await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    return [...defaultCategories, ...updated];
  } catch (error) {
    console.error('Failed to save category:', error);
    throw error;
  }
}

export async function deleteCustomCategory(id: string): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const custom: Category[] = raw ? JSON.parse(raw) : [];
    const updated = custom.filter((c) => c.id !== id);
    await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    return [...defaultCategories, ...updated];
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}
