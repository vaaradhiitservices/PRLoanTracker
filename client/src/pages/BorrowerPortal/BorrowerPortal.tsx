import { useState } from 'react';
import BorrowerDashboard from './BorrowerDashboard';
import BorrowerKYC from './BorrowerKYC';
import BorrowerLoans from './BorrowerLoans';
import { Home, FileText, Landmark } from 'lucide-react';

type SubTab = 'overview' | 'kyc' | 'loans';

export default function BorrowerPortal() {
  const [activeTab, setActiveTab] = useState<SubTab>('overview');

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs (Horizontal list aligned nicely for mobile thumbs) */}
      <div className="flex border-b border-slate-900 overflow-x-auto scrollbar-none gap-2 pb-px shrink-0">
        <button
          type="button"
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          onClick={() => setActiveTab('overview')}
        >
          <Home className="h-3.5 w-3.5" />
          Overview
        </button>

        <button
          type="button"
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'kyc'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          onClick={() => setActiveTab('kyc')}
        >
          <FileText className="h-3.5 w-3.5" />
          KYC Details
        </button>

        <button
          type="button"
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'loans'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          onClick={() => setActiveTab('loans')}
        >
          <Landmark className="h-3.5 w-3.5" />
          My Loans
        </button>
      </div>

      {/* Render subcomponents dynamically */}
      <div>
        {activeTab === 'overview' && <BorrowerDashboard />}
        {activeTab === 'kyc' && <BorrowerKYC />}
        {activeTab === 'loans' && <BorrowerLoans />}
      </div>
    </div>
  );
}
