import React from 'react';
import { Screen } from '../../src/components/ui/Screen';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function ExploreScreen() {
  return (
    <Screen>
      <EmptyState
        title="Explore Islamabad"
        message="Interactive area map and deal filtering is coming in a later step."
        icon="map-outline"
      />
    </Screen>
  );
}
