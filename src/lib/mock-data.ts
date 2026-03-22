import { FoodItem, Notification, Recipe, SustainabilityData, AnalyticsData } from './types';

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const mockFoodItems: FoodItem[] = [
  { id: '1', name: 'Whole Milk', quantity: 1, unit: 'gallon', expiryDate: d(2), category: 'dairy', addedDate: d(-5), addedBy: 'Sarah', consumed: 70, cost: 4.29 },
  { id: '2', name: 'Organic Eggs', quantity: 8, unit: 'pieces', expiryDate: d(8), category: 'dairy', addedDate: d(-3), addedBy: 'Marcus', consumed: 33, cost: 5.99 },
  { id: '3', name: 'Baby Spinach', quantity: 1, unit: 'bag', expiryDate: d(1), category: 'produce', addedDate: d(-4), addedBy: 'Sarah', consumed: 40, cost: 3.49 },
  { id: '4', name: 'Chicken Breast', quantity: 2, unit: 'lbs', expiryDate: d(3), category: 'meat', addedDate: d(-1), addedBy: 'Marcus', consumed: 0, cost: 8.99 },
  { id: '5', name: 'Greek Yogurt', quantity: 3, unit: 'cups', expiryDate: d(5), category: 'dairy', addedDate: d(-2), addedBy: 'Sarah', consumed: 33, cost: 6.49 },
  { id: '6', name: 'Sourdough Bread', quantity: 1, unit: 'loaf', expiryDate: d(0), category: 'grains', addedDate: d(-3), addedBy: 'Marcus', consumed: 60, cost: 4.99 },
  { id: '7', name: 'Avocados', quantity: 3, unit: 'pieces', expiryDate: d(2), category: 'produce', addedDate: d(-2), addedBy: 'Sarah', consumed: 33, cost: 4.50 },
  { id: '8', name: 'Cheddar Cheese', quantity: 1, unit: 'block', expiryDate: d(14), category: 'dairy', addedDate: d(-5), addedBy: 'Marcus', consumed: 20, cost: 5.29 },
  { id: '9', name: 'Orange Juice', quantity: 1, unit: 'carton', expiryDate: d(6), category: 'beverages', addedDate: d(-4), addedBy: 'Sarah', consumed: 50, cost: 3.99 },
  { id: '10', name: 'Frozen Berries', quantity: 1, unit: 'bag', expiryDate: d(60), category: 'frozen', addedDate: d(-10), addedBy: 'Marcus', consumed: 25, cost: 4.99 },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Sourdough Bread expires today!', message: 'Use it in a recipe or freeze it.', type: 'urgent', timestamp: new Date().toISOString(), read: false, foodItemId: '6' },
  { id: 'n2', title: 'Baby Spinach expiring tomorrow', message: 'Consider making a salad or smoothie.', type: 'urgent', timestamp: new Date().toISOString(), read: false, foodItemId: '3' },
  { id: 'n3', title: 'Milk expires in 2 days', message: 'You have 30% remaining — try to use it up.', type: 'warning', timestamp: new Date().toISOString(), read: false, foodItemId: '1' },
  { id: 'n4', title: 'Great job this week!', message: 'You reduced waste by 12% compared to last week.', type: 'info', timestamp: d(-1), read: true },
  { id: 'n5', title: 'Chicken Breast — use within 3 days', message: 'Consider grilling or meal prepping.', type: 'warning', timestamp: new Date().toISOString(), read: false, foodItemId: '4' },
];

export const mockRecipes: Recipe[] = [
  { id: 'r1', title: 'Spinach & Avocado Smoothie', image: '', readyInMinutes: 5, servings: 2, usedIngredients: ['Baby Spinach', 'Avocados', 'Whole Milk'], missedIngredients: ['Banana'] },
  { id: 'r2', title: 'Chicken Stir-Fry with Spinach', image: '', readyInMinutes: 25, servings: 4, usedIngredients: ['Chicken Breast', 'Baby Spinach'], missedIngredients: ['Soy Sauce', 'Garlic'] },
  { id: 'r3', title: 'Avocado Toast on Sourdough', image: '', readyInMinutes: 10, servings: 2, usedIngredients: ['Avocados', 'Sourdough Bread', 'Organic Eggs'], missedIngredients: [] },
  { id: 'r4', title: 'Greek Yogurt Parfait', image: '', readyInMinutes: 5, servings: 1, usedIngredients: ['Greek Yogurt', 'Frozen Berries'], missedIngredients: ['Granola', 'Honey'] },
];

export const mockSustainability: SustainabilityData = {
  score: 72,
  tier: 'silver',
  wastePercentage: 18,
  itemsSaved: 23,
  streakDays: 11,
};

export const mockAnalytics: AnalyticsData = {
  mostConsumed: [
    { name: 'Milk', count: 12 },
    { name: 'Eggs', count: 10 },
    { name: 'Bread', count: 8 },
    { name: 'Chicken', count: 7 },
    { name: 'Yogurt', count: 6 },
  ],
  mostWasted: [
    { name: 'Spinach', percentage: 42 },
    { name: 'Bread', percentage: 28 },
    { name: 'Milk', percentage: 18 },
    { name: 'Avocados', percentage: 15 },
    { name: 'Berries', percentage: 10 },
  ],
  monthlySpending: [
    { month: 'Oct', spent: 320, wasted: 58 },
    { month: 'Nov', spent: 285, wasted: 42 },
    { month: 'Dec', spent: 410, wasted: 75 },
    { month: 'Jan', spent: 295, wasted: 38 },
    { month: 'Feb', spent: 310, wasted: 45 },
    { month: 'Mar', spent: 275, wasted: 32 },
  ],
  purchaseFrequency: [
    { item: 'Milk', avgDays: 3.2, wastePercent: 18 },
    { item: 'Eggs', avgDays: 5.5, wastePercent: 8 },
    { item: 'Bread', avgDays: 4.1, wastePercent: 28 },
    { item: 'Spinach', avgDays: 6.3, wastePercent: 42 },
    { item: 'Chicken', avgDays: 4.8, wastePercent: 5 },
  ],
};
