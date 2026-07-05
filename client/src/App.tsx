import { useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { useAuthStore } from './stores/useAuthStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize the global query client for caching and mutations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const user = useAuthStore(state => state.user);
  const initialized = useAuthStore(state => state.initialized);
  const setSession = useAuthStore(state => state.setSession);

  useEffect(() => {
    // 1. Fetch initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Subscribe to auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-xs tracking-wider font-semibold">Initializing Portal Session...</span>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {user ? <Dashboard /> : <Login />}
    </QueryClientProvider>
  );
}

export default App;
