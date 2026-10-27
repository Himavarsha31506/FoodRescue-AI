import React, { useState, useEffect } from 'react';
import { FoodDonation, Organization, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Shield,
  Users,
  Building2,
  Package,
  TrendingUp,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface AdminDashboardProps {
  donations: FoodDonation[];
  onResetData: () => void;
  onUpdateDonationStatus: (donationId: string, status: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  donations,
  onResetData,
  onUpdateDonationStatus,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'PROVIDER' | 'NGO'>('ALL');

  const fetchAdminData = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
        if (data.organizations) setOrganizations(data.organizations);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleVerifyOrg = (orgId: string) => {
    fetch(`/api/admin/verify/${orgId}`, { method: 'PATCH' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrganizations((prev) =>
            prev.map((o) => (o.id === orgId ? { ...o, isVerified: !o.isVerified } : o))
          );
        }
      });
  };

  const providers = organizations.filter((o) => o.role === 'PROVIDER');
  const ngos = organizations.filter((o) => o.role === 'NGO');

  const deliveredDonations = donations.filter((d) => d.status === 'DELIVERED');
  const availableDonations = donations.filter((d) => d.status === 'AVAILABLE');
  const totalKgDiverted = deliveredDonations.reduce((acc, d) => acc + d.quantityKg, 0);

  // Category distribution for pie chart
  const categoryCounts: Record<string, number> = {};
  donations.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });
  const pieColors = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
  const pieData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat.replace('_', ' '),
    value: count,
  }));

  const filteredOrgs = organizations.filter((o) => {
    if (filterType === 'ALL') return true;
    return o.role === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Governance & Oversight Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-0.5">
            Platform Administration & Auditing
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            System health metrics, organization safety permits, and donation moderation controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* High-Level KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Registered Organizations</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {organizations.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {providers.length} Providers · {ngos.length} Recipient Shelters
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Total Food Rescued</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            {totalKgDiverted} <span className="text-sm font-sans font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">
            ~{Math.round(totalKgDiverted * 2.2)} meals served
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Active Food Listings</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {availableDonations.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {donations.length} total historical listings
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs text-neutral-500 font-medium">Verified Safety Ratio</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            100%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            0 food safety incidents reported
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart: Category Distribution */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-neutral-900">Donation Distribution by Category</h3>
            <p className="text-xs text-neutral-500">Breakdown of listings across food types</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-600 pt-2 border-t border-neutral-100">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Provider Capacity Breakdown */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-neutral-900">Top Partner Capacities (kg/day)</h3>
            <p className="text-xs text-neutral-500">Daily intake/donation headroom</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={organizations.slice(0, 8).map((o) => ({
                  name: o.name.slice(0, 14),
                  capacity: o.capacityKgPerDay,
                  role: o.role,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="capacity" name="Daily Capacity (kg)" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Organization Verification & Management Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Registered Organizations & Safety Permits</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verify health inspector certification and toggle participation privileges.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'ALL' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              All ({organizations.length})
            </button>
            <button
              onClick={() => setFilterType('PROVIDER')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'PROVIDER' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Providers ({providers.length})
            </button>
            <button
              onClick={() => setFilterType('NGO')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterType === 'NGO' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              NGOs ({ngos.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Organization & Type</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Permit / Safety ID</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900 text-sm">{org.name}</div>
                    <div className="text-neutral-500 text-xs mt-0.5">{org.type.replace('_', ' ')}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        org.role === 'PROVIDER' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {org.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-600">
                    <div>{org.address}</div>
                    <div className="text-[11px] text-neutral-400">{org.city}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">
                    {org.safetyCertId || 'IN-REVIEW'}
                  </td>

                  <td className="py-3.5 px-4 font-mono tabular-nums">
                    {org.capacityKgPerDay} kg/day
                  </td>

                  <td className="py-3.5 px-4">
                    {org.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending Audit
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleVerifyOrg(org.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                        org.isVerified
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {org.isVerified ? 'Revoke' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
