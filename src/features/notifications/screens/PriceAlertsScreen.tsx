import { NavigationContext } from '@react-navigation/native';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, SelectDrawer, Text } from '@/components/ui';
import { ScreenBackHeader, ScreenLayout } from '@/src/app';
import { ASSET_IDS } from '@/src/features/wallet/types';
import type { AssetId } from '@/src/features/wallet/types';

import { PriceAlertThresholdRow } from '../components';
import { usePriceAlertsStore } from '../state/usePriceAlertsStore';

export function PriceAlertsScreen() {
  const { t } = useTranslation('notifications');
  const navigation = useContext(NavigationContext);
  const alerts = usePriceAlertsStore((state) => state.alerts);
  const createAlert = usePriceAlertsStore((state) => state.createAlert);
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>('bitcoin');
  const [thresholdInput, setThresholdInput] = useState('5');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleBackPress = useCallback(() => {
    if (!navigation) {
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Notifications' as never);
  }, [navigation]);

  const assetOptions = useMemo(
    () =>
      ASSET_IDS.map((assetId) => ({
        value: assetId,
        label: t(`priceAlertAssetOption.${assetId}`),
      })),
    [t],
  );

  const handleCreateAlert = useCallback(() => {
    const parsedThreshold = Number.parseFloat(thresholdInput.replace(',', '.'));
    if (!Number.isFinite(parsedThreshold) || parsedThreshold <= 0 || parsedThreshold > 100) {
      setInputError(t('priceAlertThresholdValidation'));
      return;
    }

    createAlert({ assetId: selectedAssetId, thresholdPercent: parsedThreshold });
    setThresholdInput(parsedThreshold.toString());
    setInputError(null);
  }, [createAlert, selectedAssetId, t, thresholdInput]);

  return (
    <ScreenLayout
      className="bg-background"
      contentClassName="gap-4 px-4 pb-16 pt-4"
      scrollViewProps={{ testID: 'price-alerts-screen' }}
    >
      <ScreenBackHeader title={t('alertThresholds')} onBackPress={handleBackPress} canGoBack={navigation !== null} />
      <Card testID="price-alerts-create-card">
        <CardHeader className="gap-2">
          <CardTitle className="text-base">{t('priceAlertsCreateTitle')}</CardTitle>
          <Text variant="muted">{t('priceAlertsCreateDescription')}</Text>
        </CardHeader>
        <CardContent className="gap-3 pb-4">
          <View className="gap-1">
            <Text className="text-sm font-medium">{t('priceAlertAssetFieldLabel')}</Text>
            <SelectDrawer
              value={selectedAssetId}
              onValueChange={(value) => setSelectedAssetId(value as AssetId)}
              options={assetOptions}
              placeholder={t('priceAlertAssetFieldPlaceholder')}
              title={t('priceAlertAssetDrawerTitle')}
            />
          </View>
          <View className="gap-1">
            <Text className="text-sm font-medium">{t('priceAlertThresholdFieldLabel')}</Text>
            <View className="flex-row items-center gap-2">
              <Input
                value={thresholdInput}
                onChangeText={(text) => {
                  setThresholdInput(text);
                  if (inputError !== null) {
                    setInputError(null);
                  }
                }}
                keyboardType="numeric"
                placeholder={t('priceAlertThresholdPlaceholder')}
                className="flex-1"
                testID="new-price-alert-threshold-input"
              />
              <Text variant="muted">%</Text>
            </View>
          </View>
          {inputError ? (
            <Text variant="muted" className="text-xs text-destructive">
              {inputError}
            </Text>
          ) : null}
          <Button onPress={handleCreateAlert} testID="create-price-alert-button">
            <Text className="font-medium text-primary-foreground">{t('createPriceAlert')}</Text>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('priceAlertsActiveTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="gap-3 pb-4">
          {alerts.length === 0 ? <Text variant="muted">{t('priceAlertsEmpty')}</Text> : null}
          {alerts.map((alert) => (
            <PriceAlertThresholdRow key={alert.id} alert={alert} />
          ))}
        </CardContent>
      </Card>
    </ScreenLayout>
  );
}
