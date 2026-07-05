import { useAuthStore } from '../stores/useAuthStore';
import { Users, FilePlus, Landmark, AlertCircle } from 'lucide-react';

export default function AgentPortal() {
  const profile = useAuthStore(state => state.profile);

  return (
    <div>
      <div className="hidden md:block mb-6">
        <h3 className="text-xl font-bold">Bank Agent Workspace</h3>
        <p className="text-slate-400 text-xs mt-1">Welcome back, {profile?.firstName || 'User'}! Review borrower profiles and submit loan logins.</p>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">My Clients</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Active Applications</span>
            <FilePlus className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Sanctions Issued</span>
            <Landmark className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Alerts</span>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>
      </div>

      {/* Main Info Blocks */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center py-12 mt-6">
        <Users className="h-10 w-10 text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold mb-1 text-slate-200">No client data found</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          You haven't onboarded any clients or submitted applications. You will be able to manage client profiles in Phase 3.
        </p>
      </div>
    </div>
  );
}
