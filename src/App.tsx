import React, { useState, useEffect } from 'react';
import { User, FoodDonation, CollectionTask } from './types';
import { INITIAL_USERS } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AddDonationPage } from './pages/AddDonationPage';
import { FindFoodPage } from './pages/FindFoodPage';
import { DonationDetailsPage } from './pages/DonationDetailsPage';
import { SmartMatchingPage } from './pages/SmartMatchingPage';
import { MLPredictionDashboard } from './pages/MLPredictionDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  // Current user defaults to Provider for immediate rich interactive state
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [collections, setCollections] = useState<CollectionTask[]>([]);
  const [analytics, setAnalytics] = useState({
    totalKgDelivered: 18,
    availableKg: 350,
    totalDonationsCount: 20,
    mealsServed: 40,
    co2AvoidedKg: 45,
    totalProviders: 10,
    totalNgos: 8,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch initial data
  const refreshData = async () => {
    try {
      const [donationsRes, collectionsRes, analyticsRes] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/collections'),
        fetch('/api/analytics'),
      ]);

      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        setDonations(dData.donations || []);
        if (!selectedDonation && dData.donations && dData.donations.length > 0) {
          setSelectedDonation(dData.donations[0]);
        }
      }

      if (collectionsRes.ok) {
        const cData = await collectionsRes.json();
        setCollections(cData.collections || []);
      }

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }
    } catch (e) {
      console.warn('Backend loading, fallback to local state if needed', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDonation = (donation: FoodDonation) => {
    setSelectedDonation(donation);
    setCurrentTab('donation-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDonationCreated = (newDonation: FoodDonation) => {
    setDonations((prev) => [newDonation, ...prev]);
    setSelectedDonation(newDonation);
    showToast(`Successfully created donation "${newDonation.title}"!`);
    refreshData();
  };

  // Atomic reservation handler
  const handleRequestDonation = async (
    donationId: string,
    message: string,
    beneficiaries: number
  ): Promise<boolean> => {
    try {
      const ngoId = currentUser?.organizationId || 'org-ngo-1';
      const ngoName = currentUser ? currentUser.name : 'Hope Community Shelter';

      const res = await fetch(`/api/donations/${donationId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId,
          ngoName,
          message,
          estimatedBeneficiaries: beneficiaries,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reserve donation');
      }

      // Update state locally
      setDonations((prev) =>
        prev.map((d) => (d.id === donationId ? data.donation : d))
      );
      if (selectedDonation?.id === donationId) {
        setSelectedDonation(data.donation);
      }

      showToast(`Donation reserved! Courier assigned for dispatch.`);
      refreshData();
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateStatus = async (donationId: string, status: any) => {
    try {
      const res = await fetch(`/api/donations/${donationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setDonations((prev) =>
          prev.map((d) => (d.id === donationId ? data.donation : d))
        );
        showToast(`Donation status updated to ${status}.`);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCollectionStatus = async (
    taskId: string,
    status: 'PICKED_UP' | 'DELIVERED',
    notes?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/collections/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, deliveryNotes: notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setCollections((prev) =>
          prev.map((c) => (c.id === taskId ? data.task : c))
        );
        showToast(`Collection task marked as ${status.replace('_', ' ')}!`);
        refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleResetData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      showToast('Database reset to fresh sample dataset.');
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Switched active workspace to: ${user.name} (${user.role})`);
    switch (user.role) {
      case 'PROVIDER':
        setCurrentTab('provider-dashboard');
        break;
      case 'NGO':
        setCurrentTab('find-food');
        break;
      case 'VOLUNTEER':
        setCurrentTab('volunteer-dashboard');
        break;
      case 'ADMIN':
        setCurrentTab('admin-dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg border border-neutral-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract compliant Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentTab('landing');
          showToast('Signed out successfully.');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
            analytics={analytics}
          />
        )}

        {currentTab === 'auth' && (
          <AuthPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              showToast(`Welcome back, ${user.name}!`);
              handleSelectUser(user);
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'provider-dashboard' && currentUser && (
          <ProviderDashboard
            user={currentUser}
            donations={donations}
            onNavigate={handleNavigate}
            onSelectDonation={handleSelectDonation}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentTab === 'add-donation' && (
          <AddDonationPage
            user={currentUser}
            onNavigate={handleNavigate}
            onDonationCreated={handleDonationCreated}
          />
        )}

        {currentTab === 'find-food' && (
          <FindFoodPage
            user={currentUser}
            donations={donations}
            onNavigate={handleNavigate}
            onSelectDonation={handleSelectDonation}
            onRequestDonation={handleRequestDonation}
          />
        )}

        {currentTab === 'donation-details' && selectedDonation && (
          <DonationDetailsPage
            donation={selectedDonation}
            user={currentUser}
            onNavigate={handleNavigate}
            onRequestDonation={handleRequestDonation}
          />
        )}

        {currentTab === 'smart-matching' && (
          <SmartMatchingPage
            donations={donations}
            selectedDonation={selectedDonation}
            onSelectDonation={(d) => setSelectedDonation(d)}
            onNavigate={handleNavigate}
            onRequestDonation={handleRequestDonation}
          />
        )}

        {currentTab === 'ml-prediction' && <MLPredictionDashboard />}

        {currentTab === 'volunteer-dashboard' && currentUser && (
          <VolunteerDashboard
            user={currentUser}
            collections={collections}
            onUpdateStatus={handleUpdateCollectionStatus}
          />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboard
            donations={donations}
            onResetData={handleResetData}
            onUpdateDonationStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onResetData={handleResetData} />
    </div>
  );
}
