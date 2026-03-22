export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category: FoodCategory;
  addedDate: string;
  addedBy: string;
  consumed: number; // percentage consumed before expiry
  cost?: number;
}

export type FoodCategory = 
  | 'dairy' 
  | 'produce' 
  | 'meat' 
  | 'grains' 
  | 'beverages' 
  | 'snacks' 
  | 'condiments' 
  | 'frozen' 
  | 'other';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  foodItemId?: string;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  usedIngredients: string[];
  missedIngredients: string[];
}

export type SustainabilityTier = 'bronze' | 'silver' | 'gold';

export interface SustainabilityData {
  score: number; // 0–100
  tier: SustainabilityTier;
  wastePercentage: number;
  itemsSaved: number;
  streakDays: number;
}

export interface AnalyticsData {
  mostConsumed: { name: string; count: number }[];
  mostWasted: { name: string; percentage: number }[];
  monthlySpending: { month: string; spent: number; wasted: number }[];
  purchaseFrequency: { item: string; avgDays: number; wastePercent: number }[];
}

export const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  dairy: '🥛',
  produce: '🥬',
  meat: '🥩',
  grains: '🌾',
  beverages: '🥤',
  snacks: '🍿',
  condiments: '🫙',
  frozen: '🧊',
  other: '📦',
};
