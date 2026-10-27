import React, { useState, useEffect } from 'react';
import { FoodDonation, User, RecipientMatch } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LeafletMap } from '../components/LeafletMap';
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Building2,
  Calendar,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DonationDetailsPageProps {
  donation: FoodDonation;
  user: User | null;
  onNavigate: (tab: string) => void;
  onRequestDonation: (donationId: string, message: string, beneficiaries: number) => Promise<boolean>;
}

export const DonationDetailsPage: React.FC<DonationDetailsPageProps> = ({
  donation,
  user,
  onNavigate,
  onRequestDonation,
}) => {
  const [requestMessage, setRequestMessage] = useState('We can dispatch our insulated transport van immediately.');
  const [beneficiaries, setBeneficiaries] = useState<number>(donation.estimatedServings || 40);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [matchingRecommendations, setMatchingRecommendations] = useState<RecipientMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const deadlineDate = new Date(donation.collectionDeadline);
  const isExpired = deadlineDate.getTime() <= Date.now();
  const hoursRemaining = Math.max(0, (deadlineDate.getTime() - Date.now()) / (1000 * 3600));

  useEffect(() => {
    setLoadingMatches(true);
    fetch(`/api/matching/${donation.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) {
          setMatchingRecommendations(data.matches.slice(0, 3));
        }
      })
      .catch((err) => console.error('Failed to load matching:', err))
      .finally(() => setLoadingMatches(false));
  }, [donation.id]);

  const handleClaimDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const ok = await onRequestDonation(donation.id, requestMessage, beneficiaries);
      if (ok) {
        setSuccessMessage('Donation successfully reserved! A volunteer pickup task has been generated.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to reserve donation. Another recipient may have just claimed it.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapMarkers = [
    {
      id: donation.id,
      lat: donation.latitude,
      lng: donation.longitude,
      title: donation.title,
      subtitle: donation.pickupAddress,
      quantityKg: donation.quantityKg,
      type: 'DONATION' as const,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('find-food')}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Food Directory</span>
        </button>
        <StatusBadge status={donation.status} />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-neutral-100">
          <img
            src={donation.imageUrl}
            alt={donation.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent flex flex-col justify-end p-6 text-white">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              {donation.category.replace('_', ' ')}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mt-1 text-balance">
              {donation.title}
            </h1>
            <div className="text-xs text-neutral-300 mt-1 flex items-center gap-3">
              <span>{donation.providerName}</span>
              <span>·</span>
              <span className="font-mono tabular-nums font-bold text-white">{donation.quantityKg} kg</span>
              <span>·</span>
              <span>~{donation.estimatedServings} servings</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div>
              <div className="text-xs text-neutral-500 font-medium">Quantity</div>
              <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums mt-0.5">
                {donation.quantityKg} kg
              </div>
              <div className="text-[11px] text-neutral-500">~{donation.estimatedServings} meals</div>
            </div>

            <div>
              <div className="text-xs text-neutral-500 font-medium">Storage Method</div>
              <div className="text-sm font-semibold text-neutral-900 mt-1 truncate">
                {donation.storageCondition.replace(/_/g, ' ')}
              </div>
              <div className="text-[11px] text-neutral-500">Verified condition</div>
            </div>

            <div>
              <div className="text-xs text-neutral-500 font-medium">Prepared Timestamp</div>
              <div className="text-sm font-semibold text-neutral-900 mt-1 font-mono">
                {new Date(donation.preparedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[11px] text-neutral-500">{new Date(donation.preparedAt).toLocaleDateString()}</div>
            </div>

            <div>
              <div className="text-xs text-neutral-500 font-medium">Collection Deadline</div>
              <div className={`text-sm font-bold mt-1 font-mono ${isExpired ? 'text-rose-600' : 'text-amber-700'}`}>
                {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[11px] text-neutral-500">
                {isExpired ? 'Deadline elapsed' : `${hoursRemaining.toFixed(1)} hours remaining`}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Food Preparation & Details</h3>
              <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed">
                {donation.description || 'No detailed recipe description provided.'}
              </p>
            </div>

            {donation.storageNotes && (
              <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                <span className="font-bold text-neutral-900">Storage & Transit Instructions: </span>
                <span className="text-neutral-700">{donation.storageNotes}</span>
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-emerald-950">
                  Certified Food Safety Standards (HACCP)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-300">
                Audit Pass
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Internal temperature verified prior to listing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sanitary food-grade containers sealed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Commercial kitchen hygiene protocol verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected under Bill Emerson Good Samaritan Act</span>
              </div>
            </div>

            {donation.allergens && donation.allergens.length > 0 && (
              <div className="pt-2 border-t border-emerald-200/60 text-xs text-neutral-700">
                <strong className="text-neutral-900">Declared Allergens: </strong>
                {donation.allergens.join(', ')}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Pickup Location & Directions</span>
            </h3>
            <div className="text-xs text-neutral-600 mb-3">
              {donation.pickupAddress} · Provider: <strong className="text-neutral-800">{donation.providerName}</strong>
            </div>
            <LeafletMap
              markers={mapMarkers}
              center={[donation.latitude, donation.longitude]}
              zoom={14}
              height="300px"
            />
          </div>

          <div className="pt-6 border-t border-neutral-200">
            {donation.status === 'AVAILABLE' ? (
              <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Reserve This Donation for Your Shelter
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Atomic reservation locks the listing instantly to avoid duplicate bookings.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                ) : (
                  <form onSubmit={handleClaimDonation} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          Est. Beneficiaries to Feed
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={beneficiaries}
                          onChange={(e) => setBeneficiaries(parseInt(e.target.value, 10) || 1)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          Transit Vehicle / Notes
                        </label>
                        <input
                          type="text"
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Reserving...' : 'Confirm Instant Reservation & Dispatch Courier'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center">
                <span className="text-xs font-semibold text-neutral-700">
                  This listing is currently <strong className="text-neutral-900">{donation.status}</strong>
                  {donation.reservedByNgoName ? ` by ${donation.reservedByNgoName}` : ''}.
                </span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Recommended Recipient NGOs (Weighted Matching Engine)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('smart-matching')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Inspect All Match Scores →
              </button>
            </div>

            {loadingMatches ? (
              <div className="text-xs text-neutral-500 py-4 text-center">Calculating recipient weights...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {matchingRecommendations.map((match) => (
                  <div
                    key={match.ngo.id}
                    className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 truncate max-w-[170px]">
                        {match.ngo.name}
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {match.totalScore}/100
                      </span>
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      {match.distanceKm} km away · Capacity {match.ngo.capacityKgPerDay}kg/day
                    </div>
                    <div className="text-[11px] text-neutral-600 line-clamp-2">
                      {match.breakdown}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
