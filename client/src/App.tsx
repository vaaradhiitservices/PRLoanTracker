function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="glass-panel animate-glow max-w-md w-full rounded-2xl p-8 text-center border border-slate-800">
        <div className="flex justify-center mb-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            ✓
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          <span className="gradient-text">Loan Tracker Portal</span>
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Vite + React + Tailwind CSS client scaffolding successfully initialized.
        </p>
        <div className="text-left text-xs bg-slate-900/50 rounded-lg p-4 border border-slate-800/80 font-mono text-slate-300">
          <p className="text-blue-400 font-semibold mb-1">// Active Configuration:</p>
          <p>• Database: Supabase PostgreSQL</p>
          <p>• State Engine: Zustand + TanStack Query</p>
          <p>• Router: React Router DOM</p>
        </div>
      </div>
    </div>
  );
}

export default App;
