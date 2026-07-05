import { Landmark } from 'lucide-react';

export default function BorrowerLoans() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center py-12">
        <Landmark className="h-10 w-10 text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold mb-1 text-slate-200">No loan applications found</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          You haven't initiated any loans. Once your KYC is verified by a banker, you or your agent will be able to file loan logins in Phase 4.
        </p>
      </div>
    </div>
  );
}
