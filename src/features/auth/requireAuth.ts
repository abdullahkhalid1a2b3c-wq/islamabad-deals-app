import { useSessionStore } from '../../store/session';

export function requireAuth(action: () => void, onRequireSignIn?: () => void): void {
  const { status } = useSessionStore.getState();

  if (status === 'authenticated') {
    action();
  } else if (onRequireSignIn) {
    onRequireSignIn();
  }
}
