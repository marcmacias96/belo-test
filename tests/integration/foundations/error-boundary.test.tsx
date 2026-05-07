/// <reference types="jest" />

import { fireEvent, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ErrorBoundary } from '@/src/app/providers/ErrorBoundary';
import { renderWithProviders } from '@/src/shared/test';

function ThrowOnMount() {
  throw new Error('Test render error');
}

function ToggleError() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) throw new Error('Toggled error');

  return (
    <View>
      <Text testID="child-content">Child rendered correctly</Text>
      <Text
        testID="trigger-error"
        accessibilityRole="button"
        onPress={() => setShouldThrow(true)}
      >
        Trigger error
      </Text>
    </View>
  );
}

describe('error boundary foundations', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deberia mostrar fallback con CTA de retry cuando un hijo lanza durante render', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowOnMount />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Reintentar')).toBeTruthy();
    expect(screen.getByText('Test render error')).toBeTruthy();
  });

  it('deberia volver a renderizar el arbol cuando se presiona retry', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ToggleError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('child-content')).toBeTruthy();

    fireEvent.press(screen.getByTestId('trigger-error'));

    expect(screen.getByText('Reintentar')).toBeTruthy();

    fireEvent.press(screen.getByText('Reintentar'));

    expect(screen.getByTestId('child-content')).toBeTruthy();
  });
});
