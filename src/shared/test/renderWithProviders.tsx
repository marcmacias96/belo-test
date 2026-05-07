import {
  render,
  type RenderAPI,
  type RenderOptions,
} from '@testing-library/react-native';
import { type ReactElement } from 'react';

import { AppProviders } from '@/src/app';
import '@/src/i18n';

type WrappedRenderOptions = Omit<RenderOptions, 'wrapper'>;

export function renderWithProviders(
  ui: ReactElement,
  options?: WrappedRenderOptions,
): RenderAPI {
  return render(ui, {
    wrapper: AppProviders,
    ...options,
  });
}
