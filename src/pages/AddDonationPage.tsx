import React, { useState } from 'react';
import { FoodCategory, StorageCondition, User } from '../types';
import { SAMPLE_IMAGES } from '../data/sampleData';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

interface AddDonationPageProps {
  user: User | null;
  onNavigate: (tab: string) => void;
  onDonationCreated: (donation: any) => void;
}

export const AddDonationPage: React.FC<AddDonationPageProps> = ({
  user,
  onNavigate,
  onDonationCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('COOKED_MEALS');
  const [quantityKg, setQuantityKg] = useState<number>(25);
  const [estimatedServings, setEstimatedServings] = useState<number>(50);
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('REFRIGERATED_0_4C');
  const [storageNotes, setStorageNotes] = useState('Blast-chilled to 3°C per HACCP safe handling standard.');
  const [pickupAddress, setPickupAddress] = useState(
    '542 Market St, Financial District, San Francisco, CA'
  );
  const [latitude] = useState(37.7898);
  const [longitude] = useState(-122.4014);

  const defaultDeadline = new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16);
  const [collectionDeadline, setCollectionDeadline] = useState(defaultDeadline);

  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES.meals);

  const [tempVerified, setTempVerified] = useState(true);
  const [allergensDeclared, setAllergensDeclared] = useState(true);
  const [hygienicPackaging, setHygienicPackaging] = useState(true);
  const [unopenedOrSealed, setUnopenedOrSealed] = useState(true);

  const [allergenList, setAllergenList] = useState<string>('Dairy, Gluten');

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please specify a title for the food donation.');
      return;
    }

    if (quantityKg <= 0) {
      setErrorMsg('Quantity must be greater than 0 kg.');
      return;
    }

    const deadlineTime = new Date(collectionDeadline).getTime();
    if (isNaN(deadlineTime) || deadlineTime <= Date.now()) {
      setErrorMsg('Collection deadline must be set to a future time.');
      return;
    }

    if (!tempVerified || !hygienicPackaging || !allergensDeclared) {
      setErrorMsg('All mandatory food safety checklist requirements must be certified before publishing.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        quantityKg,
        estimatedServings: estimatedServings || quantityKg * 2,
        storageCondition,
        storageNotes,
        pickupAddress,
        latitude,
        longitude,
        collectionDeadline: new Date(collectionDeadline).toISOString(),
        imageUrl: selectedImage,
        safetyChecklist: {
          tempVerified,
          allergensDeclared,
          hygienicPackaging,
          unopenedOrSealed,
        },
        allergens: allergenList.split(',').map((s) => s.trim()).filter(Boolean),
        providerId: user?.organizationId || 'org-prov-1',
        providerName: user ? user.name : 'Green Table Bistro',
        providerType: 'RESTAURANT',
      };

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create donation listing.');
      }

      onDonationCreated(data.donation);
      onNavigate('find-food');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating the listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('provider-dashboard')}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Provider Hub</span>
        </button>
        <span className="text-xs text-neutral-500">
          Form validated under Good Samaritan Safety Standards
        </span>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 sm:p-8">
        <div className="pb-6 border-b border-neutral-100">
          <h1 className="text-2xl font-bold text-neutral-900">List Surplus Food Donation</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Publish edible surplus food for rapid claiming by verified local community shelters and food banks.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Food Title / Dish Description *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Herb-Roasted Free Range Chicken with Steamed Quinoa"
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Food Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as FoodCategory;
                  setCategory(cat);
                  if (cat === 'BAKERY_PASTRY') setSelectedImage(SAMPLE_IMAGES.hero);
                  else if (cat === 'FRESH_PRODUCE') setSelectedImage(SAMPLE_IMAGES.produce);
                  else setSelectedImage(SAMPLE_IMAGES.meals);
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="COOKED_MEALS">Cooked Meals / Prepared Dishes</option>
                <option value="BAKERY_PASTRY">Bakery & Pastry Surplus</option>
                <option value="FRESH_PRODUCE">Fresh Fruits & Vegetables</option>
                <option value="DAIRY_EGGS">Dairy & Eggs</option>
                <option value="PACKAGED_GOODS">Packaged & Canned Goods</option>
                <option value="BEVERAGES">Beverages & Juices</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Quantity (kg) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={quantityKg}
                  onChange={(e) => {
                    const kg = parseFloat(e.target.value) || 0;
                    setQuantityKg(kg);
                    setEstimatedServings(Math.round(kg * 2));
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Est. Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={estimatedServings}
                  onChange={(e) => setEstimatedServings(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Preparation & Recipe Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include ingredients, cooking methodology, and packaging specifics..."
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Storage Conditions & Safe Handling Protocol</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Storage Condition *
                </label>
                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="HOT_HOLD_ABOVE_63C">Hot Hold (Strictly &gt;63°C in Cambro)</option>
                  <option value="REFRIGERATED_0_4C">Refrigerated (0°C to 4°C Blast Chilled)</option>
                  <option value="FROZEN_BELOW_MINUS_18C">Frozen (&lt; -18°C Sealed)</option>
                  <option value="AMBIENT_DRY">Ambient Dry (Room Temperature, Ventilated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Declared Allergens (comma separated)
                </label>
                <input
                  type="text"
                  value={allergenList}
                  onChange={(e) => setAllergenList(e.target.value)}
                  placeholder="e.g. Dairy, Gluten, Peanuts, None"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Storage & Intake Notes for Volunteers
                </label>
                <input
                  type="text"
                  value={storageNotes}
                  onChange={(e) => setStorageNotes(e.target.value)}
                  placeholder="e.g. Requires insulated thermal transport bags; kept in kitchen walk-in cooler 2."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Location & Mandatory Collection Deadline</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Pickup Facility Address *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Strict Collection Deadline * (Must be in future)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={collectionDeadline}
                  onChange={(e) => setCollectionDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Unclaimed listings are automatically closed at deadline to maintain hygiene integrity.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Mandatory Food Safety Certification</span>
            </h4>
            <div className="space-y-2 text-xs text-neutral-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempVerified}
                  onChange={(e) => setTempVerified(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>Internal temperature checked and verified under HACCP food safety thresholds.</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hygienicPackaging}
                  onChange={(e) => setHygienicPackaging(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>Food packaged in sanitary, food-grade sealed trays/containers.</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allergensDeclared}
                  onChange={(e) => setAllergensDeclared(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>All major allergens (gluten, dairy, nuts, shellfish) explicitly declared above.</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unopenedOrSealed}
                  onChange={(e) => setUnopenedOrSealed(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span>Surplus was held in professional kitchen environments, not touched by consumers.</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('provider-dashboard')}
              className="px-5 py-2.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {submitting ? 'Publishing Listing...' : 'Publish Food Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
