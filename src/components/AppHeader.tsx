import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Bell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

interface AppHeaderProps {
  showGreeting?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ showGreeting = true }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'Cinephile';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topRow}>
        {/* Brand Logo */}
        <Pressable
          onPress={() => router.push('/' as any)}
          style={styles.logoContainer}
        >
          <Text style={styles.logoRed}>CINE</Text>
          <Text style={styles.logoWhite}>VERSE</Text>
        </Pressable>

        {/* Action Icons */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/search' as any)}
            hitSlop={8}
          >
            <Search size={22} color={colors.text} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/notifications' as any)}
            hitSlop={8}
          >
            <Bell size={22} color={colors.text} />
            <View style={styles.notificationDot} />
          </Pressable>

          {/* User Avatar */}
          <Pressable
            style={({ pressed }) => [styles.avatarBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Image
              source={{
                uri:
                  user?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              }}
              style={styles.avatar}
              contentFit="cover"
            />
          </Pressable>
        </View>
      </View>

      {showGreeting && (
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText}>
            {getGreeting()},{' '}
            <Text style={styles.greetingName}>{displayName}</Text>
          </Text>
          <Text style={styles.subGreeting}>
            What do you want to stream today?
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRed: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  logoWhite: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  avatarBtn: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 5,
  },
  greetingRow: {
    marginTop: 10,
  },
  greetingText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  greetingName: {
    color: colors.text,
    fontWeight: '700',
  },
  subGreeting: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  btnPressed: {
    opacity: 0.7,
  },
});

export default AppHeader;

