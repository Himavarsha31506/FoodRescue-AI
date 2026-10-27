import React, { useState } from 'react';
import { User, UserRole, OrganizationType } from '../types';
import { INITIAL_USERS } from '../data/sampleData';
import { ShieldCheck, Utensils, HeartHandshake, Truck, UserCircle2, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('marco@greentablebistro.com');
  const [loginPassword, setLoginPassword] = useState('demo1234');
  const [loginRole, setLoginRole] = useState<UserRole>('PROVIDER');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PROVIDER');
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgType, setRegOrgType] = useState<OrganizationType>('RESTAURANT');
  const [regAddress, setRegAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, role: loginRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      // Fallback for offline client
      const match = INITIAL_USERS.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
      if (match) {
        onLoginSuccess(match);
      } else {
        setErrorMsg(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          role: regRole,
          phone: regPhone,
          organizationName: regOrgName,
          orgType: regOrgType,
          address: regAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Quick Demo Switcher Strip */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Instant Demo Access
            </span>
            <span className="text-xs text-emerald-700">One-click role sign in</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoSelect(INITIAL_USERS[0])}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-neutral-900">Chef Marco</div>
              <div className="text-[11px] text-neutral-500">Provider (Bistro)</div>
            </button>
            <button
              onClick={() => handleQuickDemoSelect(INITIAL_USERS[1])}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-neutral-900">Rev. Angela</div>
              <div className="text-[11px] text-neutral-500">NGO (Hope Shelter)</div>
            </button>
            <button
              onClick={() => handleQuickDemoSelect(INITIAL_USERS[2])}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-neutral-900">Alex Rivera</div>
              <div className="text-[11px] text-neutral-500">Volunteer Courier</div>
            </button>
            <button
              onClick={() => handleQuickDemoSelect(INITIAL_USERS[3])}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-neutral-900">Platform Admin</div>
              <div className="text-[11px] text-neutral-500">System Governance</div>
            </button>
          </div>
        </div>

        {/* Main Auth Container */}
        <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
          {/* Segmented control tabs */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'LOGIN' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'REGISTER' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. marco@greentablebistro.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Designated Role
                </label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="PROVIDER">Food Provider (Restaurant, Hotel, Canteen)</option>
                  <option value="NGO">NGO / Recipient Shelter</option>
                  <option value="VOLUNTEER">Collection Volunteer Courier</option>
                  <option value="ADMIN">Platform Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="name@organization.org"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Select Role *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="PROVIDER">Food Provider</option>
                  <option value="NGO">NGO / Recipient Organization</option>
                  <option value="VOLUNTEER">Collection Volunteer</option>
                  <option value="ADMIN">Platform Administrator</option>
                </select>
              </div>

              {(regRole === 'PROVIDER' || regRole === 'NGO') && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regOrgName}
                      onChange={(e) => setRegOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="e.g. City Harvest Pantry"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Facility Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="e.g. 100 Main St, San Francisco, CA"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
