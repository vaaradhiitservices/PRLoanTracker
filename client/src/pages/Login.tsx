import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from '../stores/useAuthStore';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Login() {
  const setSession = useAuthStore(state => state.setSession);
  const loading = useAuthStore(state => state.loading);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [apiLoading, setApiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setApiLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Metadata passed to the handle_new_user database trigger
            data: {
              firstName,
              lastName
              // Roles array omitted: trigger will default to borrower (ID 1)
            }
          }
        });

        if (error) throw error;

        // If email confirmation is enabled locally, instruct the user to check their email
        if (data.user && !data.session) {
          setInfoMessage('Account created! A confirmation link has been sent to your email. Check your local Supabase Studio email inbox.');
        } else if (data.session) {
          // If confirmations are disabled, log in immediately
          await setSession(data.session);
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.session) {
          await setSession(data.session);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Authentication request failed.');
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800/80 p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Loan Tracker Portal</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Enterprise Multi-Role Loan Auditing Portal
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 text-blue-400 text-xs leading-relaxed">
            {infoMessage}
            <div className="mt-2 text-[10px] text-blue-300 font-mono">
              Retrieve link from Studio Inbox:
              <a href="http://localhost:54323/project/default/auth/inbox" target="_blank" rel="noreferrer" className="block text-blue-400 hover:underline mt-1">
                http://localhost:54323/project/default/auth/inbox
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Toggle sign in / sign up */}
          <div className="flex bg-slate-900/80 border border-slate-800 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${!isSignUp ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setIsSignUp(false); setErrorMessage(''); setInfoMessage(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${isSignUp ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setIsSignUp(true); setErrorMessage(''); setInfoMessage(''); }}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="John"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Doe"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={apiLoading || loading}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {apiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
