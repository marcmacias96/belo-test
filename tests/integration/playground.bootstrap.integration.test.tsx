/// <reference types="jest" />

import { screen } from '@testing-library/react-native';

import { PlaygroundScreen } from '@/src/features/playground';
import { renderWithProviders } from '@/src/shared/test';

describe('playground bootstrap integration', () => {
  it('renders the welcome copy with app providers', async () => {
    renderWithProviders(<PlaygroundScreen />);
    expect(
      await screen.findByText('Open up App.tsx to start working on your app!'),
    ).toBeTruthy();
  });
});
