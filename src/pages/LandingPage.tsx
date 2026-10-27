import React from 'react';
import { SAMPLE_IMAGES } from '../data/sampleData';
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Heart,
  Truck,
  Sparkles,
  BarChart3,
  CheckCircle2,
  UtensilsCrossed
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenRoleSwitcher: () => void;
  analytics: {
    totalKgDelivered: number;
    availableKg: number;
    totalDonationsCount: number;
    mealsServed: number;
    co2AvoidedKg: number;
    totalProviders: number;
    totalNgos: number;
  };
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenRoleSwitcher,
  analytics,
}) => {
  return (
    <div className="bg-neutral-50 text-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-neutral-200 pt-12 pb-16 lg:pt-18 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Food Surplus Prediction & Redistribution</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.1] text-balance">
                Turn Surplus Food Into Someone’s Next Meal.
              </h1>

              <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
                FoodRescue AI connects restaurants, corporate kitchens, supermarkets, and event organizers with local NGOs, food banks, and civic delivery volunteers—backed by transparent matching algorithms and machine learning surplus predictions.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('add-donation')}
                  className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm inline-flex items-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Donate Food</span>
                </button>
                <button
                  onClick={() => onNavigate('find-food')}
                  className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm inline-flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Find Food</span>
                </button>
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-5 py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 font-semibold rounded-lg border border-neutral-300 transition-colors text-sm inline-flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  HACCP Food Safety Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Good Samaritan Act Protected
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-neutral-200">
                <img
                  src={SAMPLE_IMAGES.hero}
                  alt="Wholesome fresh food rescued from kitchens and bakeries for community meals"
                  className="w-full h-80 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                    Live Platform Snapshot
                  </div>
                  <div className="text-lg font-bold mt-1">
                    Fresh daily surplus redistributed in under 2 hours
                  </div>
                  <div className="text-xs text-neutral-200 mt-1 flex items-center gap-3">
                    <span>10 Commercial Kitchens</span>
                    <span>·</span>
                    <span>8 Partner Shelters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Live Platform Metrics */}
      <section className="bg-white border-b border-neutral-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Platform Impact (Interactive Demo Figures)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {analytics.totalKgDelivered} kg
              </div>
              <div className="text-xs text-neutral-600 mt-1 font-medium">Food Redistributed</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {analytics.mealsServed}
              </div>
              <div className="text-xs text-neutral-600 mt-1 font-medium">Meals Served</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {analytics.totalDonationsCount}
              </div>
              <div className="text-xs text-neutral-600 mt-1 font-medium">Donations Listed</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {analytics.totalProviders + analytics.totalNgos}
              </div>
              <div className="text-xs text-neutral-600 mt-1 font-medium">Partner Organizations</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {analytics.co2AvoidedKg} kg
              </div>
              <div className="text-xs text-neutral-600 mt-1 font-medium">CO₂e Emissions Cut</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            How FoodRescue AI Works
          </h2>
          <p className="text-neutral-600 text-sm mt-2">
            A closed-loop, verifiable system ensuring prepared surplus food reaches shelters safely before quality diminishes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">Predict & List</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Providers log surplus food with verified storage conditions, temperatures, allergens, and an absolute collection deadline.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">Smart Match</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Our transparent weighted engine calculates distances, recipient storage capacity, and dietary needs to rank ideal local NGOs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">Claim & Dispatch</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              NGOs reserve donations atomically to prevent double bookings. Volunteer couriers are dispatched with real-time transit directions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-2">Confirm & Impact</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pickup and delivery are timestamped with notes. Impact dashboards track rescued food weight, meals distributed, and carbon offsets.
            </p>
          </div>
        </div>
      </section>

      {/* Tri-Role Spotlight: Providers, NGOs, Volunteers */}
      <section className="bg-white border-y border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
              Built for Every Stakeholder
            </h2>
            <p className="text-neutral-600 text-sm mt-2">
              Tailored workspaces engineered to make food rescue fast, legally safe, and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Providers */}
            <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">For Food Providers</h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Restaurants, banquet halls, college dining commons, and grocery supermarkets can prevent disposal fees and automate donation pickups.
                </p>
                <ul className="space-y-2 text-xs text-neutral-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ML surplus forecast for upcoming shifts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Automated food safety compliance checks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified charity tax receipt records</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('add-donation')}
                className="mt-6 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <span>Post a donation listing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* NGOs */}
            <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">For NGOs & Shelters</h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Community kitchens, youth shelters, and emergency food banks access high-quality, hot and chilled food donations daily.
                </p>
                <ul className="space-y-2 text-xs text-neutral-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Geographic map filter with distance alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>One-click instant reservation lock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Dietary & allergy specification matching</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('find-food')}
                className="mt-6 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Browse live food listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volunteers */}
            <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">For Rescue Volunteers</h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Civic drivers and couriers receive optimized pickup routes to transport insulated cambros and produce crates safely.
                </p>
                <ul className="space-y-2 text-xs text-neutral-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Turn-by-turn pickup and drop-off maps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Direct coordinator contact details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Proof of delivery confirmation records</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('volunteer-dashboard')}
                className="mt-6 text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5"
              >
                <span>View volunteer routes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Verified Partner Feedback (Sample Content)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            Real Stories From The Frontlines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-neutral-700 leading-relaxed italic">
              "Before FoodRescue AI, our banquet team threw away nearly 40kg of catered meals on weekend conferences. Now, within 20 minutes of service closing, St. Vincent’s soup kitchen has claimed the surplus and a driver is already en route."
            </p>
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <div className="text-xs font-bold text-neutral-900">Elena Vasquez</div>
              <div className="text-xs text-neutral-500">Banquet Operations Director, Grand Bay Hotel</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-neutral-700 leading-relaxed italic">
              "The smart matching system understands our refrigeration limit and meal times. We don’t get surprise calls about food we can’t store; we get exactly what our 120 nightly shelter residents need."
            </p>
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <div className="text-xs font-bold text-neutral-900">Rev. Angela Davis</div>
              <div className="text-xs text-neutral-500">Executive Director, Hope Community Shelter</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-neutral-700 leading-relaxed italic">
              "The volunteer mobile flow is straightforward: accept task, see the pickup dock instructions, click Picked Up, and hand it to the shelter chef. Knowing the temperature was audited gives complete peace of mind."
            </p>
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <div className="text-xs font-bold text-neutral-900">Alex Rivera</div>
              <div className="text-xs text-neutral-500">Volunteer Courier, Civic Rescue Collective</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-emerald-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to stop food waste in your community?
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto leading-relaxed">
            Join hundreds of food businesses and non-profits redirecting nutritious surplus food every day.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('auth')}
              className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-lg shadow-sm transition-colors text-sm"
            >
              Register Organization
            </button>
            <button
              onClick={onOpenRoleSwitcher}
              className="px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold rounded-lg border border-emerald-700 transition-colors text-sm"
            >
              Explore Interactive Demo Roles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
