// Rent Fairness Data for Washoe County, Nevada (2025)
// Source: HUD Fair Market Rent Documentation System

// HUD Fair Market Rent by bedroom count (Washoe County FY 2025)
// Represents the 40th percentile of gross rents for standard-quality units
export const WASHOE_FMR_2025: Record<number, number> = {
  0: 1181,  // Studio/Efficiency
  1: 1370,  // 1 Bedroom
  2: 1722,  // 2 Bedroom
  3: 2384,  // 3 Bedroom
  4: 2788,  // 4 Bedroom
};

// Get FMR for any bedroom count (5+ bedrooms add 15% per additional)
export function getFMR(bedrooms: number): number {
  if (bedrooms < 0) return WASHOE_FMR_2025[0];
  if (bedrooms <= 4) return WASHOE_FMR_2025[bedrooms];

  // For 5+ bedrooms: add 15% for each additional bedroom above 4
  const extra = bedrooms - 4;
  return Math.round(WASHOE_FMR_2025[4] * Math.pow(1.15, extra));
}

// Reno market rent per square foot by bedroom count (2025 data)
// Source: RentCafe market analysis
export const RENO_RENT_PER_SQFT: Record<number, number> = {
  0: 3.02,  // Studio (~379 sqft avg)
  1: 2.13,  // 1BR (~707 sqft avg)
  2: 1.82,  // 2BR (~1000 sqft avg)
  3: 1.82,  // 3BR (~1280 sqft avg)
  4: 1.75,  // 4BR (estimated)
};

// Get rent per sqft for bedroom count
export function getMarketRentPerSqft(bedrooms: number): number {
  if (bedrooms < 0) return RENO_RENT_PER_SQFT[0];
  if (bedrooms <= 4) return RENO_RENT_PER_SQFT[bedrooms];
  return RENO_RENT_PER_SQFT[4]; // Use 4BR rate for larger units
}

// Average unit sizes by bedroom count (sqft)
export const AVG_UNIT_SIZE: Record<number, number> = {
  0: 379,   // Studio
  1: 707,   // 1BR
  2: 1000,  // 2BR
  3: 1280,  // 3BR
  4: 1500,  // 4BR (estimated)
};

// Affordability thresholds (rent as % of income)
export const AFFORDABILITY_THRESHOLDS = {
  excellent: 0.25,    // Under 25% - excellent
  affordable: 0.30,   // Under 30% - standard affordable threshold
  burdened: 0.50,     // 30-50% - cost-burdened
  severe: 1.0,        // 50%+ - severely cost-burdened
};

// Building depreciation settings
export const DEPRECIATION_SETTINGS = {
  ratePerYear: 0.005,  // 0.5% per year
  maxDepreciation: 0.30,  // Max 30% depreciation
  usefulLife: 60,  // 60 year useful life for residential
};

// Bedroom count labels
export const BEDROOM_LABELS: Record<number, string> = {
  0: 'Studio',
  1: '1 Bedroom',
  2: '2 Bedroom',
  3: '3 Bedroom',
  4: '4 Bedroom',
  5: '5+ Bedroom',
};

// Get bedroom label
export function getBedroomLabel(bedrooms: number): string {
  if (bedrooms >= 5) return `${bedrooms} Bedroom`;
  return BEDROOM_LABELS[bedrooms] || `${bedrooms} Bedroom`;
}
