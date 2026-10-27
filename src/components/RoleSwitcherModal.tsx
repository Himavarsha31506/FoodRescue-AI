import React from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/sampleData';
import { Check, Shield, Utensils, HeartHandshake, Truck } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectUser: (user: User) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const roleMeta: Record<UserRole, { label: string; org: string; icon: React.ReactNode; desc: string }> = {
    PROVIDER: {
      label: 'Food Provider',
      org: 'Green Table Bistro',
      icon: <Utensils className="w-5 h-5 text-emerald-600" />,
      desc: 'Post surplus batches, view ML surplus predictions, and manage pickup confirmations.',
    },
    NGO: {
      label: 'NGO Recipient',
      org: 'Hope Community Shelter & Pantry',
      icon: <HeartHandshake className="w-5 h-5 text-blue-600" />,
      desc: 'Browse available food, request donations, and track delivery intake.',
    },
    VOLUNTEER: {
      label: 'Collection Volunteer',
      org: 'Civic Food Rescue Network',
      icon: <Truck className="w-5 h-5 text-indigo-600" />,
      desc: 'View assigned transit routes, confirm pickups, and verify safe deliveries.',
    },
    ADMIN: {
      label: 'Platform Administrator',
      org: 'FoodRescue AI Core Operations',
      icon: <Shield className="w-5 h-5 text-amber-600" />,
      desc: 'Monitor platform KPIs, verify organizations, adjust matching weights, and audit listings.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 text-neutral-900">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Switch Testing Role</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Experience the application from all 4 dedicated stakeholder perspectives.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {INITIAL_USERS.map((user) => {
            const meta = roleMeta[user.role];
            const isSelected = currentUser?.id === user.id;

            return (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="p-2 rounded-md bg-white border border-neutral-200 shrink-0">
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-neutral-900">{meta.label}</span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-neutral-700 mt-0.5">
                    {user.name} · <span className="text-neutral-500">{meta.org}</span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {meta.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Demo mode active. Live data transitions are retained in session memory.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
