import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { useWatchlistStore } from '../src/store/watchlistStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 10,
    },
  },
});

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const loadWatchlist = useWatchlistStore((s) => s.loadItems);

  useEffect(() => {
    initializeAuth().then(() => {
      loadWatchlist();
    });
  }, [initializeAuth, loadWatchlist]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="movie/[id]"
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="tv/[id]"
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="category/[type]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
