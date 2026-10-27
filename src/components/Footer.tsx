import React from 'react';
import { Leaf, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onResetData }) => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 fill-white" />
              </span>
              <span>FoodRescue AI</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Smart food surplus prediction and community redistribution platform connecting restaurants, hotels, canteens, NGOs, and civic volunteers.
            </p>
            <div className="pt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>HACCP Food Safety Verified</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('find-food')} className="hover:text-white transition-colors">
                  Find Available Food
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('add-donation')} className="hover:text-white transition-colors">
                  Donate Surplus Meals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('smart-matching')} className="hover:text-white transition-colors">
                  Transparent Smart Matching
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ml-prediction')} className="hover:text-white transition-colors">
                  ML Surplus Prediction Model
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Safety & Regulations
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Bill Emerson Good Samaritan Act</li>
              <li>Strict Time & Temperature Controls</li>
              <li>Allergen Declaration Protocols</li>
              <li>Zero-Waste Kitchen Certification</li>
              <li>Chain of Custody Tracking</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Developer & Demo Controls
            </h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Operating in interactive preview mode with 10 sample providers, 8 NGOs, and 20 verified listings.
            </p>
            <button
              onClick={onResetData}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-md text-xs font-semibold transition-colors"
            >
              Reset Demo Dataset
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© 2026 FoodRescue AI. Committed to cutting avoidable food waste by 50%.</p>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">All data clearly labelled as demo metrics.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
