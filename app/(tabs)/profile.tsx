import React from 'react';
import { Screen } from '../../src/components/ui/Screen';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function ProfileScreen() {
  return (
    <Screen>
      <EmptyState
        title="User Profile & Settings"
        message="Authentication, redemption history, and preference settings are coming in a later step."
        icon="person-outline"
      />
    </Screen>
  );
}
