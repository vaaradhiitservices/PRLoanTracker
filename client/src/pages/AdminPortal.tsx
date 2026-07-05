import { useAuthStore } from '../stores/useAuthStore';
import { Settings, Shield, Key, Database } from 'lucide-react';

export default function AdminPortal() {
  const profile = useAuthStore(state => state.profile);

  return (
    <div>
      <div className="hidden md:block mb-6">
        <h3 className="text-xl font-bold">Admin System Console</h3>
        <p className="text-slate-400 text-xs mt-1">Welcome, System Admin {profile?.firstName}! Control core parameters and audit system events.</p>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Active Users</span>
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold mt-2">1</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Access Keys</span>
            <Key className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-lg font-bold mt-2">Active</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Database Engine</span>
            <Database className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-lg font-bold mt-2">Supabase DB</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Audit Logs</span>
            <Settings className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold mt-2">0 entries</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center py-12 mt-6">
        <Settings className="h-10 w-10 text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold mb-1 text-slate-200">System is operational</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          No settings configurations or audit entries have been generated. System audit checks will be wired up in Phase 6.
        </p>
      </div>
    </div>
  );
}
