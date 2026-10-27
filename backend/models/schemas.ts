/**
 * MongoDB / Mongoose Database Schemas for FoodRescue AI
 * Production schemas with indexes, references, and validation rules.
 */

export const UserSchemaDefinition = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['PROVIDER', 'NGO', 'VOLUNTEER', 'ADMIN'],
    index: true 
  },
  phone: { type: String, required: true },
  organizationId: { type: 'ObjectId', ref: 'Organization', index: true },
  avatarUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

export const OrganizationSchemaDefinition = {
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: [
      'RESTAURANT',
      'HOTEL',
      'COLLEGE_CANTEEN',
      'SUPERMARKET',
      'EVENT_ORGANIZER',
      'SHELTER_NGO',
      'FOOD_BANK',
      'COMMUNITY_KITCHEN'
    ]
  },
  role: { type: String, required: true, enum: ['PROVIDER', 'NGO'], index: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, index: '2dsphere' } // [longitude, latitude]
  },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  capacityKgPerDay: { type: Number, required: true, min: 0 },
  acceptedCategories: [{
    type: String,
    enum: ['COOKED_MEALS', 'BAKERY_PASTRY', 'FRESH_PRODUCE', 'DAIRY_EGGS', 'PACKAGED_GOODS', 'BEVERAGES']
  }],
  refrigerationAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false, index: true },
  safetyCertId: { type: String }
};

export const FoodDonationSchemaDefinition = {
  providerId: { type: 'ObjectId', ref: 'Organization', required: true, index: true },
  providerName: { type: String, required: true },
  providerType: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  category: {
    type: String,
    required: true,
    enum: ['COOKED_MEALS', 'BAKERY_PASTRY', 'FRESH_PRODUCE', 'DAIRY_EGGS', 'PACKAGED_GOODS', 'BEVERAGES'],
    index: true
  },
  quantityKg: { type: Number, required: true, min: 0.1 },
  estimatedServings: { type: Number, required: true, min: 1 },
  preparedAt: { type: Date, required: true },
  storageCondition: {
    type: String,
    required: true,
    enum: ['AMBIENT_DRY', 'REFRIGERATED_0_4C', 'FROZEN_BELOW_MINUS_18C', 'HOT_HOLD_ABOVE_63C']
  },
  storageNotes: { type: String },
  pickupAddress: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, index: '2dsphere' } // [longitude, latitude]
  },
  collectionDeadline: { type: Date, required: true, index: true },
  imageUrl: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['AVAILABLE', 'REQUESTED', 'RESERVED', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'EXPIRED'],
    default: 'AVAILABLE',
    index: true
  },
  safetyChecklist: {
    tempVerified: { type: Boolean, required: true },
    allergensDeclared: { type: Boolean, required: true },
    hygienicPackaging: { type: Boolean, required: true },
    unopenedOrSealed: { type: Boolean, required: true }
  },
  allergens: [{ type: String }],
  reservedByNgoId: { type: 'ObjectId', ref: 'Organization', index: true },
  reservedByNgoName: { type: String },
  assignedVolunteerId: { type: 'ObjectId', ref: 'User' },
  assignedVolunteerName: { type: String },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
};

export const DonationRequestSchemaDefinition = {
  donationId: { type: 'ObjectId', ref: 'FoodDonation', required: true, index: true },
  ngoId: { type: 'ObjectId', ref: 'Organization', required: true, index: true },
  ngoName: { type: String, required: true },
  status: { type: String, required: true, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
  message: { type: String },
  estimatedBeneficiaries: { type: Number, default: 30 },
  requestedAt: { type: Date, default: Date.now }
};

export const CollectionSchemaDefinition = {
  donationId: { type: 'ObjectId', ref: 'FoodDonation', required: true, index: true },
  volunteerId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  volunteerName: { type: String, required: true },
  providerName: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  pickupCoords: { type: [Number], required: true },
  ngoName: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryCoords: { type: [Number], required: true },
  deadline: { type: Date, required: true },
  status: { type: String, required: true, enum: ['ASSIGNED', 'PICKED_UP', 'DELIVERED'], default: 'ASSIGNED' },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  deliveryNotes: { type: String }
};

export const PredictionRecordSchemaDefinition = {
  providerId: { type: 'ObjectId', ref: 'Organization', index: true },
  category: { type: String, required: true },
  dayOfWeek: { type: Number, required: true },
  month: { type: Number, required: true },
  quantityPreparedKg: { type: Number, required: true },
  historicalDemandAverageKg: { type: Number, required: true },
  predictedSurplusKg: { type: Number, required: true },
  lowerBoundKg: { type: Number, required: true },
  upperBoundKg: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  modelName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
};

export const ReportSchemaDefinition = {
  reportedByUserId: { type: 'ObjectId', ref: 'User', required: true },
  donationId: { type: 'ObjectId', ref: 'FoodDonation' },
  organizationId: { type: 'ObjectId', ref: 'Organization' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
};
