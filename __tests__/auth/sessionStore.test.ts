import {
  useSessionStore,
  selectIsAdmin,
  selectIsOwner,
  UserProfile,
} from '../../src/store/session';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
  });

  it('starts with loading status and null session', () => {
    const state = useSessionStore.getState();
    expect(state.status).toBe('guest'); // After clearSession
    expect(state.session).toBeNull();
    expect(state.profile).toBeNull();
  });

  it('updates state on setSession', () => {
    const mockProfile: UserProfile = {
      id: 'usr-123',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      pushEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Partial mock session for unit test assertion
    useSessionStore.getState().setSession({ access_token: 'abc' } as any, mockProfile);

    const state = useSessionStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.profile?.fullName).toBe('Test User');
    expect(selectIsAdmin(state)).toBe(false);
    expect(selectIsOwner(state)).toBe(false);
  });

  it('correctly identifies ADMIN role', () => {
    const adminProfile: UserProfile = {
      id: 'admin-1',
      fullName: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      pushEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Partial mock session for unit test assertion
    useSessionStore.getState().setSession({ access_token: 'abc' } as any, adminProfile);
    const state = useSessionStore.getState();
    expect(selectIsAdmin(state)).toBe(true);
    expect(selectIsOwner(state)).toBe(true);
  });
});
