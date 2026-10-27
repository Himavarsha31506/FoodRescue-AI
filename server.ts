import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { predictSurplus, evaluateModelPerformance } from './server/mlEngine.js';
import { rankRecipientsForDonation } from './server/matchingEngine.js';
import { FoodDonation, MLPredictionInput } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Periodic expiration checker every 60 seconds
  setInterval(() => {
    db.checkAndExpireDonations();
  }, 60000);

  // -------------------------------------------------------------
  // AUTHENTICATION ROUTES
  // -------------------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role } = req.body;
    db.checkAndExpireDonations();

    const user = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase()
    );

    if (user) {
      const org = user.organizationId ? db.organizations.get(user.organizationId) : undefined;
      return res.json({
        token: `mock-jwt-token-${user.id}-${Date.now()}`,
        user,
        organization: org,
      });
    }

    // Role-based fallback demo user
    const targetRole = role || 'PROVIDER';
    const fallbackUser = Array.from(db.users.values()).find((u) => u.role === targetRole);
    if (fallbackUser) {
      const org = fallbackUser.organizationId ? db.organizations.get(fallbackUser.organizationId) : undefined;
      return res.json({
        token: `mock-jwt-token-${fallbackUser.id}-${Date.now()}`,
        user: fallbackUser,
        organization: org,
      });
    }

    return res.status(401).json({ error: 'Invalid credentials or user not found' });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, role, phone, organizationName, orgType, address, city } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }

    const existing = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    let organizationId: string | undefined;
    if (organizationName && (role === 'PROVIDER' || role === 'NGO')) {
      organizationId = `org-${Date.now()}`;
      db.organizations.set(organizationId, {
        id: organizationId,
        name: organizationName,
        type: orgType || (role === 'PROVIDER' ? 'RESTAURANT' : 'SHELTER_NGO'),
        role: role as 'PROVIDER' | 'NGO',
        address: address || '123 Market St',
        city: city || 'San Francisco, CA',
        latitude: 37.78 + (Math.random() - 0.5) * 0.05,
        longitude: -122.41 + (Math.random() - 0.5) * 0.05,
        contactPerson: name,
        contactEmail: email,
        contactPhone: phone || '+1 (415) 555-0100',
        capacityKgPerDay: role === 'NGO' ? 200 : 100,
        acceptedCategories: ['COOKED_MEALS', 'BAKERY_PASTRY', 'FRESH_PRODUCE'],
        refrigerationAvailable: true,
        isVerified: true,
        safetyCertId: `CERT-${Date.now().toString().slice(-5)}`,
      });
    }

    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email,
      role,
      phone: phone || '',
      organizationId,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    db.users.set(userId, newUser);

    const org = organizationId ? db.organizations.get(organizationId) : undefined;
    return res.status(201).json({
      token: `mock-jwt-token-${userId}-${Date.now()}`,
      user: newUser,
      organization: org,
    });
  });

  // -------------------------------------------------------------
  // DONATION ROUTES
  // -------------------------------------------------------------
  app.get('/api/donations', (req: Request, res: Response) => {
    db.checkAndExpireDonations();
    const { category, status, search, providerId, reservedByNgoId } = req.query;

    let items = Array.from(db.donations.values());

    if (category && category !== 'ALL') {
      items = items.filter((d) => d.category === category);
    }
    if (status && status !== 'ALL') {
      items = items.filter((d) => d.status === status);
    }
    if (providerId) {
      items = items.filter((d) => d.providerId === providerId);
    }
    if (reservedByNgoId) {
      items = items.filter((d) => d.reservedByNgoId === reservedByNgoId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.providerName.toLowerCase().includes(q) ||
          d.pickupAddress.toLowerCase().includes(q)
      );
    }

    // Sort by created descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ donations: items, count: items.length });
  });

  app.get('/api/donations/:id', (req: Request, res: Response) => {
    db.checkAndExpireDonations();
    const donation = db.donations.get(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation listing not found' });
    }
    const provider = db.organizations.get(donation.providerId);
    return res.json({ donation, provider });
  });

  app.post('/api/donations', (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      quantityKg,
      estimatedServings,
      preparedAt,
      storageCondition,
      storageNotes,
      pickupAddress,
      latitude,
      longitude,
      collectionDeadline,
      imageUrl,
      safetyChecklist,
      allergens,
      providerId,
      providerName,
      providerType,
    } = req.body;

    // Validation
    if (!title || !category || !quantityKg || !collectionDeadline || !pickupAddress) {
      return res.status(400).json({ error: 'Please provide all required food donation fields.' });
    }

    if (Number(quantityKg) <= 0) {
      return res.status(400).json({ error: 'Donation quantity in kg must be greater than 0.' });
    }

    const deadline = new Date(collectionDeadline);
    if (isNaN(deadline.getTime()) || deadline <= new Date()) {
      return res.status(400).json({ error: 'Collection deadline must be a valid time in the future.' });
    }

    // Food safety validation checks
    if (
      !safetyChecklist ||
      !safetyChecklist.tempVerified ||
      !safetyChecklist.hygienicPackaging ||
      !safetyChecklist.allergensDeclared
    ) {
      return res.status(400).json({
        error:
          'Food safety certification checklist is incomplete. Temperature verification and hygienic packaging declaration are legally required.',
      });
    }

    const id = `don-${Date.now().toString().slice(-6)}`;
    const newDonation: FoodDonation = {
      id,
      providerId: providerId || 'org-prov-1',
      providerName: providerName || 'Green Table Bistro',
      providerType: providerType || 'RESTAURANT',
      title,
      description: description || '',
      category,
      quantityKg: Number(quantityKg),
      estimatedServings: Number(estimatedServings) || Math.round(Number(quantityKg) * 2),
      preparedAt: preparedAt || new Date().toISOString(),
      storageCondition: storageCondition || 'AMBIENT_DRY',
      storageNotes: storageNotes || '',
      pickupAddress,
      latitude: Number(latitude) || 37.7898,
      longitude: Number(longitude) || -122.4014,
      collectionDeadline: deadline.toISOString(),
      imageUrl: imageUrl || '/src/assets/images/hero_food_donation_1793120038399.jpg',
      status: 'AVAILABLE',
      safetyChecklist: {
        tempVerified: Boolean(safetyChecklist.tempVerified),
        allergensDeclared: Boolean(safetyChecklist.allergensDeclared),
        hygienicPackaging: Boolean(safetyChecklist.hygienicPackaging),
        unopenedOrSealed: Boolean(safetyChecklist.unopenedOrSealed),
      },
      allergens: allergens || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.donations.set(id, newDonation);
    return res.status(201).json({ donation: newDonation });
  });

  // Atomic reservation / request endpoint to prevent conflicts
  app.post('/api/donations/:id/request', (req: Request, res: Response) => {
    const { ngoId, ngoName, message, estimatedBeneficiaries } = req.body;
    if (!ngoId) {
      return res.status(400).json({ error: 'NGO identifier is required.' });
    }

    const result = db.reserveDonation(
      req.params.id,
      ngoId,
      ngoName || 'Partner Recipient Organization',
      message,
      estimatedBeneficiaries
    );

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    return res.json({ success: true, donation: result.donation });
  });

  // Status transitions
  app.patch('/api/donations/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const result = db.updateDonationStatus(req.params.id, status);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, donation: result.donation });
  });

  // -------------------------------------------------------------
  // SMART RECIPIENT MATCHING ROUTES
  // -------------------------------------------------------------
  app.get('/api/matching/:donationId', (req: Request, res: Response) => {
    db.checkAndExpireDonations();
    const donation = db.donations.get(req.params.donationId);
    if (!donation) {
      return res.status(404).json({ error: 'Donation listing not found.' });
    }

    const ngos = Array.from(db.organizations.values()).filter((org) => org.role === 'NGO');
    const matches = rankRecipientsForDonation(donation, ngos, db.matchingWeights);

    return res.json({
      donation,
      weights: db.matchingWeights,
      matches,
    });
  });

  app.get('/api/matching/weights', (_req: Request, res: Response) => {
    return res.json({ weights: db.matchingWeights });
  });

  app.post('/api/matching/weights', (req: Request, res: Response) => {
    const { distance, capacity, requirements, urgency } = req.body;
    if (
      typeof distance === 'number' &&
      typeof capacity === 'number' &&
      typeof requirements === 'number' &&
      typeof urgency === 'number'
    ) {
      db.matchingWeights = { distance, capacity, requirements, urgency };
      return res.json({ success: true, weights: db.matchingWeights });
    }
    return res.status(400).json({ error: 'Invalid weights configuration' });
  });

  // -------------------------------------------------------------
  // MACHINE LEARNING PREDICTION ROUTES
  // -------------------------------------------------------------
  app.post('/api/predictions/surplus', (req: Request, res: Response) => {
    const {
      category = 'COOKED_MEALS',
      dayOfWeek = 0,
      month = 10,
      quantityPreparedKg = 85,
      historicalDemandAverageKg = 65,
      isHolidayOrEvent = false,
    } = req.body;

    const input: MLPredictionInput = {
      category,
      dayOfWeek: Number(dayOfWeek),
      month: Number(month),
      quantityPreparedKg: Math.max(1, Number(quantityPreparedKg)),
      historicalDemandAverageKg: Math.max(1, Number(historicalDemandAverageKg)),
      isHolidayOrEvent: Boolean(isHolidayOrEvent),
    };

    const prediction = predictSurplus(input);
    return res.json({ prediction, input });
  });

  app.get('/api/predictions/evaluate', (_req: Request, res: Response) => {
    const evaluation = evaluateModelPerformance();
    return res.json({ evaluation });
  });

  app.get('/api/predictions/logs', (_req: Request, res: Response) => {
    return res.json({ logs: db.historicalLogs });
  });

  // -------------------------------------------------------------
  // VOLUNTEER COLLECTION ROUTES
  // -------------------------------------------------------------
  app.get('/api/collections', (req: Request, res: Response) => {
    const { volunteerId, status } = req.query;
    let items = Array.from(db.collections.values());
    if (volunteerId) {
      items = items.filter((c) => c.volunteerId === volunteerId);
    }
    if (status && status !== 'ALL') {
      items = items.filter((c) => c.status === status);
    }
    return res.json({ collections: items });
  });

  app.patch('/api/collections/:id/status', (req: Request, res: Response) => {
    const { status, deliveryNotes } = req.body;
    const task = db.collections.get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Collection task not found.' });
    }

    if (status === 'PICKED_UP') {
      task.status = 'PICKED_UP';
      task.pickedUpAt = new Date().toISOString();
      const donation = db.donations.get(task.donationId);
      if (donation) {
        donation.status = 'PICKED_UP';
        donation.pickedUpAt = task.pickedUpAt;
      }
    } else if (status === 'DELIVERED') {
      task.status = 'DELIVERED';
      task.deliveredAt = new Date().toISOString();
      task.deliveryNotes = deliveryNotes || 'Successfully delivered to recipient intake team.';
      const donation = db.donations.get(task.donationId);
      if (donation) {
        donation.status = 'DELIVERED';
        donation.deliveredAt = task.deliveredAt;
      }
    }

    return res.json({ success: true, task });
  });

  // -------------------------------------------------------------
  // ANALYTICS & ADMIN ROUTES
  // -------------------------------------------------------------
  app.get('/api/analytics', (_req: Request, res: Response) => {
    db.checkAndExpireDonations();
    const donations = Array.from(db.donations.values());

    const delivered = donations.filter((d) => d.status === 'DELIVERED');
    const available = donations.filter((d) => d.status === 'AVAILABLE');
    const reservedOrProgress = donations.filter((d) =>
      ['REQUESTED', 'RESERVED', 'PICKED_UP'].includes(d.status)
    );

    const totalKgDelivered = delivered.reduce((acc, d) => acc + d.quantityKg, 0);
    const availableKg = available.reduce((acc, d) => acc + d.quantityKg, 0);
    const inProgressKg = reservedOrProgress.reduce((acc, d) => acc + d.quantityKg, 0);

    // Baseline calculation: 1 kg rescued ~ 2.2 meals provided, ~ 2.5 kg CO2e emissions avoided
    const mealsServed = Math.round(totalKgDelivered * 2.2);
    const co2AvoidedKg = Math.round(totalKgDelivered * 2.5);

    // Breakdown by category
    const categoryTotals: Record<string, number> = {};
    donations.forEach((d) => {
      categoryTotals[d.category] = (categoryTotals[d.category] || 0) + d.quantityKg;
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, kg]) => ({
      category: cat.replace('_', ' '),
      quantityKg: kg,
    }));

    return res.json({
      totalKgDelivered,
      availableKg,
      inProgressKg,
      totalDonationsCount: donations.length,
      deliveredCount: delivered.length,
      availableCount: available.length,
      mealsServed,
      co2AvoidedKg,
      totalProviders: Array.from(db.organizations.values()).filter((o) => o.role === 'PROVIDER').length,
      totalNgos: Array.from(db.organizations.values()).filter((o) => o.role === 'NGO').length,
      categoryBreakdown,
    });
  });

  app.get('/api/admin/users', (_req: Request, res: Response) => {
    const users = Array.from(db.users.values());
    const orgs = Array.from(db.organizations.values());
    return res.json({ users, organizations: orgs });
  });

  app.patch('/api/admin/verify/:orgId', (req: Request, res: Response) => {
    const org = db.organizations.get(req.params.orgId);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    org.isVerified = !org.isVerified;
    return res.json({ success: true, organization: org });
  });

  app.post('/api/seed', (_req: Request, res: Response) => {
    db.seed();
    return res.json({ success: true, message: 'Database reset and re-seeded with realistic sample data.' });
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serve
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodRescue AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
