import React from 'react';
import { DonationStatus } from '../types';

interface StatusBadgeProps {
  status: DonationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
          Available for Pickup
        </span>
      );
    case 'REQUESTED':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />
          Request Pending
        </span>
      );
    case 'RESERVED':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />
          Reserved by NGO
        </span>
      );
    case 'PICKED_UP':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" aria-hidden="true" />
          In Transit / Picked Up
        </span>
      );
    case 'DELIVERED':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" aria-hidden="true" />
          Delivered & Confirmed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" aria-hidden="true" />
          Cancelled
        </span>
      );
    case 'EXPIRED':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" aria-hidden="true" />
          Expired
        </span>
      );
    default:
      return <span className={`text-xs text-neutral-600 ${className}`}>{status}</span>;
  }
};
