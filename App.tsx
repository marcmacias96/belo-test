import './global.css';
import './src/i18n';

import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/src/app';
import { MarketScreen } from '@/src/features/market';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <MarketScreen />
    </AppProviders>
  );
}
