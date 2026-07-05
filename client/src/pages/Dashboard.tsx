import React from 'react';
import { useAuthStore, UserRole } from '../stores/useAuthStore';
import BorrowerPortal from './BorrowerPortal';
import AgentPortal from './AgentPortal';
import PropertyPortal from './PropertyPortal';
import AdminPortal from './AdminPortal';
import { LogOut, RefreshCw, Landmark, Home, Users, Settings, User, ShieldAlert } from 'lucide-react';

const ROLE_ICONS: Record<UserRole, React.ComponentType<any>> = {
  borrower: User,
  BankAgent: Users,
  PropertyOwner: Home,
  Admin: Settings
};

export default function Dashboard() {
  const profile = useAuthStore(state => state.profile);
  const roles = useAuthStore(state => state.roles);
  const activeRole = useAuthStore(state => state.activeRole);
  const setActiveRole = useAuthStore(state => state.setActiveRole);
  const logout = useAuthStore(state => state.logout);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value as UserRole);
  };

  const renderActivePortal = () => {
    switch (activeRole) {
      case 'borrower':
        return <BorrowerPortal />;
      case 'BankAgent':
        return <AgentPortal />;
      case 'PropertyOwner':
        return <PropertyPortal />;
      case 'Admin':
        return <AdminPortal />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 text-center space-y-2">
            <ShieldAlert className="h-8 w-8 text-slate-650" />
            <p className="text-xs font-semibold text-slate-400">Profile Syncing or No Role Assigned</p>
            <p className="text-[10px] text-slate-650 max-w-xs">
              Your profile is currently being loaded or does not have any assigned roles. Please contact an administrator.
            </p>
          </div>
        );
    }
  };

  const ActiveRoleIcon = activeRole ? ROLE_ICONS[activeRole] : User;

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      {/* 1. Sidebar Panel */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col shrink-0">
        {/* Logo Branding */}
        <div className="p-6 border-b border-slate-900 flex items-center gap-3">
          <Landmark className="h-6 w-6 text-blue-500 animate-glow" />
          <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            PR Loan Tracker
          </span>
        </div>

        {/* Profile Card & Role Switcher */}
        <div className="p-6 border-b border-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0">
              {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.firstName || 'Loading...'} {profile?.lastName || ''}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{profile?.email || 'Synchronizing...'}</p>
            </div>
          </div>

          {/* Role switcher for multi-role accounts */}
          {roles.length > 1 ? (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" /> Active Role View
              </label>
              <select
                className="w-full bg-slate-900/60 border border-slate-800 rounded-md px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                value={activeRole || ''}
                onChange={handleRoleChange}
              >
                {roles.map(r => (
                  <option key={r} value={r} className="bg-slate-950">
                    {r === 'borrower' ? 'Borrower' : r === 'BankAgent' ? 'Bank Agent' : r === 'PropertyOwner' ? 'Property Owner' : 'Admin'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-2.5 flex items-center gap-2">
              <ActiveRoleIcon className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-450">
                Role: {
                  activeRole === 'borrower' ? 'Borrower' :
                  activeRole === 'BankAgent' ? 'Bank Agent' :
                  activeRole === 'PropertyOwner' ? 'Property Owner' :
                  activeRole === 'Admin' ? 'Admin' : 'Syncing...'
                }
              </span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-bold px-3 mb-2">
            Main Menu
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10 shadow-sm cursor-pointer select-none">
            <ActiveRoleIcon className="h-4 w-4" />
            <span>Dashboard</span>
          </div>
        </nav>

        {/* Logout Actions */}
        <div className="p-4 border-t border-slate-900">
          <button
            type="button"
            className="w-full bg-slate-900 hover:bg-slate-900/60 text-slate-400 hover:text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-800/80"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-filter backdrop-blur-md px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <ActiveRoleIcon className="h-5 w-5 text-slate-500" />
            <h2 className="text-sm font-semibold tracking-wide text-slate-300">
              {
                activeRole === 'borrower' ? 'Borrower Portal' :
                activeRole === 'BankAgent' ? 'Bank Agent Workspace' :
                activeRole === 'PropertyOwner' ? 'Property Owner Workspace' :
                activeRole === 'Admin' ? 'Admin Console' : 'Access Denied / Loading'
              }
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              System Online
            </span>
          </div>
        </header>

        {/* Inner Content Scroller */}
        <main className="flex-1 overflow-y-auto p-8 relative z-0">
          {renderActivePortal()}
        </main>
      </div>
    </div>
  );
}
