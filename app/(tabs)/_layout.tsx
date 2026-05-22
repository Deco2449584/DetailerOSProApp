import { Redirect, Tabs, useRouter } from 'expo-router';

import { AppTabBar } from '@/components/AppTabBar';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background.primary },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Records' }} />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Scan' }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push('/scanner');
          },
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
