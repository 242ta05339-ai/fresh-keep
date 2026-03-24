import { FoodItem, SustainabilityData, SustainabilityTier } from './types';

export function computeSustainability(items: FoodItem[]): SustainabilityData {
  if (items.length === 0) {
    return { score: 0, tier: 'bronze', wastePercentage: 0, itemsSaved: 0, streakDays: 0 };
  }

  const avgConsumed = items.reduce((sum, i) => sum + i.consumed, 0) / items.length;
  const wastePercentage = Math.round(100 - avgConsumed);
  const score = Math.round(avgConsumed);
  const tier: SustainabilityTier = score >= 80 ? 'gold' : score >= 50 ? 'silver' : 'bronze';
  const itemsSaved = items.filter(i => i.consumed >= 80).length;

  // Streak: count consecutive days from today that have items added
  const today = new Date();
  let streakDays = 0;
  for (let d = 0; d < 365; d++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - d);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (items.some(i => i.addedDate === dateStr)) {
      streakDays++;
    } else if (d > 0) {
      break;
    }
  }

  return { score, tier, wastePercentage, itemsSaved, streakDays };
}
