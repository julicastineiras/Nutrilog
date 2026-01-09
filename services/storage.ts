
import { MealEntry } from '../types';

const STORAGE_KEY = 'nutrilog_entries_v2';

export const getEntries = (): MealEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data).sort((a: MealEntry, b: MealEntry) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error('Failed to parse entries', e);
    return [];
  }
};

export const saveEntry = (entry: MealEntry) => {
  const entries = getEntries();
  // Check if we are updating an existing entry for same date and type
  const existingIndex = entries.findIndex(e => e.date === entry.date && e.type === entry.type);
  
  let updated;
  if (existingIndex >= 0) {
    updated = [...entries];
    updated[existingIndex] = { ...entry, id: entries[existingIndex].id }; // Keep original ID
  } else {
    updated = [entry, ...entries];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteEntry = (id: string) => {
  const entries = getEntries();
  const updated = entries.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteDayEntries = (date: string) => {
  const entries = getEntries();
  const updated = entries.filter(e => e.date !== date);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
