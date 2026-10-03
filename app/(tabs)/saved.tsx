import React from 'react';
import { Screen } from '../../src/components/ui/Screen';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function SavedScreen() {
  return (
    <Screen>
      <EmptyState
        title="Saved Deals"
        message="Your bookmarked deals and favorite restaurants will appear here. Coming in a later step."
        icon="heart-outline"
      />
    </Screen>
  );
}
