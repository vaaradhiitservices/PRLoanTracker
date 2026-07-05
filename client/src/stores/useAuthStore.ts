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
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  aadhaar_number: string | null;
  pan_number: string | null;
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
  refreshProfile: () => Promise<void>;
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
        status: dbProfile.status,
        address_line1: dbProfile.address_line1 || null,
        address_line2: dbProfile.address_line2 || null,
        city: dbProfile.city || null,
        state: dbProfile.state || null,
        postal_code: dbProfile.postal_code || null,
        aadhaar_number: dbProfile.aadhaar_number || null,
        pan_number: dbProfile.pan_number || null
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
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data: dbProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!dbProfile) return;

      const dbRoleIds: number[] = dbProfile.roles || [];
      const roles = dbRoleIds.map(id => ROLE_MAP[id]).filter((r): r is UserRole => !!r);

      const profile: UserProfile = {
        id: dbProfile.id,
        email: dbProfile.email,
        phone: dbProfile.phone,
        firstName: dbProfile.first_name,
        lastName: dbProfile.last_name,
        roles,
        status: dbProfile.status,
        address_line1: dbProfile.address_line1 || null,
        address_line2: dbProfile.address_line2 || null,
        city: dbProfile.city || null,
        state: dbProfile.state || null,
        postal_code: dbProfile.postal_code || null,
        aadhaar_number: dbProfile.aadhaar_number || null,
        pan_number: dbProfile.pan_number || null
      };

      set({ profile });
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }
}));
