import { useAuthStore } from '../../stores/useAuthStore';
import { User, FileText, Landmark, Clock } from 'lucide-react';

export default function BorrowerDashboard() {
  const profile = useAuthStore(state => state.profile);

  return (
    <div className="space-y-6">
      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">KYC Status</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold mt-2 text-yellow-500 capitalize">{profile?.status || 'PENDING'}</p>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Active Loans</span>
            <Landmark className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-lg font-bold mt-2">0</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Total Outstanding</span>
            <Landmark className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold mt-2">₹0.00</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs">Next EMI Due</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold mt-2 text-slate-500">No active loans</p>
        </div>
      </div>

      {/* Main Info Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-semibold border-b border-slate-850 pb-2">My Profile Details</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Full Name</span>
              <span className="font-medium text-slate-200">{profile?.firstName} {profile?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email Address</span>
              <span className="font-medium text-slate-200">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone Number</span>
              <span className="font-medium text-slate-200">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Roles</span>
              <span className="font-medium text-slate-200 capitalize">{profile?.roles.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Dynamic status alert */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
          <User className="h-10 w-10 text-slate-600 mb-2" />
          <h4 className="text-xs font-semibold text-slate-350">General Information complete</h4>
          <p className="text-[10px] text-slate-550 max-w-sm mt-1">
            Your general credentials are synced. Head over to the "KYC Documents" tab at the top to upload your identity and income proofs.
          </p>
        </div>
      </div>
    </div>
  );
}
