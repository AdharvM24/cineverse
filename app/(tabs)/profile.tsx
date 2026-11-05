import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  User,
  Mail,
  Lock,
  LogOut,
  ShieldCheck,
  Film,
  Globe,
  Settings,
  Database,
  CheckCircle,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useAuthStore } from '../../src/store/authStore';
import { useWatchlistStore } from '../../src/store/watchlistStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    isAuthenticated,
    isConfigured,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  } = useAuthStore();

  const { watchlist, favorites } = useWatchlistStore();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.full_name || '');

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    if (authMode === 'signin') {
      const result = await signInWithEmail(email, password);
      setIsSubmitting(false);
      if (!result.success) {
        Alert.alert('Sign In Failed', result.error || 'Please check your credentials.');
      } else {
        Alert.alert('Welcome!', 'Signed in successfully.');
      }
    } else {
      if (!fullName.trim()) {
        Alert.alert('Full Name Required', 'Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      const result = await signUpWithEmail(email, password, fullName);
      setIsSubmitting(false);
      if (!result.success) {
        Alert.alert('Sign Up Failed', result.error || 'Could not complete registration.');
      } else {
        Alert.alert('Account Created', 'Your account is ready!');
      }
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateProfile({ full_name: tempName.trim() });
      setEditingName(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Screen Title */}
        <View style={styles.header}>
          <Text style={[styles.title, typography.screenTitle]}>User Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{
                uri:
                  user?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.userInfo}>
              {editingName ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Pressable style={styles.saveBtn} onPress={handleSaveName}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setEditingName(true)}>
                  <Text style={styles.userName}>{user?.full_name || 'Cinephile'}</Text>
                  <Text style={styles.tapToEdit}>Tap to edit name</Text>
                </Pressable>
              )}
              <Text style={styles.userEmail}>{user?.email || 'guest@cineverse.app'}</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{watchlist.length}</Text>
              <Text style={styles.statLabel}>Watchlist</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Legal Sources</Text>
            </View>
          </View>
        </View>

        {/* Supabase Status Banner */}
        <View style={styles.backendStatusBanner}>
          <Database size={18} color={isConfigured ? '#22C55E' : '#EAB308'} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusBannerTitle}>
              {isConfigured ? 'Supabase Cloud Connected' : 'Supabase Offline / Local Store Mode'}
            </Text>
            <Text style={styles.statusBannerDesc}>
              {isConfigured
                ? 'Your watchlist and preferences sync automatically with Supabase PostgreSQL.'
                : 'Watchlist & profile persist locally via AsyncStorage. Add your Supabase keys in .env for multi-device sync.'}
            </Text>
          </View>
        </View>

        {/* Supabase Email Authentication Form */}
        <View style={styles.authSection}>
          <View style={styles.authTabs}>
            <Pressable
              style={[
                styles.authTabBtn,
                authMode === 'signin' && styles.authTabBtnActive,
              ]}
              onPress={() => setAuthMode('signin')}
            >
              <Text
                style={[
                  styles.authTabText,
                  authMode === 'signin' && styles.authTabTextActive,
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.authTabBtn,
                authMode === 'signup' && styles.authTabBtnActive,
              ]}
              onPress={() => setAuthMode('signup')}
            >
              <Text
                style={[
                  styles.authTabText,
                  authMode === 'signup' && styles.authTabTextActive,
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            {authMode === 'signup' && (
              <View style={styles.inputField}>
                <User size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.formInput}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputField}>
              <Mail size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.formInput}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputField}>
              <Lock size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.formInput}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.authSubmitBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleAuthSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.authSubmitBtnText}>
                  {authMode === 'signin' ? 'Sign In to Supabase' : 'Create Account'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsHeader}>APP PREFERENCES</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIconWrap}>
              <Globe size={18} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Default Region for Watch Providers</Text>
              <Text style={styles.settingSubtitle}>India (IN) • Malayalam & Pan-India</Text>
            </View>
            <CheckCircle size={18} color="#22C55E" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconWrap}>
              <Film size={18} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Video Trailer Player</Text>
              <Text style={styles.settingSubtitle}>Official YouTube Embedded HD</Text>
            </View>
            <CheckCircle size={18} color="#22C55E" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconWrap}>
              <ShieldCheck size={18} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Attribution & API</Text>
              <Text style={styles.settingSubtitle}>The Movie Database (TMDB) API v3</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.btnPressed]}
            onPress={() => router.push('/welcome' as any)}
          >
            <View style={styles.settingIconWrap}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Animated Opening Screen</Text>
              <Text style={styles.settingSubtitle}>Replay the cinematic filmstrip welcome intro</Text>
            </View>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
          onPress={() => {
            signOut();
            Alert.alert('Signed Out', 'You have been logged out.');
          }}
        >
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Sign Out / Reset Session</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  tapToEdit: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  backendStatusBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    marginBottom: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusBannerTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusBannerDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  authSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  authTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  authTabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  authTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  formContainer: {
    gap: 10,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  formInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  authSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  authSubmitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
  btnPressed: {
    opacity: 0.8,
  },
});

