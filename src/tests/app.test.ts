/**
 * FoodRescue AI - Automated Validation & Integration Tests
 * Covers Authentication, Donation Lifecycles, Atomic Reservation Conflicts,
 * Smart Matching Engine, and ML Prediction Integrity.
 */

import { db } from '../../server/db';
import { predictSurplus, evaluateModelPerformance } from '../../server/mlEngine';
import { rankRecipientsForDonation, calculateHaversineDistanceKm } from '../../server/matchingEngine';
import { FoodDonation, Organization } from '../types';

export function runPlatformTestSuite(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName}`);
    }
  }

  // 1. Haversine Distance Test
  const dist = calculateHaversineDistanceKm(37.7898, -122.4014, 37.7842, -122.4145);
  assert(dist > 1.0 && dist < 2.0, 'Haversine distance calculation is accurate (approx 1.3km in SF)');

  // 2. ML Engine Non-Negativity & Bounds Test
  const mlOutput = predictSurplus({
    category: 'COOKED_MEALS',
    dayOfWeek: 0,
    month: 10,
    quantityPreparedKg: 100,
    historicalDemandAverageKg: 70,
    isHolidayOrEvent: true,
  });
  assert(mlOutput.predictedSurplusKg >= 0, 'ML Prediction never produces negative surplus');
  assert(mlOutput.lowerBoundKg <= mlOutput.predictedSurplusKg, 'ML Lower bound is <= predicted surplus');
  assert(mlOutput.upperBoundKg >= mlOutput.predictedSurplusKg, 'ML Upper bound is >= predicted surplus');
  assert(mlOutput.confidenceScore > 0.70, 'ML Model confidence is within reasonable bounds (>70%)');

  // 3. ML Model Evaluation Metrics Test
  const evalMetrics = evaluateModelPerformance();
  assert(evalMetrics.mae < evalMetrics.baselineMae, 'Random Forest MAE improves upon Baseline Mean Model');
  assert(evalMetrics.rmse < evalMetrics.baselineRmse, 'Random Forest RMSE improves upon Baseline Mean Model');
  assert(evalMetrics.r2Score > 0.80, 'Random Forest R² score is strong (>0.80)');

  // 4. Atomic Reservation & Conflict Prevention Test
  db.seed();
  const testDonation = db.donations.get('don-001')!;
  const res1 = db.reserveDonation(testDonation.id, 'org-ngo-1', 'Hope Shelter');
  assert(res1.success === true, 'First NGO successfully reserves available donation');
  assert(res1.donation?.status === 'RESERVED', 'Donation status transitions to RESERVED');

  // Attempt duplicate reservation by second NGO -> MUST CONFLICT!
  const res2 = db.reserveDonation(testDonation.id, 'org-ngo-2', 'St Vincent Kitchen');
  assert(res2.success === false, 'Duplicate concurrent reservation is rejected with conflict error');

  // 5. State Machine Validation Test
  // Attempt invalid transition: cannot jump directly from RESERVED to DELIVERED without PICKED_UP
  const invalidTransition = db.updateDonationStatus(testDonation.id, 'DELIVERED');
  assert(invalidTransition.success === false, 'Invalid state transition RESERVED -> DELIVERED is rejected');
  
  // Valid transition RESERVED -> PICKED_UP
  const validPickup = db.updateDonationStatus(testDonation.id, 'PICKED_UP');
  assert(validPickup.success === true, 'Valid transition RESERVED -> PICKED_UP succeeds');
  
  // Valid transition PICKED_UP -> DELIVERED
  const validDelivery = db.updateDonationStatus(testDonation.id, 'DELIVERED');
  assert(validDelivery.success === true, 'Valid transition PICKED_UP -> DELIVERED succeeds');

  // 6. Smart Matching Recommendation Test
  const ngos = Array.from(db.organizations.values()).filter((o) => o.role === 'NGO');
  const matches = rankRecipientsForDonation(testDonation, ngos);
  assert(matches.length > 0, 'Smart matching returns candidate list');
  assert(matches[0].totalScore >= matches[matches.length - 1].totalScore, 'Smart matching ranks highest score first');

  return { passed, failed, results };
}
