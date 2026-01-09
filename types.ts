
export enum MealType {
  Breakfast = 'desayuno',
  Lunch = 'almuerzo',
  Snack = 'merienda',
  Dinner = 'cena',
  Extras = 'extras'
}

export interface MealEntry {
  id: string;
  date: string;
  type: MealType;
  content: string;
  timestamp: number;
}

export type TabType = 'register' | 'history' | 'insights';
