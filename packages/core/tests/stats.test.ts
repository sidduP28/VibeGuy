import { describe, it, expect } from 'vitest';
import { calculateTwoProportionZTest } from '../src/stats';

describe('Two-Proportion Z-Test & Uplift Statistics', () => {
  it('calculates significant positive uplift accurately', () => {
    // Control: 100 conversions out of 2000 visitors (5% CR)
    // Variant: 150 conversions out of 2000 visitors (7.5% CR)
    const result = calculateTwoProportionZTest({
      controlVisitors: 2000,
      controlConversions: 100,
      variantVisitors: 2000,
      variantConversions: 150,
    });

    expect(result.controlRate).toBeCloseTo(0.05, 4);
    expect(result.variantRate).toBeCloseTo(0.075, 4);
    expect(result.relativeUplift).toBeCloseTo(0.5, 2); // 50% relative uplift
    expect(result.zScore).toBeGreaterThan(3.0); // Highly significant
    expect(result.pValue).toBeLessThan(0.01);
    expect(result.isSignificant95).toBe(true);
    expect(result.confidenceInterval95.lower).toBeGreaterThan(0.01);
    expect(result.confidenceInterval95.upper).toBeLessThan(0.04);
  });

  it('handles null / non-significant difference', () => {
    const result = calculateTwoProportionZTest({
      controlVisitors: 500,
      controlConversions: 25,
      variantVisitors: 500,
      variantConversions: 26,
    });

    expect(result.isSignificant95).toBe(false);
    expect(result.pValue).toBeGreaterThan(0.05);
  });

  it('safely handles zero visitor edge cases without NaN or throwing', () => {
    const result = calculateTwoProportionZTest({
      controlVisitors: 0,
      controlConversions: 0,
      variantVisitors: 0,
      variantConversions: 0,
    });

    expect(result.controlRate).toBe(0);
    expect(result.variantRate).toBe(0);
    expect(result.relativeUplift).toBe(0);
    expect(result.zScore).toBe(0);
    expect(result.pValue).toBe(1);
    expect(result.isSignificant95).toBe(false);
  });
});
