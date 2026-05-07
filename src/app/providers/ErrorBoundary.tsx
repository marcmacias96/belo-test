import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

type ErrorBoundaryProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center p-4">
          <Card className="w-full">
            <CardContent className="gap-4 p-6">
              <Text variant="cardTitle">Algo salió mal</Text>
              <Text variant="subtitle">
                {this.state.error?.message ?? 'Error inesperado en la aplicación.'}
              </Text>
              <Button
                accessibilityRole="button"
                accessibilityLabel="Reintentar"
                onPress={this.handleRetry}
              >
                <Text className="font-medium text-primary-foreground">Reintentar</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}
