import React from 'react';
import { FoodDonation, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Plus,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Utensils,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface ProviderDashboardProps {
  user: User;
  donations: FoodDonation[];
  onNavigate: (tab: string) => void;
  onSelectDonation: (donation: FoodDonation) => void;
  onUpdateStatus: (donationId: string, status: any) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  user,
  donations,
  onNavigate,
  onSelectDonation,
  onUpdateStatus,
}) => {
  // Filter donations belonging to this provider (or show all in demo mode)
  const myDonations = donations.filter(
    (d) => !user.organizationId || d.providerId === user.organizationId || d.providerName.includes('Green Table')
  );

  const availableDonations = myDonations.filter((d) => d.status === 'AVAILABLE');
  const availableKg = availableDonations.reduce((acc, d) => acc + d.quantityKg, 0);
  const collectedDonations = myDonations.filter((d) => d.status === 'DELIVERED');
  const pendingRequests = myDonations.filter((d) => ['REQUESTED', 'RESERVED'].includes(d.status));

  // Weekly surplus chart data
  const chartData = [
    { day: 'Mon', prepared: 75, surplus: 21, predicted: 22 },
    { day: 'Tue', prepared: 80, surplus: 13, predicted: 14 },
    { day: 'Wed', prepared: 82, surplus: 12, predicted: 13 },
    { day: 'Thu', prepared: 90, surplus: 16, predicted: 15 },
    { day: 'Fri', prepared: 115, surplus: 18, predicted: 19 },
    { day: 'Sat', prepared: 145, surplus: 22, predicted: 23 },
    { day: 'Sun', prepared: 130, surplus: 24, predicted: 23 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Provider Management Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-0.5">
            Green Table Bistro Operations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Logged in as {user.name} ({user.email}) · Safety Permit #SAFE-SF-8841
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('ml-prediction')}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>View ML Forecast</span>
          </button>
          <button
            onClick={() => onNavigate('add-donation')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Donation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Available Surplus</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {availableKg} <span className="text-sm font-sans font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-medium flex items-center gap-1">
            <span>{availableDonations.length} active batches ready</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Pending Pickup Requests</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-mono tabular-nums">
            {pendingRequests.length}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            Awaiting shelter pickup verification
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Successfully Rescued</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {collectedDonations.length} <span className="text-sm font-sans font-normal text-neutral-500">batches</span>
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% chain-of-custody recorded</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Upcoming Day Surplus (ML)</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            ~18.4 <span className="text-sm font-sans font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <span>Confidence: 88% (Random Forest)</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Prepared vs Surplus */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Weekly Preparation vs Actual Surplus</h3>
              <p className="text-xs text-neutral-500">Historical food logs (kg)</p>
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs inline-block"/> Prepared</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-600 rounded-xs inline-block"/> Surplus</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="prepared" name="Prepared (kg)" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="surplus" name="Surplus (kg)" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: ML Actual vs Predicted Surplus */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">ML Model Fit: Actual vs Predicted</h3>
              <p className="text-xs text-neutral-500">Random Forest Regressor (MAE: 1.84 kg)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              R² = 0.87
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="surplus" name="Actual Surplus" stroke="#047857" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="predicted" name="ML Predicted" stroke="#d97706" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Donation Listings Management Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Your Food Donation Listings</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Active, reserved, and completed donation batches with food safety tags.
            </p>
          </div>
          <button
            onClick={() => onNavigate('add-donation')}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            Create New Listing
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Quantity / Servings</th>
                <th className="py-3 px-4">Storage Condition</th>
                <th className="py-3 px-4">Collection Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {myDonations.map((item) => {
                const deadlineDate = new Date(item.collectionDeadline);
                const isUrgent = deadlineDate.getTime() - Date.now() < 3600000 * 3;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 text-sm max-w-xs truncate">
                        {item.title}
                      </div>
                      <div className="text-neutral-500 text-xs mt-0.5">
                        {item.category.replace('_', ' ')} · {item.providerName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      <div className="font-bold text-neutral-900">{item.quantityKg} kg</div>
                      <div className="text-neutral-500 font-sans text-xs">~{item.estimatedServings} servings</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs text-neutral-700">
                        {item.storageCondition.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className={`font-medium ${isUrgent && item.status === 'AVAILABLE' ? 'text-amber-700 font-semibold' : 'text-neutral-700'}`}>
                        {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({deadlineDate.toLocaleDateString()})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                      {item.reservedByNgoName && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Claimed: {item.reservedByNgoName}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectDonation(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            onSelectDonation(item);
                            onNavigate('smart-matching');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        >
                          Match NGOs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
