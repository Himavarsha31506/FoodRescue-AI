import {
  User,
  Organization,
  FoodDonation,
  DonationRequest,
  CollectionTask,
  HistoricalFoodLog,
  MatchingWeights,
  DonationStatus,
  UserRole
} from '../src/types';
import {
  INITIAL_PROVIDERS,
  INITIAL_NGOS,
  INITIAL_USERS,
  INITIAL_DONATIONS,
  INITIAL_COLLECTIONS,
  INITIAL_HISTORICAL_LOGS,
} from '../src/data/sampleData';

class DatabaseStore {
  public users: Map<string, User> = new Map();
  public organizations: Map<string, Organization> = new Map();
  public donations: Map<string, FoodDonation> = new Map();
  public requests: Map<string, DonationRequest> = new Map();
  public collections: Map<string, CollectionTask> = new Map();
  public historicalLogs: HistoricalFoodLog[] = [];
  public matchingWeights: MatchingWeights = {
    distance: 35,
    capacity: 25,
    requirements: 25,
    urgency: 15,
  };

  // Mutex lock map to avoid race condition on concurrent reservation
  private reservationLocks: Set<string> = new Set();

  constructor() {
    this.seed();
  }

  public seed(): void {
    this.users.clear();
    this.organizations.clear();
    this.donations.clear();
    this.requests.clear();
    this.collections.clear();
    this.reservationLocks.clear();

    INITIAL_PROVIDERS.forEach((p) => this.organizations.set(p.id, { ...p }));
    INITIAL_NGOS.forEach((n) => this.organizations.set(n.id, { ...n }));
    INITIAL_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    INITIAL_DONATIONS.forEach((d) => this.donations.set(d.id, { ...d }));
    INITIAL_COLLECTIONS.forEach((c) => this.collections.set(c.id, { ...c }));
    this.historicalLogs = [...INITIAL_HISTORICAL_LOGS];
  }

  public checkAndExpireDonations(): void {
    const now = new Date();
    for (const donation of this.donations.values()) {
      if (
        (donation.status === 'AVAILABLE' || donation.status === 'REQUESTED') &&
        new Date(donation.collectionDeadline) <= now
      ) {
        donation.status = 'EXPIRED';
        donation.updatedAt = now.toISOString();
      }
    }
  }

  // Atomic reservation to prevent race conditions
  public reserveDonation(
    donationId: string,
    ngoId: string,
    ngoName: string,
    message: string = '',
    estimatedBeneficiaries: number = 30
  ): { success: boolean; donation?: FoodDonation; error?: string } {
    this.checkAndExpireDonations();

    if (this.reservationLocks.has(donationId)) {
      return { success: false, error: 'A reservation request for this donation is currently being processed.' };
    }

    this.reservationLocks.add(donationId);
    try {
      const donation = this.donations.get(donationId);
      if (!donation) {
        return { success: false, error: 'Donation listing not found.' };
      }

      if (donation.status === 'EXPIRED') {
        return { success: false, error: 'This donation has passed its collection deadline.' };
      }

      if (donation.status !== 'AVAILABLE' && donation.status !== 'REQUESTED') {
        return {
          success: false,
          error: `This donation has already been ${donation.status.toLowerCase()} by another recipient.`,
        };
      }

      // Check deadline
      if (new Date(donation.collectionDeadline) <= new Date()) {
        donation.status = 'EXPIRED';
        return { success: false, error: 'Donation deadline has elapsed.' };
      }

      // Update donation status atomically
      donation.status = 'RESERVED';
      donation.reservedByNgoId = ngoId;
      donation.reservedByNgoName = ngoName;
      donation.updatedAt = new Date().toISOString();

      // Record request log
      const reqId = `req-${Date.now()}`;
      const requestRecord: DonationRequest = {
        id: reqId,
        donationId,
        ngoId,
        ngoName,
        status: 'ACCEPTED',
        message: message || 'Reservation confirmed via FoodRescue AI platform.',
        requestedAt: new Date().toISOString(),
        estimatedBeneficiaries,
      };
      this.requests.set(reqId, requestRecord);

      // Automatically create a collection task for volunteer dispatch
      const ngo = this.organizations.get(ngoId);
      const taskId = `col-${Date.now()}`;
      const task: CollectionTask = {
        id: taskId,
        donationId: donation.id,
        volunteerId: 'usr-vol-1',
        volunteerName: 'Alex Rivera',
        providerName: donation.providerName,
        pickupAddress: donation.pickupAddress,
        pickupCoords: [donation.latitude, donation.longitude],
        ngoName: ngoName,
        deliveryAddress: ngo?.address || 'Community Center Address',
        deliveryCoords: ngo ? [ngo.latitude, ngo.longitude] : [37.7842, -122.4145],
        deadline: donation.collectionDeadline,
        status: 'ASSIGNED',
      };
      this.collections.set(taskId, task);
      donation.assignedVolunteerId = task.volunteerId;
      donation.assignedVolunteerName = task.volunteerName;

      return { success: true, donation };
    } finally {
      this.reservationLocks.delete(donationId);
    }
  }

  // Strict state machine validation
  public updateDonationStatus(
    donationId: string,
    newStatus: DonationStatus
  ): { success: boolean; donation?: FoodDonation; error?: string } {
    const donation = this.donations.get(donationId);
    if (!donation) {
      return { success: false, error: 'Donation not found.' };
    }

    const current = donation.status;
    const validTransitions: Record<DonationStatus, DonationStatus[]> = {
      AVAILABLE: ['REQUESTED', 'RESERVED', 'CANCELLED', 'EXPIRED'],
      REQUESTED: ['RESERVED', 'AVAILABLE', 'CANCELLED', 'EXPIRED'],
      RESERVED: ['PICKED_UP', 'AVAILABLE', 'CANCELLED', 'EXPIRED'],
      PICKED_UP: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
      EXPIRED: [],
    };

    if (!validTransitions[current].includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition donation status from ${current} to ${newStatus}.`,
      };
    }

    donation.status = newStatus;
    donation.updatedAt = new Date().toISOString();
    if (newStatus === 'PICKED_UP') donation.pickedUpAt = new Date().toISOString();
    if (newStatus === 'DELIVERED') donation.deliveredAt = new Date().toISOString();

    return { success: true, donation };
  }
}

export const db = new DatabaseStore();
