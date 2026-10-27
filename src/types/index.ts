export type UserRole = 'PROVIDER' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export type OrganizationType = 
  | 'RESTAURANT' 
  | 'HOTEL' 
  | 'COLLEGE_CANTEEN' 
  | 'SUPERMARKET' 
  | 'EVENT_ORGANIZER' 
  | 'SHELTER_NGO' 
  | 'FOOD_BANK' 
  | 'COMMUNITY_KITCHEN';

export type FoodCategory = 
  | 'COOKED_MEALS' 
  | 'BAKERY_PASTRY' 
  | 'FRESH_PRODUCE' 
  | 'DAIRY_EGGS' 
  | 'PACKAGED_GOODS' 
  | 'BEVERAGES';

export type StorageCondition = 
  | 'AMBIENT_DRY' 
  | 'REFRIGERATED_0_4C' 
  | 'FROZEN_BELOW_MINUS_18C' 
  | 'HOT_HOLD_ABOVE_63C';

export type DonationStatus = 
  | 'AVAILABLE' 
  | 'REQUESTED' 
  | 'RESERVED' 
  | 'PICKED_UP' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  organizationId?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  role: 'PROVIDER' | 'NGO';
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  capacityKgPerDay: number;
  acceptedCategories: FoodCategory[];
  refrigerationAvailable: boolean;
  isVerified: boolean;
  safetyCertId?: string;
}

export interface FoodDonation {
  id: string;
  providerId: string;
  providerName: string;
  providerType: OrganizationType;
  title: string;
  description: string;
  category: FoodCategory;
  quantityKg: number;
  estimatedServings: number;
  preparedAt: string;
  storageCondition: StorageCondition;
  storageNotes: string;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  collectionDeadline: string;
  imageUrl: string;
  status: DonationStatus;
  safetyChecklist: {
    tempVerified: boolean;
    allergensDeclared: boolean;
    hygienicPackaging: boolean;
    unopenedOrSealed: boolean;
  };
  allergens: string[];
  reservedByNgoId?: string;
  reservedByNgoName?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  createdAt: string;
  updatedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface DonationRequest {
  id: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message: string;
  requestedAt: string;
  estimatedBeneficiaries: number;
}

export interface CollectionTask {
  id: string;
  donationId: string;
  volunteerId: string;
  volunteerName: string;
  providerName: string;
  pickupAddress: string;
  pickupCoords: [number, number];
  ngoName: string;
  deliveryAddress: string;
  deliveryCoords: [number, number];
  deadline: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  completionProofUrl?: string;
}

export interface MatchingWeights {
  distance: number;
  capacity: number;
  requirements: number;
  urgency: number;
}

export interface RecipientMatch {
  ngo: Organization;
  totalScore: number;
  distanceKm: number;
  distanceScore: number;
  capacityScore: number;
  requirementsScore: number;
  urgencyScore: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  breakdown: string;
}

export interface HistoricalFoodLog {
  id: string;
  date: string;
  dayOfWeek: string;
  category: FoodCategory;
  quantityPreparedKg: number;
  quantitySoldKg: number;
  surplusKg: number;
  isHolidayOrEvent: boolean;
  temperatureCelsius: number;
  predictedSurplusKg?: number;
}

export interface MLPredictionInput {
  category: FoodCategory;
  dayOfWeek: number; // 0=Mon, 6=Sun
  month: number; // 1-12
  quantityPreparedKg: number;
  historicalDemandAverageKg: number;
  isHolidayOrEvent: boolean;
}

export interface MLPredictionResult {
  predictedSurplusKg: number;
  lowerBoundKg: number;
  upperBoundKg: number;
  confidenceScore: number; // 0 to 1
  category: FoodCategory;
  recommendations: string[];
  featureContributions: {
    feature: string;
    impact: number;
  }[];
  modelName: string;
  timestamp: string;
}

export interface MLModelEvaluation {
  modelName: string;
  mae: number;
  rmse: number;
  r2Score: number;
  sampleCount: number;
  baselineMae: number;
  baselineRmse: number;
  baselineR2: number;
  improvementPercentage: number;
  lastTrainedAt: string;
}
