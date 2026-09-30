import { describe, it, expect } from 'vitest';
import { hashVisitorToBucket, isVisitorInHoldout } from '../src/holdout';

describe('Holdout Deterministic Hashing', () => {
  it('deterministically hashes the same visitor and campaign to identical bucket', () => {
    const visitorId = 'usr_abc123xyz';
    const campaignId = 'cmp_fitness_spring';

    const bucket1 = hashVisitorToBucket(visitorId, campaignId);
    const bucket2 = hashVisitorToBucket(visitorId, campaignId);

    expect(bucket1).toBeGreaterThanOrEqual(0);
    expect(bucket1).toBeLessThan(100);
    expect(bucket1).toBe(bucket2);
  });

  it('correctly assigns holdout based on percentage threshold', () => {
    // If bucket < 20 and holdoutPct = 20, isHoldout is true
    const visitorInHoldout = 'usr_holdout_probe';
    const campaignId = 'cmp_test_1';
    const bucket = hashVisitorToBucket(visitorInHoldout, campaignId);

    const isHoldoutWhenThresholdAbove = isVisitorInHoldout(visitorInHoldout, campaignId, bucket + 1);
    const isHoldoutWhenThresholdBelow = isVisitorInHoldout(visitorInHoldout, campaignId, bucket);

    expect(isHoldoutWhenThresholdAbove).toBe(true);
    expect(isHoldoutWhenThresholdBelow).toBe(false);
  });

  it('distributes 1,000 visitors roughly uniformly (0-99 buckets)', () => {
    const buckets = new Array(100).fill(0);
    const campaignId = 'cmp_distribution_test';

    for (let i = 0; i < 1000; i++) {
      const bucket = hashVisitorToBucket(`visitor_${i}`, campaignId);
      buckets[bucket]++;
    }

    // Every bucket in 1000 items should have at least 1 item and no bucket > 35 items
    const minBucket = Math.min(...buckets);
    const maxBucket = Math.max(...buckets);

    expect(minBucket).toBeGreaterThan(0);
    expect(maxBucket).toBeLessThan(35);
  });
});
