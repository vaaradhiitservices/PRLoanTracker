import { useAuthStore } from '../stores/useAuthStore';
import { Home, Plus, Landmark, AlertCircle } from 'lucide-react';

export default function PropertyPortal() {
  const profile = useAuthStore(state => state.profile);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="hidden md:block">
          <h3 className="text-xl font-bold">Property Owner Registry</h3>
          <p className="text-slate-400 text-xs mt-1">Welcome back, {profile?.firstName || 'User'}! Onboard and manage your real estate assets.</p>
        </div>
        <button
          type="button"
          className="w-full md:w-auto bg-slate-100 hover:bg-white text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Register Property
        </button>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Registered Properties</span>
            <Home className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Under Evaluation</span>
            <AlertCircle className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Total Asset Valuation</span>
            <Landmark className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-lg font-bold mt-2">₹0.00</p>
        </div>
      </div>

      {/* Main Info Blocks */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center py-12 mt-6">
        <Home className="h-10 w-10 text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold mb-1 text-slate-200">No properties registered</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          You haven't listed any real estate assets yet. You will be able to onboard properties and upload deeds in Phase 2.
        </p>
      </div>
    </div>
  );
}
