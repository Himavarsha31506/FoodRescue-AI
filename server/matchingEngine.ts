import { FoodDonation, Organization, MatchingWeights, RecipientMatch } from '../src/types';

// Haversine formula to compute great-circle distance between two coordinates in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function rankRecipientsForDonation(
  donation: FoodDonation,
  ngos: Organization[],
  weights: MatchingWeights = { distance: 35, capacity: 25, requirements: 25, urgency: 15 }
): RecipientMatch[] {
  const totalWeight = weights.distance + weights.capacity + weights.requirements + weights.urgency;
  const normalizedWeights = {
    distance: weights.distance / totalWeight,
    capacity: weights.capacity / totalWeight,
    requirements: weights.requirements / totalWeight,
    urgency: weights.urgency / totalWeight,
  };

  const now = new Date();
  const deadlineDate = new Date(donation.collectionDeadline);
  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  const matches: RecipientMatch[] = ngos.map((ngo) => {
    const distanceKm = calculateHaversineDistanceKm(
      donation.latitude,
      donation.longitude,
      ngo.latitude,
      ngo.longitude
    );

    // 1. Distance Score: 100 for <= 1km, 0 for >= 20km
    const distanceScore = Math.max(0, Math.min(100, Math.round(100 - (distanceKm / 20) * 100)));

    // 2. Capacity Score: NGO daily capacity vs donation quantity
    let capacityScore = 50;
    if (ngo.capacityKgPerDay >= donation.quantityKg) {
      const ratio = donation.quantityKg / ngo.capacityKgPerDay;
      if (ratio <= 0.6) {
        capacityScore = 100;
      } else {
        capacityScore = 80;
      }
    } else {
      capacityScore = Math.round((ngo.capacityKgPerDay / donation.quantityKg) * 50);
    }

    // 3. Requirements Score: Category acceptance and refrigeration equipment
    let requirementsScore = 100;
    let categoryAccepted = ngo.acceptedCategories.includes(donation.category);
    let refrigerationCheck = true;

    if (!categoryAccepted) {
      requirementsScore -= 60;
    }

    if (
      (donation.storageCondition === 'REFRIGERATED_0_4C' ||
        donation.storageCondition === 'FROZEN_BELOW_MINUS_18C') &&
      !ngo.refrigerationAvailable
    ) {
      refrigerationCheck = false;
      requirementsScore -= 40;
    }

    requirementsScore = Math.max(0, requirementsScore);

    // 4. Urgency Score:
    let urgencyScore = 70;
    if (hoursUntilDeadline <= 0) {
      urgencyScore = 0;
    } else if (hoursUntilDeadline < 3) {
      urgencyScore = distanceKm < 4 ? 100 : Math.max(10, 80 - distanceKm * 8);
    } else if (hoursUntilDeadline < 6) {
      urgencyScore = distanceKm < 8 ? 90 : 65;
    } else {
      urgencyScore = 75;
    }

    // Eligibility check
    let isEligible = true;
    const ineligibilityReasons: string[] = [];

    if (!categoryAccepted) {
      isEligible = false;
      ineligibilityReasons.push(`Does not accept ${donation.category.replace('_', ' ').toLowerCase()}`);
    }

    if (!refrigerationCheck) {
      isEligible = false;
      ineligibilityReasons.push('Lacks required cold storage equipment for perishable goods');
    }

    if (hoursUntilDeadline <= 0) {
      isEligible = false;
      ineligibilityReasons.push('Collection deadline has expired');
    } else if (hoursUntilDeadline < 1 && distanceKm > 6) {
      isEligible = false;
      ineligibilityReasons.push('Too distant to reach within remaining 60-minute window');
    }

    const totalScore = Math.round(
      distanceScore * normalizedWeights.distance +
        capacityScore * normalizedWeights.capacity +
        requirementsScore * normalizedWeights.requirements +
        urgencyScore * normalizedWeights.urgency
    );

    const breakdown = `${distanceKm}km away (Score ${distanceScore}/100) · Capacity ${ngo.capacityKgPerDay}kg/day (${capacityScore}/100) · Category match (${requirementsScore}/100) · Deadline window ${hoursUntilDeadline.toFixed(1)}h (${urgencyScore}/100)`;

    return {
      ngo,
      totalScore: isEligible ? totalScore : Math.min(totalScore, 25),
      distanceKm,
      distanceScore,
      capacityScore,
      requirementsScore,
      urgencyScore,
      isEligible,
      ineligibilityReason: ineligibilityReasons.join('; '),
      breakdown,
    };
  });

  return matches.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.totalScore - a.totalScore;
  });
}
