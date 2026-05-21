import 'react-native-gesture-handler';

import {
  Oxanium_600SemiBold,
  Oxanium_700Bold,
  useFonts as useOxaniumFonts,
} from '@expo-google-fonts/oxanium';
import {
  Sarabun_400Regular,
  Sarabun_500Medium,
  Sarabun_600SemiBold,
  useFonts as useSarabunFonts,
} from '@expo-google-fonts/sarabun';
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
  const [oxaniumLoaded] = useOxaniumFonts({
    Oxanium_600SemiBold,
    Oxanium_700Bold,
  });
  const [sarabunLoaded] = useSarabunFonts({
    Sarabun_400Regular,
    Sarabun_500Medium,
    Sarabun_600SemiBold,
  });

  const fontsLoaded = oxaniumLoaded && sarabunLoaded;

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
