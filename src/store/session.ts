import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Weekday } from '../types/domain';

export type UserRole = 'USER' | 'RESTAURANT_OWNER' | 'ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  preferredAreaId?: string;
  pushEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AuthStatus = 'loading' | 'guest' | 'authenticated';

export interface SessionState {
  status: AuthStatus;
  session: Session | null;
  profile: UserProfile | null;

  setSession: (session: Session | null, profile: UserProfile | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setStatus: (status: AuthStatus) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'loading',
  session: null,
  profile: null,

  setSession: (session, profile) =>
    set({
      session,
      profile,
      status: session ? 'authenticated' : 'guest',
    }),

  setProfile: (profile) => set({ profile }),

  setStatus: (status) => set({ status }),

  clearSession: () =>
    set({
      session: null,
      profile: null,
      status: 'guest',
    }),
}));

// Selectors
export const selectIsAdmin = (state: SessionState): boolean =>
  state.status === 'authenticated' && state.profile?.role === 'ADMIN';

export const selectIsOwner = (state: SessionState): boolean =>
  state.status === 'authenticated' &&
  (state.profile?.role === 'RESTAURANT_OWNER' || state.profile?.role === 'ADMIN');
