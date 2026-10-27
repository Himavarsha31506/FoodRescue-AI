import React, { useState } from 'react';
import { CollectionTask, User } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

interface VolunteerDashboardProps {
  user: User;
  collections: CollectionTask[];
  onUpdateStatus: (taskId: string, status: 'PICKED_UP' | 'DELIVERED', notes?: string) => Promise<boolean>;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  user,
  collections,
  onUpdateStatus,
}) => {
  const [activeTask, setActiveTask] = useState<CollectionTask | null>(collections[0] || null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const handleStatusChange = async (taskId: string, status: 'PICKED_UP' | 'DELIVERED') => {
    setUpdating(true);
    setSuccessNotice('');
    try {
      const ok = await onUpdateStatus(taskId, status, deliveryNotes);
      if (ok) {
        setSuccessNotice(
          status === 'PICKED_UP'
            ? 'Task updated to In-Transit / Picked Up!'
            : 'Delivery completed and logged to platform audit ledger.'
        );
        setDeliveryNotes('');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Map markers for selected task: pickup point and delivery point
  const mapMarkers = activeTask
    ? [
        {
          id: `pickup-${activeTask.id}`,
          lat: activeTask.pickupCoords[0],
          lng: activeTask.pickupCoords[1],
          title: `Pickup: ${activeTask.providerName}`,
          subtitle: activeTask.pickupAddress,
          type: 'PROVIDER' as const,
        },
        {
          id: `delivery-${activeTask.id}`,
          lat: activeTask.deliveryCoords[0],
          lng: activeTask.deliveryCoords[1],
          title: `Delivery: ${activeTask.ngoName}`,
          subtitle: activeTask.deliveryAddress,
          type: 'NGO' as const,
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
          Field Courier Hub
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-0.5">
          Volunteer Collection & Transit Route
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Logged in as volunteer courier <strong className="text-neutral-800">{user.name}</strong> ({user.phone})
        </p>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between font-semibold">
          <span>{successNotice}</span>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-700">
            ✕
          </button>
        </div>
      )}

      {/* 2-Column: Task List + Active Task Details & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Tasks */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
            Assigned Collection Routes ({collections.length})
          </div>

          <div className="space-y-3">
            {collections.map((task) => {
              const isSelected = activeTask?.id === task.id;
              const isDone = task.status === 'DELIVERED';

              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTask(task)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-xs ring-1 ring-indigo-600'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-neutral-400 font-medium">#{task.id}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        task.status === 'DELIVERED'
                          ? 'bg-neutral-100 text-neutral-700'
                          : task.status === 'PICKED_UP'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {task.providerName} → {task.ngoName}
                  </h3>

                  <div className="mt-2 text-xs text-neutral-500 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{task.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>Deadline: {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Task Actions & Map */}
        <div className="lg:col-span-7 space-y-5">
          {activeTask ? (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase font-semibold">Active Dispatch</span>
                  <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                    {activeTask.providerName} to {activeTask.ngoName}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-neutral-900">
                    Status: {activeTask.status}
                  </span>
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-4 text-xs">
                {/* Step 1: Pickup */}
                <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      A
                    </span>
                    <span>Pickup Facility: {activeTask.providerName}</span>
                  </div>
                  <div className="text-neutral-700 pl-7">{activeTask.pickupAddress}</div>
                  <div className="text-neutral-500 pl-7 text-[11px]">
                    Instructions: Collect from kitchen loading bay. Check cambro latch seals.
                  </div>
                </div>

                {/* Step 2: Delivery */}
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                  <div className="flex items-center gap-2 text-blue-950 font-bold">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">
                      B
                    </span>
                    <span>Drop-Off Destination: {activeTask.ngoName}</span>
                  </div>
                  <div className="text-neutral-700 pl-7">{activeTask.deliveryAddress}</div>
                  <div className="text-neutral-500 pl-7 text-[11px]">
                    Receiving contact: Intake coordinator available until 18:30.
                  </div>
                </div>
              </div>

              {/* Route Map Preview */}
              <div>
                <div className="text-xs font-bold text-neutral-800 mb-2">Transit Route Map (OpenStreetMap)</div>
                <LeafletMap markers={mapMarkers} height="260px" />
              </div>

              {/* Action Buttons with Strict Validations */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                {activeTask.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStatusChange(activeTask.id, 'PICKED_UP')}
                    disabled={updating}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Food Picked Up from Kitchen (Mark In-Transit)</span>
                  </button>
                )}

                {activeTask.status === 'PICKED_UP' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Delivery Handover Notes & Recipient Sign-Off
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Handed directly to Chef Dave at shelter kitchen. Cold-chain intact."
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleStatusChange(activeTask.id, 'DELIVERED')}
                      disabled={updating}
                      className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Safe Delivery to Shelter</span>
                    </button>
                  </div>
                )}

                {activeTask.status === 'DELIVERED' && (
                  <div className="p-4 bg-neutral-100 rounded-lg text-center text-xs text-neutral-600">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-900">Task Successfully Completed</span>
                    {activeTask.deliveryNotes && (
                      <div className="mt-1 text-[11px] italic">"{activeTask.deliveryNotes}"</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-neutral-200">
              <Truck className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Select a collection task to view instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
