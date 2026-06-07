export const suggestProductPrice = ({
  marketPrice = 0,
  features = [],
  category = '',
  brandValue = 'Medium', // 'High', 'Medium', 'Low'
  competitorPrices = [],
  demandLevel = 'Medium', // 'High', 'Medium', 'Low'
  salesHistoryCount = 0,
}) => {
  let confidenceScore = 40; // Base confidence

  // Determine baseline price
  let basePrice = marketPrice;
  
  if (competitorPrices && competitorPrices.length > 0) {
    const avgCompetitor = competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length;
    basePrice = (marketPrice * 0.4) + (avgCompetitor * 0.6);
    confidenceScore += 25; // More data points -> higher confidence
  } else {
    basePrice = marketPrice;
  }

  // Adjustments based on Brand Value
  let brandMultiplier = 1.0;
  if (brandValue === 'High') {
    brandMultiplier = 1.15;
    confidenceScore += 10;
  } else if (brandValue === 'Low') {
    brandMultiplier = 0.90;
    confidenceScore += 5;
  } else {
    confidenceScore += 10;
  }

  // Adjustments based on Category
  let categoryMultiplier = 1.0;
  const lowerCat = category.toLowerCase();
  if (lowerCat.includes('electronics') || lowerCat.includes('tech')) {
    categoryMultiplier = 1.05;
  } else if (lowerCat.includes('fashion') || lowerCat.includes('clothing')) {
    categoryMultiplier = 0.95;
  } else if (lowerCat.includes('grocery') || lowerCat.includes('food')) {
    categoryMultiplier = 0.90;
  }

  // Adjustments based on Demand Level
  let demandMultiplier = 1.0;
  if (demandLevel === 'High') {
    demandMultiplier = 1.12;
    confidenceScore += 10;
  } else if (demandLevel === 'Low') {
    demandMultiplier = 0.88;
    confidenceScore += 10;
  } else {
    confidenceScore += 10;
  }

  // Adjustments based on Sales History Count (monthly velocity)
  let salesMultiplier = 1.0;
  if (salesHistoryCount > 100) {
    salesMultiplier = 1.05; // high demand product, can extract premium
    confidenceScore += 10;
  } else if (salesHistoryCount > 0 && salesHistoryCount < 10) {
    salesMultiplier = 0.95; // low sales, discount to clear stock
    confidenceScore += 10;
  } else if (salesHistoryCount >= 10) {
    confidenceScore += 10;
  }

  // Feature adjustments: each feature adds a slight premium
  const featurePremium = (features || []).length * 1.5;
  if (features && features.length > 0) {
    confidenceScore += 5;
  }

  // Cap confidence score at 100
  confidenceScore = Math.min(confidenceScore, 100);

  // Compute final suggested price
  const suggestedPrice = (basePrice * brandMultiplier * categoryMultiplier * demandMultiplier * salesMultiplier) + featurePremium;

  return {
    suggestedSellingPrice: parseFloat(suggestedPrice.toFixed(2)),
    confidenceScore: Math.round(confidenceScore),
  };
};
