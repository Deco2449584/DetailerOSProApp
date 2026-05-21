import 'react-native-gesture-handler';

import {
  Oxanium_600SemiBold,
  Oxanium_700Bold,
} from '@expo-google-fonts/oxanium';
import {
  Sarabun_400Regular,
  Sarabun_500Medium,
  Sarabun_600SemiBold,
} from '@expo-google-fonts/sarabun';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { VehiclesProvider } from '@/context/VehiclesContext';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash is no longer available (hot reload).
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oxanium_600SemiBold,
    Oxanium_700Bold,
    Sarabun_400Regular,
    Sarabun_500Medium,
    Sarabun_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.primary,
        }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

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
