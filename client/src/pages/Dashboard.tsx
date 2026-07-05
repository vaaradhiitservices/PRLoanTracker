import React, { useState } from 'react';
import { useAuthStore, UserRole } from '../stores/useAuthStore';
import BorrowerPortal from './BorrowerPortal';
import AgentPortal from './AgentPortal';
import PropertyPortal from './PropertyPortal';
import AdminPortal from './AdminPortal';
import { LogOut, RefreshCw, Landmark, Home, User, Settings, Users, ShieldAlert } from 'lucide-react';

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

  // App-First Navigation State for Mobile Viewports
  const [mobileTab, setMobileTab] = useState<'home' | 'profile'>('home');

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
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-500 text-center space-y-2">
            <ShieldAlert className="h-8 w-8 text-slate-750" />
            <p className="text-xs font-semibold text-slate-400">Profile Syncing or No Role Assigned</p>
            <p className="text-[10px] text-slate-650 max-w-xs">
              Your profile is currently being loaded or does not have any assigned roles. Please contact an administrator.
            </p>
          </div>
        );
    }
  };

  const ActiveRoleIcon = activeRole ? ROLE_ICONS[activeRole] : User;

  // Render Mobile Profile & Configurations View (Tab 2)
  const MobileProfileView = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Profile & Settings</h3>
        <p className="text-slate-400 text-xs mt-1">Manage your active sessions, role views, and credentials.</p>
      </div>

      {/* User Information Card */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-350 font-bold text-lg">
            {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{profile?.firstName} {profile?.lastName}</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">{profile?.email}</p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-3 text-[11px] text-slate-400 space-y-2">
          <div className="flex justify-between">
            <span>Linked Phone</span>
            <span className="text-slate-300">{profile?.phone || 'Not linked'}</span>
          </div>
          <div className="flex justify-between">
            <span>KYC Account Status</span>
            <span className="text-yellow-500 uppercase font-semibold text-[10px]">{profile?.status}</span>
          </div>
        </div>
      </div>

      {/* Role Management Card */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Account Role Settings</h4>
        
        {roles.length > 1 ? (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500">You hold multiple roles. Switch your active portal view below:</p>
            <div className="relative">
              <select
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
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
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs bg-slate-900/40 border border-slate-850 p-3 rounded-lg text-slate-400">
            <ActiveRoleIcon className="h-4 w-4" />
            <span>Assigned Role: {activeRole}</span>
          </div>
        )}
      </div>

      {/* Session Actions */}
      <button
        type="button"
        className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-400 py-3 rounded-xl text-xs font-bold border border-red-900/40 transition-colors flex items-center justify-center gap-2"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" /> Sign Out from Device
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      
      {/* =========================================================================
          DESKTOP SIDEBAR PANEL (Only visible md: and above)
          ========================================================================= */}
      <aside className="hidden md:flex w-64 border-r border-slate-900 bg-slate-950 flex-col shrink-0 h-screen sticky top-0">
        {/* Logo Branding */}
        <div className="p-5 border-b border-slate-900 flex items-center gap-3">
          <Landmark className="h-5 w-5 text-blue-500 animate-glow" />
          <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            PR Loan Tracker
          </span>
        </div>

        {/* Profile Card & Role Switcher */}
        <div className="p-5 border-b border-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0 text-sm">
              {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{profile?.firstName || 'Loading...'} {profile?.lastName || ''}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{profile?.email || 'Synchronizing...'}</p>
            </div>
          </div>

          {roles.length > 1 ? (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                <RefreshCw className="h-2.5 w-2.5" /> Active Role View
              </label>
              <select
                className="w-full bg-slate-900/60 border border-slate-800 rounded-md px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
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
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-2 flex items-center gap-2">
              <ActiveRoleIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-450">
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

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-slate-600 font-bold px-2.5 mb-2">
            Main Menu
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10 shadow-sm cursor-pointer select-none">
            <ActiveRoleIcon className="h-4 w-4" />
            <span>Dashboard</span>
          </div>
        </nav>

        {/* Logout Actions */}
        <div className="p-4 border-t border-slate-900">
          <button
            type="button"
            className="w-full bg-slate-900 hover:bg-slate-800/40 text-slate-400 hover:text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-800/80"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 5. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 1. Mobile Header App Bar (Only visible < 768px) */}
        <header className="flex md:hidden h-14 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <Landmark className="h-5 w-5 text-blue-500 animate-glow" />
            <span className="font-extrabold text-xs tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {mobileTab === 'home' 
                ? (activeRole === 'borrower' ? 'Borrower Dashboard' : activeRole === 'BankAgent' ? 'Agent Workspace' : activeRole === 'PropertyOwner' ? 'Property Owner' : 'Admin Console') 
                : 'Account Profile'}
            </span>
          </div>
        </header>

        {/* 2. Desktop Header App Bar (Only visible >= 768px) */}
        <header className="hidden md:flex h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-8 items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <ActiveRoleIcon className="h-4 w-4 text-slate-500" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-400">
              {
                activeRole === 'borrower' ? 'Borrower Portal' :
                activeRole === 'BankAgent' ? 'Bank Agent Workspace' :
                activeRole === 'PropertyOwner' ? 'Property Owner Workspace' :
                activeRole === 'Admin' ? 'Admin Console' : 'Access Denied / Loading'
              }
            </h2>
          </div>
        </header>

        {/* 3. Independent Inner Body Viewport Scroll Pane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Conditional Mobile View switching or Desktop layout rendering */}
            <div className="md:block hidden">
              {renderActivePortal()}
            </div>
            <div className="block md:hidden">
              {mobileTab === 'home' ? renderActivePortal() : <MobileProfileView />}
            </div>
          </div>
        </main>

        {/* =========================================================================
            MOBILE BOTTOM NAVIGATION TAB BAR (Only visible < 768px)
            ========================================================================= */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950 border-t border-slate-905 items-center justify-around z-30 pb-safe shadow-lg">
          {/* Tab 1: Home Dashboard */}
          <button
            type="button"
            className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
              mobileTab === 'home' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-350'
            }`}
            onClick={() => setMobileTab('home')}
          >
            <ActiveRoleIcon className="h-5 w-5" />
            <span className="text-[9px] font-bold tracking-wide">Portal</span>
          </button>

          {/* Tab 2: Profile Settings */}
          <button
            type="button"
            className={`flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
              mobileTab === 'profile' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-350'
            }`}
            onClick={() => setMobileTab('profile')}
          >
            <User className="h-5 w-5" />
            <span className="text-[9px] font-bold tracking-wide">Settings</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
