import React, { useState } from 'react';
import { User } from '../types';
import { Leaf, Menu, X, ChevronDown, UserCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  currentUser: User | null;
  onOpenRoleSwitcher: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  currentUser,
  onOpenRoleSwitcher,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLabel = () => {
    if (!currentUser) return 'Dashboard';
    switch (currentUser.role) {
      case 'PROVIDER':
        return 'Provider Hub';
      case 'NGO':
        return 'NGO Hub';
      case 'VOLUNTEER':
        return 'Volunteer Hub';
      case 'ADMIN':
        return 'Admin Panel';
    }
  };

  const getDashboardTabKey = () => {
    if (!currentUser) return 'auth';
    switch (currentUser.role) {
      case 'PROVIDER':
        return 'provider-dashboard';
      case 'NGO':
        return 'find-food';
      case 'VOLUNTEER':
        return 'volunteer-dashboard';
      case 'ADMIN':
        return 'admin-dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Leaf className="w-4 h-4 fill-white" />
            </span>
            <span>FoodRescue AI</span>
          </button>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => onNavigate('find-food')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'find-food' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              Find Food
            </button>
            <button
              onClick={() => onNavigate('add-donation')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'add-donation' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              Donate Food
            </button>
            <button
              onClick={() => onNavigate('smart-matching')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'smart-matching' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              Smart Matching
            </button>
            <button
              onClick={() => onNavigate('ml-prediction')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentTab === 'ml-prediction' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              ML Forecast
            </button>
            {currentUser && (
              <button
                onClick={() => onNavigate(getDashboardTabKey())}
                className={`hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  ['provider-dashboard', 'volunteer-dashboard', 'admin-dashboard'].includes(currentTab)
                    ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                    : ''
                }`}
              >
                {getDashboardLabel()}
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenRoleSwitcher}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-neutral-200"
                  title="Switch between Provider, NGO, Volunteer, and Admin views"
                >
                  <UserCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    Role: <strong className="text-neutral-900">{currentUser.role}</strong>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                Sign In / Join
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden gap-2">
            {currentUser && (
              <button
                onClick={onOpenRoleSwitcher}
                className="px-2.5 py-1 text-xs font-medium bg-neutral-100 rounded border border-neutral-200"
              >
                {currentUser.role}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('find-food');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            Find Food
          </button>
          <button
            onClick={() => {
              onNavigate('add-donation');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            Donate Food
          </button>
          <button
            onClick={() => {
              onNavigate('smart-matching');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            Smart Matching
          </button>
          <button
            onClick={() => {
              onNavigate('ml-prediction');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            ML Surplus Forecast
          </button>
          {currentUser && (
            <button
              onClick={() => {
                onNavigate(getDashboardTabKey());
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-semibold text-emerald-800"
            >
              {getDashboardLabel()}
            </button>
          )}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenRoleSwitcher();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-emerald-700"
            >
              Switch Demo Role
            </button>
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-neutral-500"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('auth');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-neutral-900"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
