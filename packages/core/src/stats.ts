export interface ZTestInput {
  controlVisitors: number;
  controlConversions: number;
  variantVisitors: number;
  variantConversions: number;
}

export interface ZTestResult {
  controlRate: number;
  variantRate: number;
  absoluteDifference: number;
  relativeUplift: number;
  zScore: number;
  pValue: number;
  isSignificant95: boolean;
  confidenceInterval95: {
    lower: number;
    upper: number;
  };
}

/**
 * Standard Normal Cumulative Distribution Function approximation (Abramowitz and Stegun)
 */
function normalCdf(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

export function calculateTwoProportionZTest(input: ZTestInput): ZTestResult {
  const { controlVisitors, controlConversions, variantVisitors, variantConversions } = input;

  // Edge cases: zero visitors
  if (controlVisitors <= 0 || variantVisitors <= 0) {
    return {
      controlRate: 0,
      variantRate: 0,
      absoluteDifference: 0,
      relativeUplift: 0,
      zScore: 0,
      pValue: 1,
      isSignificant95: false,
      confidenceInterval95: { lower: 0, upper: 0 },
    };
  }

  const pControl = controlConversions / controlVisitors;
  const pVariant = variantConversions / variantVisitors;
  const diff = pVariant - pControl;
  const relativeUplift = pControl > 0 ? diff / pControl : 0;

  // Pooled proportion
  const pooledP = (controlConversions + variantConversions) / (controlVisitors + variantVisitors);

  if (pooledP <= 0 || pooledP >= 1) {
    return {
      controlRate: pControl,
      variantRate: pVariant,
      absoluteDifference: diff,
      relativeUplift,
      zScore: 0,
      pValue: 1,
      isSignificant95: false,
      confidenceInterval95: { lower: diff, upper: diff },
    };
  }

  // Standard Error under null hypothesis
  const sePool = Math.sqrt(pooledP * (1 - pooledP) * (1 / controlVisitors + 1 / variantVisitors));
  const zScore = sePool > 0 ? diff / sePool : 0;

  // Two-tailed p-value
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const isSignificant95 = pValue < 0.05;

  // Unpooled standard error for confidence interval of difference
  const seDiff = Math.sqrt(
    (pControl * (1 - pControl)) / controlVisitors + (pVariant * (1 - pVariant)) / variantVisitors
  );
  const marginOfError = 1.959964 * seDiff;

  return {
    controlRate: pControl,
    variantRate: pVariant,
    absoluteDifference: diff,
    relativeUplift,
    zScore,
    pValue,
    isSignificant95,
    confidenceInterval95: {
      lower: diff - marginOfError,
      upper: diff + marginOfError,
    },
  };
}
