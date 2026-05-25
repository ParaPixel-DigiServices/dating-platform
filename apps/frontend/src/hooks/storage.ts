// MMKV initialization
// Using AsyncStorage as fallback since MMKV requires native modules

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = AsyncStorage;

export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return await storage.getItem(key);
  } catch (error) {
    console.error(`Error reading storage key ${key}:`, error);
    return null;
  }
};

export const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    await storage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing storage key ${key}:`, error);
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage key ${key}:`, error);
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    await storage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
