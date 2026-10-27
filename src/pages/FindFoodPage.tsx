import React, { useState, useMemo } from 'react';
import { FoodCategory, FoodDonation, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LeafletMap, MapMarkerItem } from '../components/LeafletMap';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Utensils,
  LayoutGrid,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FindFoodPageProps {
  user: User | null;
  donations: FoodDonation[];
  onNavigate: (tab: string) => void;
  onSelectDonation: (donation: FoodDonation) => void;
  onRequestDonation: (donationId: string, message: string, beneficiaries: number) => Promise<boolean>;
}

export const FindFoodPage: React.FC<FindFoodPageProps> = ({
  user,
  donations,
  onNavigate,
  onSelectDonation,
  onRequestDonation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('AVAILABLE');
  const [sortBy, setSortBy] = useState<'DEADLINE' | 'QUANTITY' | 'DISTANCE'>('DEADLINE');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  // Request modal state
  const [requestModalDonation, setRequestModalDonation] = useState<FoodDonation | null>(null);
  const [requestMessage, setRequestMessage] = useState('We are ready for rapid pickup with thermal cambros.');
  const [beneficiaries, setBeneficiaries] = useState<number>(45);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Filter & sort
  const filteredDonations = useMemo(() => {
    let result = [...donations];

    if (statusFilter !== 'ALL') {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((d) => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.providerName.toLowerCase().includes(q) ||
          d.pickupAddress.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'DEADLINE') {
        return new Date(a.collectionDeadline).getTime() - new Date(b.collectionDeadline).getTime();
      }
      if (sortBy === 'QUANTITY') {
        return b.quantityKg - a.quantityKg;
      }
      return 0; // default order
    });

    return result;
  }, [donations, statusFilter, selectedCategory, searchQuery, sortBy]);

  // Map markers
  const mapMarkers: MapMarkerItem[] = useMemo(() => {
    return filteredDonations.map((d) => ({
      id: d.id,
      lat: d.latitude,
      lng: d.longitude,
      title: d.title,
      subtitle: `${d.providerName} · ${d.pickupAddress}`,
      category: d.category,
      quantityKg: d.quantityKg,
      status: d.status,
      type: 'DONATION',
      onClick: () => onSelectDonation(d),
    }));
  }, [filteredDonations, onSelectDonation]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalDonation) return;

    setRequesting(true);
    setRequestError('');
    try {
      const success = await onRequestDonation(requestModalDonation.id, requestMessage, beneficiaries);
      if (success) {
        setRequestSuccess(true);
        setTimeout(() => {
          setRequestSuccess(false);
          setRequestModalDonation(null);
        }, 1200);
      }
    } catch (err: any) {
      setRequestError(err.message || 'Failed to claim donation');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Surplus Food Discovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-0.5">
            Available Surplus Food Donations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Verified food listings available for claiming by registered NGOs, soup kitchens, and community pantries.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-neutral-200/70 rounded-lg">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'LIST' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Listings</span>
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'MAP' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, provider, neighborhood..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white text-neutral-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="COOKED_MEALS">Cooked Meals / Prepared</option>
              <option value="BAKERY_PASTRY">Bakery & Pastry</option>
              <option value="FRESH_PRODUCE">Fresh Produce</option>
              <option value="DAIRY_EGGS">Dairy & Eggs</option>
              <option value="PACKAGED_GOODS">Packaged Goods</option>
              <option value="BEVERAGES">Beverages</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white text-neutral-700 font-medium"
            >
              <option value="AVAILABLE">Available Only</option>
              <option value="ALL">All Statuses</option>
              <option value="RESERVED">Reserved</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white text-neutral-700 font-medium"
            >
              <option value="DEADLINE">Sort: Deadline (Urgent)</option>
              <option value="QUANTITY">Sort: Quantity (Highest)</option>
            </select>
          </div>
        </div>

        {/* Category quick-filter tabs */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-neutral-400 shrink-0 font-medium mr-1">Quick Filter:</span>
          {['ALL', 'COOKED_MEALS', 'BAKERY_PASTRY', 'FRESH_PRODUCE', 'DAIRY_EGGS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat === 'ALL' ? 'All Food' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'MAP' ? (
        <div className="space-y-4">
          <div className="text-xs text-neutral-500 flex items-center justify-between">
            <span>Displaying {mapMarkers.length} geocoded listings across the San Francisco Bay Area</span>
            <span className="text-emerald-700 font-medium">Click any pin to inspect batch details</span>
          </div>
          <LeafletMap markers={mapMarkers} height="540px" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-neutral-500">
            Showing <strong className="text-neutral-900">{filteredDonations.length}</strong> donation listings
          </div>

          {filteredDonations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-neutral-200">
              <Utensils className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900">No Food Donations Found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No active listings matched your filter criteria. Try clearing search keywords or selecting "All Categories".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((item) => {
                const deadlineDate = new Date(item.collectionDeadline);
                const hoursLeft = Math.max(0, (deadlineDate.getTime() - Date.now()) / (1000 * 3600));
                const isUrgent = hoursLeft < 3 && item.status === 'AVAILABLE';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-all"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 bg-white/95 backdrop-blur-xs text-neutral-900 rounded-md shadow-xs">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="text-xs font-bold px-2 py-0.5 bg-neutral-900/90 text-white rounded-md font-mono tabular-nums">
                            {item.quantityKg} kg · ~{item.estimatedServings} servings
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <StatusBadge status={item.status} />
                          <span className={`font-mono text-xs ${isUrgent ? 'text-amber-700 font-bold' : ''}`}>
                            {hoursLeft > 0 ? `${hoursLeft.toFixed(1)}h remaining` : 'Expired'}
                          </span>
                        </div>

                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                          <span className="font-medium text-neutral-700">{item.providerName}</span>
                          <span>·</span>
                          <span className="truncate">{item.pickupAddress}</span>
                        </div>

                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Storage:</span>
                            <span className="font-medium text-neutral-700">
                              {item.storageCondition.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Allergens:</span>
                              <span className="font-medium text-neutral-700 truncate max-w-[150px]">
                                {item.allergens.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Strip */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => onSelectDonation(item)}
                        className="flex-1 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-center"
                      >
                        View Details
                      </button>

                      {item.status === 'AVAILABLE' ? (
                        <button
                          onClick={() => {
                            setRequestModalDonation(item);
                            setRequestError('');
                          }}
                          className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors text-center"
                        >
                          Request Donation
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-2 text-xs font-medium text-neutral-400 bg-neutral-50 rounded-lg border border-neutral-200 cursor-not-allowed text-center"
                        >
                          {item.status === 'RESERVED' ? 'Reserved' : item.status}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reservation / Request Modal */}
      {requestModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                Confirm Food Donation Request
              </h3>
              <button
                onClick={() => setRequestModalDonation(null)}
                className="text-neutral-400 hover:text-neutral-600 font-bold"
              >
                ✕
              </button>
            </div>

            {requestError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{requestError}</div>
              </div>
            )}

            {requestSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-neutral-900">Donation Successfully Reserved!</h4>
                <p className="text-xs text-neutral-500">
                  A volunteer pickup task has been automatically assigned to courier Alex Rivera.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="mt-4 space-y-4">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                  <div className="font-bold text-neutral-900">{requestModalDonation.title}</div>
                  <div className="text-neutral-500 mt-0.5">
                    {requestModalDonation.quantityKg} kg · {requestModalDonation.providerName}
                  </div>
                  <div className="text-emerald-700 font-semibold mt-1">
                    Pickup: {requestModalDonation.pickupAddress}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Estimated Beneficiaries Fed
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
                    Intake Notes & Transport Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                  <span className="font-bold">Atomic Reservation Lock:</span> Once confirmed, this listing is immediately locked to prevent any other recipient from booking it.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalDonation(null)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requesting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                  >
                    {requesting ? 'Reserving...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
