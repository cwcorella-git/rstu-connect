// Rent Comparison Calculation Functions
import {
  getFMR,
  getMarketRentPerSqft,
  AFFORDABILITY_THRESHOLDS,
  DEPRECIATION_SETTINGS,
  getBedroomLabel,
} from './rentFairnessData';

// Status types for metrics - neutral, position-based
export type MetricStatus = 'below' | 'at' | 'above' | 'high';

// Individual metric results
export interface AffordabilityResult {
  ratio: number;
  percent: number;
  status: MetricStatus;
  message: string;
}

export interface CostPerSqftResult {
  actual: number;
  market: number;
  percentDiff: number;
  status: MetricStatus;
  message: string;
}

export interface FMRComparisonResult {
  fmr: number;
  userRent: number;
  percentDiff: number;
  status: MetricStatus;
  message: string;
  bedroomLabel: string;
}

export interface AgeAdjustedResult {
  expectedMin: number;
  expectedMax: number;
  buildingAge: number;
  depreciation: number;
  status: MetricStatus;
  message: string;
}

export interface BuildingAvgResult {
  average: number;
  median: number;
  min: number;
  max: number;
  reportingUnits: number;
  percentDiff: number;
  status: MetricStatus;
  message: string;
}

export interface OverallAssessment {
  aboveCount: number;
  atCount: number;
  belowCount: number;
  totalMetrics: number;
  summary: string;
  details: string[];
}

// Full comparison report
export interface RentFairnessReport {
  affordability: AffordabilityResult | null;
  costPerSqft: CostPerSqftResult | null;
  vsFMR: FMRComparisonResult | null;
  ageAdjusted: AgeAdjustedResult | null;
  vsBuildingAvg: BuildingAvgResult | null;
  overall: OverallAssessment;
}

// Calculate affordability (rent-to-income ratio)
export function calculateAffordability(
  rent: number,
  monthlyIncome: number
): AffordabilityResult | null {
  if (!monthlyIncome || monthlyIncome <= 0) return null;

  const ratio = rent / monthlyIncome;
  const percent = Math.round(ratio * 100);

  let status: MetricStatus;
  let message: string;

  if (ratio <= AFFORDABILITY_THRESHOLDS.excellent) {
    status = 'below';
    message = `${percent}% of income (under 25% threshold)`;
  } else if (ratio <= AFFORDABILITY_THRESHOLDS.affordable) {
    status = 'at';
    message = `${percent}% of income (under 30% threshold)`;
  } else if (ratio <= AFFORDABILITY_THRESHOLDS.burdened) {
    status = 'above';
    message = `${percent}% of income (30-50% = "cost-burdened" per HUD)`;
  } else {
    status = 'high';
    message = `${percent}% of income (50%+ = "severely cost-burdened" per HUD)`;
  }

  return { ratio, percent, status, message };
}

// Calculate cost per square foot comparison
export function calculateCostPerSqft(
  rent: number,
  sqft: number,
  bedrooms: number
): CostPerSqftResult | null {
  if (!sqft || sqft <= 0) return null;

  const actual = rent / sqft;
  const market = getMarketRentPerSqft(bedrooms);
  const percentDiff = ((actual - market) / market) * 100;

  let status: MetricStatus;
  let message: string;

  if (percentDiff <= -10) {
    status = 'below';
    message = `$${actual.toFixed(2)}/sqft vs $${market.toFixed(2)} market avg (${Math.abs(Math.round(percentDiff))}% below)`;
  } else if (percentDiff <= 10) {
    status = 'at';
    message = `$${actual.toFixed(2)}/sqft vs $${market.toFixed(2)} market avg (within 10%)`;
  } else if (percentDiff <= 25) {
    status = 'above';
    message = `$${actual.toFixed(2)}/sqft vs $${market.toFixed(2)} market avg (${Math.round(percentDiff)}% above)`;
  } else {
    status = 'high';
    message = `$${actual.toFixed(2)}/sqft vs $${market.toFixed(2)} market avg (${Math.round(percentDiff)}% above)`;
  }

  return {
    actual: Math.round(actual * 100) / 100,
    market,
    percentDiff: Math.round(percentDiff),
    status,
    message,
  };
}

// Calculate FMR comparison
export function calculateFMRComparison(
  rent: number,
  bedrooms: number
): FMRComparisonResult {
  const fmr = getFMR(bedrooms);
  const percentDiff = ((rent - fmr) / fmr) * 100;

  let status: MetricStatus;
  let message: string;

  if (percentDiff <= -10) {
    status = 'below';
    message = `$${rent.toLocaleString()} vs $${fmr.toLocaleString()} HUD FMR (${Math.abs(Math.round(percentDiff))}% below)`;
  } else if (percentDiff <= 10) {
    status = 'at';
    message = `$${rent.toLocaleString()} vs $${fmr.toLocaleString()} HUD FMR (within 10%)`;
  } else if (percentDiff <= 25) {
    status = 'above';
    message = `$${rent.toLocaleString()} vs $${fmr.toLocaleString()} HUD FMR (${Math.round(percentDiff)}% above)`;
  } else {
    status = 'high';
    message = `$${rent.toLocaleString()} vs $${fmr.toLocaleString()} HUD FMR (${Math.round(percentDiff)}% above)`;
  }

  return {
    fmr,
    userRent: rent,
    percentDiff: Math.round(percentDiff),
    status,
    message,
    bedroomLabel: getBedroomLabel(bedrooms),
  };
}

// Calculate age-adjusted expected rent
export function calculateAgeAdjusted(
  baseRent: number,
  yearBuilt: number | null,
  currentYear: number = new Date().getFullYear()
): AgeAdjustedResult | null {
  if (!yearBuilt || yearBuilt <= 0) return null;

  const age = currentYear - yearBuilt;
  if (age <= 0) {
    return {
      expectedMin: baseRent,
      expectedMax: baseRent,
      buildingAge: 0,
      depreciation: 0,
      status: 'at',
      message: 'New construction - no depreciation applied',
    };
  }

  // Calculate depreciation (0.5% per year, max 30%)
  const depreciation = Math.min(
    age * DEPRECIATION_SETTINGS.ratePerYear,
    DEPRECIATION_SETTINGS.maxDepreciation
  );
  const adjustedBase = baseRent * (1 - depreciation);

  // Expected range is ±5% of adjusted base
  const expectedMin = Math.round(adjustedBase * 0.95);
  const expectedMax = Math.round(adjustedBase * 1.05);

  let status: MetricStatus;
  let message: string;

  if (baseRent <= expectedMax) {
    status = 'at';
    message = `Within $${expectedMin.toLocaleString()}-$${expectedMax.toLocaleString()} range for ${age}-year-old building`;
  } else if (baseRent <= expectedMax * 1.1) {
    status = 'above';
    const overAmount = baseRent - expectedMax;
    message = `$${overAmount.toLocaleString()} above $${expectedMax.toLocaleString()} age-adjusted ceiling`;
  } else {
    status = 'high';
    const overAmount = baseRent - expectedMax;
    message = `$${overAmount.toLocaleString()} above $${expectedMax.toLocaleString()} age-adjusted ceiling`;
  }

  return {
    expectedMin,
    expectedMax,
    buildingAge: age,
    depreciation: Math.round(depreciation * 100),
    status,
    message,
  };
}

// Calculate building average comparison
export function calculateBuildingAverage(
  userRent: number,
  rentAmounts: number[]
): BuildingAvgResult | null {
  if (!rentAmounts || rentAmounts.length < 2) return null;

  // Calculate stats
  const sorted = [...rentAmounts].sort((a, b) => a - b);
  const sum = rentAmounts.reduce((a, b) => a + b, 0);
  const average = sum / rentAmounts.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const percentDiff = ((userRent - average) / average) * 100;

  let status: MetricStatus;
  let message: string;

  if (percentDiff <= -10) {
    status = 'below';
    message = `$${userRent.toLocaleString()} vs $${Math.round(average).toLocaleString()} avg (${Math.abs(Math.round(percentDiff))}% below)`;
  } else if (percentDiff <= 10) {
    status = 'at';
    message = `$${userRent.toLocaleString()} vs $${Math.round(average).toLocaleString()} avg (within 10%)`;
  } else if (percentDiff <= 20) {
    status = 'above';
    message = `$${userRent.toLocaleString()} vs $${Math.round(average).toLocaleString()} avg (${Math.round(percentDiff)}% above)`;
  } else {
    status = 'high';
    message = `$${userRent.toLocaleString()} vs $${Math.round(average).toLocaleString()} avg (${Math.round(percentDiff)}% above)`;
  }

  return {
    average: Math.round(average),
    median: Math.round(median),
    min,
    max,
    reportingUnits: rentAmounts.length,
    percentDiff: Math.round(percentDiff),
    status,
    message,
  };
}

// Calculate overall assessment - just counts, no judgment
export function calculateOverallAssessment(
  report: Omit<RentFairnessReport, 'overall'>
): OverallAssessment {
  const details: string[] = [];
  let belowCount = 0;
  let atCount = 0;
  let aboveCount = 0;

  // Count statuses
  const metrics = [
    report.affordability,
    report.costPerSqft,
    report.vsFMR,
    report.ageAdjusted,
    report.vsBuildingAvg,
  ];

  for (const metric of metrics) {
    if (!metric) continue;
    if (metric.status === 'below') belowCount++;
    else if (metric.status === 'at') atCount++;
    else if (metric.status === 'above' || metric.status === 'high') aboveCount++;
  }

  const totalMetrics = belowCount + atCount + aboveCount;

  // Add factual detail notes
  if (report.affordability) {
    details.push(`${report.affordability.percent}% of income goes to rent`);
  }

  if (report.vsFMR) {
    const diff = report.vsFMR.percentDiff;
    if (diff > 0) {
      details.push(`${diff}% above HUD Fair Market Rent for ${report.vsFMR.bedroomLabel}`);
    } else if (diff < 0) {
      details.push(`${Math.abs(diff)}% below HUD Fair Market Rent for ${report.vsFMR.bedroomLabel}`);
    }
  }

  if (report.ageAdjusted && report.ageAdjusted.buildingAge > 0) {
    details.push(`Building is ${report.ageAdjusted.buildingAge} years old (${report.ageAdjusted.depreciation}% depreciation factor)`);
  }

  if (report.vsBuildingAvg) {
    const diff = report.vsBuildingAvg.percentDiff;
    if (Math.abs(diff) > 5) {
      details.push(`${Math.abs(diff)}% ${diff > 0 ? 'above' : 'below'} building average ($${report.vsBuildingAvg.average}/mo)`);
    }
  }

  // Summary is just the counts
  let summary: string;
  if (totalMetrics === 0) {
    summary = 'Add more data to see comparisons.';
  } else {
    const parts: string[] = [];
    if (belowCount > 0) parts.push(`${belowCount} below benchmark`);
    if (atCount > 0) parts.push(`${atCount} at benchmark`);
    if (aboveCount > 0) parts.push(`${aboveCount} above benchmark`);
    summary = `${totalMetrics} metrics calculated: ${parts.join(', ')}.`;
  }

  return { aboveCount, atCount, belowCount, totalMetrics, summary, details };
}

// Generate full comparison report
export function generateRentFairnessReport(params: {
  rent: number;
  monthlyIncome?: number;
  unitSqft?: number;
  bedrooms: number;
  yearBuilt?: number | null;
  buildingRents?: number[];
}): RentFairnessReport {
  const { rent, monthlyIncome, unitSqft, bedrooms, yearBuilt, buildingRents } = params;

  const affordability = monthlyIncome
    ? calculateAffordability(rent, monthlyIncome)
    : null;

  const costPerSqft = unitSqft
    ? calculateCostPerSqft(rent, unitSqft, bedrooms)
    : null;

  const vsFMR = calculateFMRComparison(rent, bedrooms);

  const ageAdjusted = yearBuilt
    ? calculateAgeAdjusted(rent, yearBuilt)
    : null;

  const vsBuildingAvg = buildingRents
    ? calculateBuildingAverage(rent, buildingRents)
    : null;

  const partialReport = {
    affordability,
    costPerSqft,
    vsFMR,
    ageAdjusted,
    vsBuildingAvg,
  };

  const overall = calculateOverallAssessment(partialReport);

  return { ...partialReport, overall };
}
