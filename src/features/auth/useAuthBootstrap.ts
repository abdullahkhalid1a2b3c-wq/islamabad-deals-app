import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/api/auth';
import { useSessionStore } from '../../store/session';
import { logger } from '../../lib/logger';

export function useAuthBootstrap() {
  const setSession = useSessionStore((state) => state.setSession);
  const setStatus = useSessionStore((state) => state.setStatus);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const session = await authService.getSession();

        if (session && mounted) {
          const profile = await authService.getMyProfile();
          setSession(session, profile);
        } else if (mounted) {
          setStatus('guest');
        }
      } catch (err) {
        logger.error('[useAuthBootstrap] Error restoring session:', err);
        if (mounted) setStatus('guest');
      }
    }

    initAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`[onAuthStateChange] Event: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const profile = await authService.getMyProfile();
          setSession(session, profile);
        }
      } else if (event === 'SIGNED_OUT') {
        useSessionStore.getState().clearSession();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setStatus]);
}
