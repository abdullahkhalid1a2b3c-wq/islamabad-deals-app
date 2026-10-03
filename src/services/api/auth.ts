import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { toAppError } from '../../lib/errors';
import { useSessionStore, UserProfile } from '../../store/session';
import { queryClient } from '../../lib/queryClient';
import { SignUpInput, SignInInput, ProfileUpdateInput } from '../../validation/auth';
import { env } from '../../lib/env';

export interface AuthResponse {
  session: Session | null;
  profile: UserProfile | null;
  requiresEmailVerification?: boolean;
}

export const authService = {
  async signUp(input: SignUpInput): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            phone: input.phone,
          },
        },
      });

      if (error) throw error;

      // If email confirmation is required, session might be null initially
      const session = data.session;
      let profile: UserProfile | null = null;

      if (session) {
        profile = await this.getMyProfile();
        useSessionStore.getState().setSession(session, profile);
      }

      return {
        session,
        profile,
        requiresEmailVerification: !session,
      };
    } catch (err) {
      throw toAppError(err);
    }
  },

  async signIn(input: SignInInput): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) throw error;

      const profile = await this.getMyProfile();
      useSessionStore.getState().setSession(data.session, profile);

      return {
        session: data.session,
        profile,
      };
    } catch (err) {
      throw toAppError(err);
    }
  },

  async signInWithGoogle(): Promise<void> {
    const isGoogleEnabled = process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

    if (!isGoogleEnabled) {
      throw toAppError(
        new Error(
          'Google Sign-In is disabled. Set EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=true in .env to enable.',
        ),
      );
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'dealplate://auth/callback',
        },
      });

      if (error) throw error;
    } catch (err) {
      throw toAppError(err);
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'dealplate://auth/reset-password',
      });

      if (error) throw error;
    } catch (err) {
      throw toAppError(err);
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore sign out network failures
    } finally {
      // Clear Zustand store and reset TanStack Query cache completely
      useSessionStore.getState().clearSession();
      queryClient.clear();
    }
  },

  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      return null;
    }
  },

  async getMyProfile(): Promise<UserProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        // Fallback profile if DB trigger delay or mock mode
        return {
          id: user.id,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.user_metadata?.phone,
          role: 'USER',
          pushEnabled: true,
          createdAt: user.created_at,
          updatedAt: user.updated_at || user.created_at,
        };
      }

      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatar_url,
        role: data.role,
        preferredAreaId: data.preferred_area_id,
        pushEnabled: data.push_enabled,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      return null;
    }
  },

  async updateMyProfile(input: ProfileUpdateInput): Promise<UserProfile> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: Record<string, unknown> = {};
      if (input.fullName) updates.full_name = input.fullName;
      if (input.phone !== undefined) updates.phone = input.phone;
      if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedProfile: UserProfile = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatar_url,
        role: data.role,
        preferredAreaId: data.preferred_area_id,
        pushEnabled: data.push_enabled,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      useSessionStore.getState().setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      throw toAppError(err);
    }
  },
};
