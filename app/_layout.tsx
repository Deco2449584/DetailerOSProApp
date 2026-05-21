import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { VehiclesProvider } from '@/context/VehiclesContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignorar si el splash ya no está disponible (recargas en caliente).
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VehiclesProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="light" />
        </VehiclesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
