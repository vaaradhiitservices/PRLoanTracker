import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

export type UserRole = 'borrower' | 'BankAgent' | 'PropertyOwner' | 'Admin';

const ROLE_MAP: Record<number, UserRole> = {
  1: 'borrower',
  2: 'BankAgent',
  3: 'PropertyOwner',
  4: 'Admin'
};

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: UserRole[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: any | null) => Promise<void>;
  setActiveRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  roles: [],
  activeRole: null,
  loading: true,
  initialized: false,

  setSession: async (session) => {
    set({ loading: true });
    
    if (!session?.user) {
      set({
        user: null,
        profile: null,
        roles: [],
        activeRole: null,
        loading: false,
        initialized: true
      });
      return;
    }

    try {
      // Fetch profile from public.user_profiles
      const { data: dbProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!dbProfile) {
        // Fallback if profile trigger hasn't finished propagating yet
        set({
          user: session.user,
          profile: null,
          roles: [],
          activeRole: null,
          loading: false,
          initialized: true
        });
        return;
      }

      // Map roles from database integer array to string array
      const dbRoleIds: number[] = dbProfile.roles || [];
      const roles = dbRoleIds.map(id => ROLE_MAP[id]).filter((r): r is UserRole => !!r);

      const profile: UserProfile = {
        id: dbProfile.id,
        email: dbProfile.email,
        phone: dbProfile.phone,
        firstName: dbProfile.first_name,
        lastName: dbProfile.last_name,
        roles,
        status: dbProfile.status
      };

      // Set the first role as default active role unless the user has already selected one
      const currentActive = get().activeRole;
      const activeRole = currentActive && roles.includes(currentActive) 
        ? currentActive 
        : (roles[0] || null);

      set({
        user: session.user,
        profile,
        roles,
        activeRole,
        loading: false,
        initialized: true
      });
    } catch (err) {
      console.error('Failed to load profile in auth store:', err);
      set({
        user: session.user,
        profile: null,
        roles: [],
        activeRole: null,
        loading: false,
        initialized: true
      });
    }
  },

  setActiveRole: (role) => {
    const { roles } = get();
    if (roles.includes(role)) {
      set({ activeRole: role });
    }
  },

  logout: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({
      user: null,
      profile: null,
      roles: [],
      activeRole: null,
      loading: false,
      initialized: true
    });
  }
}));
