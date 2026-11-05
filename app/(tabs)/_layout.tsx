import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, Bookmark, User } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'My List',
          tabBarIcon: ({ color, size }) => <Bookmark size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 86 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

