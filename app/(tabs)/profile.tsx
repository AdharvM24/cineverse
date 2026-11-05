import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Switch,
  Modal,
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
  Camera,
  ChevronRight,
  Bookmark,
  Heart,
  Sliders,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';
import AvatarPickerModal from '../../src/components/AvatarPickerModal';
import CinematicModal, { ModalType } from '../../src/components/CinematicModal';
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
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Settings State
  const [selectedRegion, setSelectedRegion] = useState<'IN' | 'US'>('IN');
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [autoplayTrailers, setAutoplayTrailers] = useState(true);

  // Cinematic Modal State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: ModalType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    isDestructive?: boolean;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = (config: {
    type?: ModalType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    isDestructive?: boolean;
  }) => {
    setModalConfig({
      type: config.type || 'info',
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      onConfirm: config.onConfirm,
      isDestructive: config.isDestructive,
      visible: true,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  const isGuest = !isAuthenticated || !user || user.id === 'guest_user_demo_netflix';

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showModal({
        type: 'error',
        title: 'Required Fields',
        message: 'Please enter your email and password to continue.',
        confirmText: 'Understood',
      });
      return;
    }

    setIsSubmitting(true);
    if (authMode === 'signin') {
      const result = await signInWithEmail(email, password);
      setIsSubmitting(false);
      if (!result.success) {
        showModal({
          type: 'error',
          title: 'Sign In Failed',
          message: result.error || 'Please check your credentials and try again.',
          confirmText: 'Retry',
        });
      } else {
        showModal({
          type: 'success',
          title: 'Welcome Back!',
          message: 'Signed in successfully. Your watchlist, favorites, and profile are now synced.',
          confirmText: 'Continue',
        });
      }
    } else {
      if (!fullName.trim()) {
        showModal({
          type: 'error',
          title: 'Full Name Required',
          message: 'Please enter your full name to create your account.',
          confirmText: 'Understood',
        });
        setIsSubmitting(false);
        return;
      }
      const result = await signUpWithEmail(email, password, fullName);
      setIsSubmitting(false);
      if (!result.success) {
        showModal({
          type: 'error',
          title: 'Registration Error',
          message: result.error || 'Could not complete registration. Please try again.',
          confirmText: 'Retry',
        });
      } else {
        showModal({
          type: 'success',
          title: 'Account Created',
          message: 'Your CineVerse account is ready! Enjoy syncing movies and series across devices.',
          confirmText: 'Explore',
        });
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, typography.screenTitle]}>My Profile</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            {/* Pressable Avatar with Camera Overlay */}
            <Pressable
              style={({ pressed }) => [styles.avatarPressable, pressed && styles.btnPressed]}
              onPress={() => setAvatarModalVisible(true)}
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
              <View style={styles.cameraIconBadge}>
                <Camera size={13} color="#FFF" />
              </View>
            </Pressable>

            {/* User Info */}
            <View style={styles.userInfo}>
              {editingName ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                  />
                  <Pressable style={styles.saveBtn} onPress={handleSaveName}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </Pressable>
                  <Pressable style={styles.cancelBtn} onPress={() => setEditingName(false)}>
                    <X size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.namePressableRow}
                  onPress={() => {
                    setTempName(user?.full_name || '');
                    setEditingName(true);
                  }}
                >
                  <Text style={styles.userName}>{user?.full_name || 'Cinephile'}</Text>
                  <Edit2 size={13} color={colors.textSecondary} />
                </Pressable>
              )}

              <Text style={styles.userEmail}>{user?.email || 'guest@cineverse.app'}</Text>

              {/* Status Badge */}
              <View style={styles.badgeRow}>
                <View style={isGuest ? styles.guestPill : styles.verifiedPill}>
                  <Text style={isGuest ? styles.guestPillText : styles.verifiedPillText}>
                    {isGuest ? 'GUEST ACCOUNT' : 'SUPABASE CLOUD SYNCED'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Interactive Library Stats Dashboard */}
          <View style={styles.statsRow}>
            <Pressable
              style={({ pressed }) => [styles.statBox, pressed && styles.btnPressed]}
              onPress={() => router.push('/(tabs)/watchlist' as any)}
            >
              <Bookmark size={16} color={colors.primary} />
              <Text style={styles.statNumber}>{watchlist.length}</Text>
              <Text style={styles.statLabel}>Watchlist &rarr;</Text>
            </Pressable>

            <View style={styles.statDivider} />

            <Pressable
              style={({ pressed }) => [styles.statBox, pressed && styles.btnPressed]}
              onPress={() => router.push('/(tabs)/watchlist' as any)}
            >
              <Heart size={16} color="#EC4899" fill="#EC4899" />
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites &rarr;</Text>
            </Pressable>

            <View style={styles.statDivider} />

            <Pressable
              style={({ pressed }) => [styles.statBox, pressed && styles.btnPressed]}
              onPress={() => setRegionModalVisible(true)}
            >
              <Globe size={16} color="#3B82F6" />
              <Text style={styles.statNumber}>
                {selectedRegion === 'IN' ? '🇮🇳 IN' : '🇺🇸 US'}
              </Text>
              <Text style={styles.statLabel}>Region &rarr;</Text>
            </Pressable>
          </View>
        </View>

        {/* Backend Cloud Status Banner */}
        <View style={styles.backendStatusBanner}>
          <Database size={18} color={isConfigured ? '#22C55E' : '#EAB308'} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusBannerTitle}>
              {isConfigured ? 'Supabase Database Connected' : 'Supabase Local Storage Mode'}
            </Text>
            <Text style={styles.statusBannerDesc}>
              {isConfigured
                ? 'Your watchlist and preferences sync with PostgreSQL & Row Level Security.'
                : 'Running on local offline storage. Connected to your Supabase credentials.'}
            </Text>
          </View>
        </View>

        {/* Account Section: If Signed In -> Account Details Card; If Guest -> Sign In Form */}
        {!isGuest ? (
          <View style={styles.signedInCard}>
            <View style={styles.signedInHeader}>
              <View style={styles.verifiedBadge}>
                <CheckCircle size={14} color="#22C55E" />
                <Text style={styles.verifiedText}>Active Supabase Account</Text>
              </View>
              <Text style={styles.signedInId}>ID: {user?.id.substring(0, 8)}...</Text>
            </View>

            <View style={styles.accountDetailRow}>
              <Mail size={16} color={colors.textSecondary} />
              <Text style={styles.accountDetailText}>{user?.email}</Text>
            </View>

            <View style={styles.accountDetailRow}>
              <User size={16} color={colors.textSecondary} />
              <Text style={styles.accountDetailText}>{user?.full_name}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.signOutBtn, pressed && styles.btnPressed]}
              onPress={() => {
                showModal({
                  type: 'confirm',
                  title: 'Sign Out',
                  message: 'Are you sure you want to sign out of your CineVerse account on this device?',
                  confirmText: 'Sign Out',
                  cancelText: 'Stay Logged In',
                  isDestructive: true,
                  onConfirm: () => {
                    signOut();
                    showModal({
                      type: 'info',
                      title: 'Signed Out',
                      message: 'You have been safely signed out. You are now in Guest Mode.',
                      confirmText: 'OK',
                    });
                  },
                });
              }}
            >
              <LogOut size={16} color="#EF4444" />
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.authSection}>
            <View style={styles.guestNotice}>
              <User size={16} color={colors.primary} />
              <Text style={styles.guestNoticeText}>
                Currently browsing as Guest. Sign in or register to sync your library across devices.
              </Text>
            </View>

            <View style={styles.authTabs}>
              <Pressable
                style={[styles.authTabBtn, authMode === 'signin' && styles.authTabBtnActive]}
                onPress={() => setAuthMode('signin')}
              >
                <Text style={[styles.authTabText, authMode === 'signin' && styles.authTabTextActive]}>
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                style={[styles.authTabBtn, authMode === 'signup' && styles.authTabBtnActive]}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={[styles.authTabText, authMode === 'signup' && styles.authTabTextActive]}>
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
                style={({ pressed }) => [styles.authSubmitBtn, pressed && styles.btnPressed]}
                onPress={handleAuthSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.authSubmitBtnText}>
                    {authMode === 'signin' ? 'Sign In to Supabase' : 'Create Free Account'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Section 1: Streaming & Regional Preferences */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>STREAMING & REGION</Text>

          {/* Region Selector Item */}
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.btnPressed]}
            onPress={() => setRegionModalVisible(true)}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Globe size={18} color="#3B82F6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Watch Providers Region</Text>
              <Text style={styles.settingSubtitle}>
                {selectedRegion === 'IN'
                  ? '🇮🇳 India (Malayalam, Hotstar, Prime, Netflix)'
                  : '🇺🇸 United States (Global Providers)'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>

          {/* Autoplay Trailers Toggle */}
          <View style={styles.settingItem}>
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.12)' }]}>
              <Film size={18} color="#EAB308" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>HD Video Trailers</Text>
              <Text style={styles.settingSubtitle}>Official YouTube embedded playback</Text>
            </View>
            <Switch
              value={autoplayTrailers}
              onValueChange={setAutoplayTrailers}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section 2: App Experience */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>APP EXPERIENCE</Text>

          {/* Replay Opening Intro */}
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.btnPressed]}
            onPress={() => router.push('/welcome' as any)}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(229, 9, 20, 0.12)' }]}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Animated Opening Screen</Text>
              <Text style={styles.settingSubtitle}>Replay the 35mm moving filmstrip intro</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>

          {/* Change Avatar Shortcut */}
          <Pressable
            style={({ pressed }) => [styles.settingItem, pressed && styles.btnPressed]}
            onPress={() => setAvatarModalVisible(true)}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
              <Camera size={18} color="#A855F7" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Profile Avatar Gallery</Text>
              <Text style={styles.settingSubtitle}>Choose from photo library or presets</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Section 3: Legal & Attribution */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>ABOUT & LEGAL</Text>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
              <ShieldCheck size={18} color="#22C55E" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>The Movie Database (TMDB)</Text>
              <Text style={styles.settingSubtitle}>Live movie, series & cast metadata API</Text>
            </View>
            <ExternalLink size={16} color={colors.textMuted} />
          </View>

          <View style={styles.settingItem}>
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <ShieldCheck size={18} color="#3B82F6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>JustWatch Streaming Rights</Text>
              <Text style={styles.settingSubtitle}>Verified legal streaming platform directory</Text>
            </View>
            <ExternalLink size={16} color={colors.textMuted} />
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>CineVerse v1.0.0 • Expo SDK 58 • React Native 0.88</Text>
          </View>
        </View>

        {/* Guest Reset Button */}
        {isGuest && (
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
            onPress={() => {
              showModal({
                type: 'confirm',
                title: 'Reset Guest Session',
                message: 'This will reset your local temporary guest session and clear cached preferences.',
                confirmText: 'Reset Session',
                cancelText: 'Cancel',
                isDestructive: true,
                onConfirm: () => {
                  signOut();
                  showModal({
                    type: 'success',
                    title: 'Session Reset',
                    message: 'Guest cache cleared and new session started.',
                    confirmText: 'OK',
                  });
                },
              });
            }}
          >
            <LogOut size={16} color={colors.textMuted} />
            <Text style={[styles.logoutBtnText, { color: colors.textSecondary }]}>
              Reset Guest Session
            </Text>
          </Pressable>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Region Picker Modal */}
      <Modal
        visible={regionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRegionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.regionModalCard}>
            <Text style={styles.regionModalTitle}>Select Streaming Region</Text>
            <Text style={styles.regionModalSubtitle}>
              Watch providers and digital stores will adjust to show legal streaming availability in this region.
            </Text>

            <Pressable
              style={[
                styles.regionOption,
                selectedRegion === 'IN' && styles.regionOptionActive,
              ]}
              onPress={() => {
                setSelectedRegion('IN');
                setRegionModalVisible(false);
              }}
            >
              <Text style={styles.regionOptionEmoji}>🇮🇳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.regionOptionName}>India (Pan-India & Malayalam)</Text>
                <Text style={styles.regionOptionDesc}>Disney+ Hotstar, Prime Video, SonyLIV, Zee5, Netflix</Text>
              </View>
              {selectedRegion === 'IN' && <Check size={18} color={colors.primary} />}
            </Pressable>

            <Pressable
              style={[
                styles.regionOption,
                selectedRegion === 'US' && styles.regionOptionActive,
              ]}
              onPress={() => {
                setSelectedRegion('US');
                setRegionModalVisible(false);
              }}
            >
              <Text style={styles.regionOptionEmoji}>🇺🇸</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.regionOptionName}>United States & Global</Text>
                <Text style={styles.regionOptionDesc}>Netflix, Hulu, Prime Video, Max, Apple TV+</Text>
              </View>
              {selectedRegion === 'US' && <Check size={18} color={colors.primary} />}
            </Pressable>

            <Pressable
              style={styles.closeRegionBtn}
              onPress={() => setRegionModalVisible(false)}
            >
              <Text style={styles.closeRegionBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        visible={avatarModalVisible}
        onClose={() => setAvatarModalVisible(false)}
        currentAvatarUrl={user?.avatar_url}
        onSelectAvatar={async (url) => {
          await updateProfile({ avatar_url: url });
        }}
      />

      {/* Cinematic Custom Alert & Confirmation Modal */}
      <CinematicModal
        visible={modalConfig.visible}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        isDestructive={modalConfig.isDestructive}
      />
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
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarPressable: {
    position: 'relative',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  namePressableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  guestPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  guestPillText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  verifiedPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  verifiedPillText: {
    color: '#22C55E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editRow: {
    flexDirection: 'row',
    gap: 6,
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
  cancelBtn: {
    padding: 6,
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
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  statNumber: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  backendStatusBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
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
  signedInCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
    gap: 12,
  },
  signedInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  verifiedText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
  },
  signedInId: {
    color: colors.textMuted,
    fontSize: 11,
  },
  accountDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountDetailText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  signOutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  authSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  guestNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
    marginBottom: 14,
  },
  guestNoticeText: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
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
  settingsGroup: {
    marginBottom: 22,
  },
  settingsGroupTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
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
  versionRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  regionModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  regionModalTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  regionModalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  regionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 12,
  },
  regionOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
  },
  regionOptionEmoji: {
    fontSize: 24,
  },
  regionOptionName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  regionOptionDesc: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  closeRegionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeRegionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.7,
  },
});
