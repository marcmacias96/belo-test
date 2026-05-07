import './global.css';
import './src/i18n';

import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/src/app';
import { RootNavigator } from '@/src/navigation';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppProviders>
  );
}
