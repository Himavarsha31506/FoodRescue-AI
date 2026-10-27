import React, { useState, useEffect } from 'react';
import { FoodDonation, MatchingWeights, RecipientMatch } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Sliders,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Clock,
  Building2,
  ShieldAlert
} from 'lucide-react';

interface SmartMatchingPageProps {
  donations: FoodDonation[];
  selectedDonation: FoodDonation | null;
  onSelectDonation: (donation: FoodDonation) => void;
  onNavigate: (tab: string) => void;
  onRequestDonation: (donationId: string, message: string, beneficiaries: number) => Promise<boolean>;
}

export const SmartMatchingPage: React.FC<SmartMatchingPageProps> = ({
  donations,
  selectedDonation,
  onSelectDonation,
  onNavigate,
  onRequestDonation,
}) => {
  const [activeDonationId, setActiveDonationId] = useState<string>(
    selectedDonation?.id || donations[0]?.id || ''
  );

  const [weights, setWeights] = useState<MatchingWeights>({
    distance: 35,
    capacity: 25,
    requirements: 25,
    urgency: 15,
  });

  const [matches, setMatches] = useState<RecipientMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimedNotice, setClaimedNotice] = useState('');

  const currentDonation = donations.find((d) => d.id === activeDonationId) || donations[0];

  useEffect(() => {
    if (selectedDonation) {
      setActiveDonationId(selectedDonation.id);
    }
  }, [selectedDonation]);

  const fetchMatches = () => {
    if (!currentDonation) return;
    setLoading(true);
    fetch(`/api/matching/${currentDonation.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) {
          setMatches(data.matches);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, [activeDonationId]);

  const handleWeightChange = (key: keyof MatchingWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);

    // Save to server
    fetch('/api/matching/weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then(() => fetchMatches())
      .catch((e) => console.error(e));
  };

  const handleClaimForNgo = async (match: RecipientMatch) => {
    if (!currentDonation) return;
    try {
      const ok = await onRequestDonation(
        currentDonation.id,
        `Matched automatically via weighted scoring algorithm (${match.totalScore}/100 match).`,
        currentDonation.estimatedServings
      );
      if (ok) {
        setClaimedNotice(`Successfully reserved for ${match.ngo.name}! Courier assigned.`);
        fetchMatches();
      }
    } catch (err: any) {
      setClaimedNotice(err.message || 'Failed to claim');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Transparent Redistribution Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-0.5">
              Smart Donation Matching
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              Transparent multi-factor ranking algorithm that evaluates geographic proximity, recipient capacity, cold-chain requirements, and deadline urgency. (Deterministic weighted ranking, distinct from statistical ML).
            </p>
          </div>

          {/* Donation Selector */}
          <div className="w-full md:w-80">
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Select Food Listing to Match:
            </label>
            <select
              value={activeDonationId}
              onChange={(e) => {
                setActiveDonationId(e.target.value);
                const d = donations.find((item) => item.id === e.target.value);
                if (d) onSelectDonation(d);
              }}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
            >
              {donations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title.slice(0, 32)}... ({d.quantityKg}kg)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {claimedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <span className="font-semibold">{claimedNotice}</span>
          <button onClick={() => setClaimedNotice('')} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Layout: Configurable Weights + Match Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Donation Summary + Configurable Weights */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Listing Spec Card */}
          {currentDonation && (
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Target Listing
                </span>
                <StatusBadge status={currentDonation.status} />
              </div>

              <h3 className="font-bold text-neutral-900 text-sm leading-snug">
                {currentDonation.title}
              </h3>

              <div className="text-xs text-neutral-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Provider:</span>
                  <span className="font-medium text-neutral-900">{currentDonation.providerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-medium text-neutral-900">{currentDonation.category.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quantity:</span>
                  <span className="font-bold text-neutral-900 font-mono">{currentDonation.quantityKg} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage:</span>
                  <span className="font-medium text-neutral-900">{currentDonation.storageCondition.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Deadline:</span>
                  <span className="font-medium text-amber-700 font-mono">
                    {new Date(currentDonation.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Configurable Matching Weights Sliders */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span>Adjust Ranking Weights</span>
              </div>
              <span className="text-[11px] text-neutral-400">Real-time re-ranking</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-700">Proximity / Distance</span>
                  <span className="font-mono font-bold text-neutral-900">{weights.distance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.distance}
                  onChange={(e) => handleWeightChange('distance', Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-700">Recipient Daily Capacity</span>
                  <span className="font-mono font-bold text-neutral-900">{weights.capacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.capacity}
                  onChange={(e) => handleWeightChange('capacity', Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-700">Dietary & Equipment Fit</span>
                  <span className="font-mono font-bold text-neutral-900">{weights.requirements}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.requirements}
                  onChange={(e) => handleWeightChange('requirements', Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-700">Deadline Urgency Factor</span>
                  <span className="font-mono font-bold text-neutral-900">{weights.urgency}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.urgency}
                  onChange={(e) => handleWeightChange('urgency', Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
              Total Weight Sum: <strong className="text-neutral-900">{weights.distance + weights.capacity + weights.requirements + weights.urgency}</strong> (normalized automatically).
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Candidate NGOs Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Ranked Candidate Recipients</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Organizations sorted by composite alignment score. Ineligible organizations are flagged.
              </p>
            </div>
            {loading && <span className="text-xs text-emerald-700 font-semibold animate-pulse">Calculating...</span>}
          </div>

          <div className="divide-y divide-neutral-100">
            {matches.map((item, index) => {
              return (
                <div key={item.ngo.id} className={`p-4 sm:p-5 transition-colors ${item.isEligible ? 'hover:bg-neutral-50/70' : 'bg-neutral-50/50 opacity-75'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Organization details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900">{item.ngo.name}</h4>
                        {item.isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                            <ShieldAlert className="w-3.5 h-3.5" /> Ineligible
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500 flex items-center gap-2 pl-7">
                        <span>{item.ngo.city}</span>
                        <span>·</span>
                        <span className="font-mono">{item.distanceKm} km</span>
                        <span>·</span>
                        <span>Capacity: {item.ngo.capacityKgPerDay} kg/day</span>
                      </div>
                    </div>

                    {/* Composite Score Pill */}
                    <div className="flex items-center gap-4 sm:self-center pl-7 sm:pl-0">
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono tabular-nums text-emerald-800">
                          {item.totalScore}
                          <span className="text-xs text-neutral-400 font-sans font-normal"> / 100</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium uppercase">Match Score</div>
                      </div>

                      {item.isEligible && currentDonation?.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleClaimForNgo(item)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors shrink-0"
                        >
                          Dispatch to NGO
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Factor Scoring Breakdown */}
                  <div className="mt-3 pl-7 pt-2 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-500">Distance Score: </span>
                      <strong className="text-neutral-900 font-mono">{item.distanceScore}/100</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500">Capacity Score: </span>
                      <strong className="text-neutral-900 font-mono">{item.capacityScore}/100</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500">Requirements: </span>
                      <strong className="text-neutral-900 font-mono">{item.requirementsScore}/100</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500">Urgency: </span>
                      <strong className="text-neutral-900 font-mono">{item.urgencyScore}/100</strong>
                    </div>
                  </div>

                  {!item.isEligible && item.ineligibilityReason && (
                    <div className="mt-2 pl-7 text-[11px] text-rose-700 font-medium">
                      Ineligibility factor: {item.ineligibilityReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
