import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { X, Image as ImageIcon, Check, Link2, Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onSelectAvatar: (url: string) => Promise<void>;
}

// Curated cinematic & pop-culture avatar presets
export const AVATAR_PRESETS = [
  {
    id: '1',
    name: 'Cinephile Classic',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Sci-Fi Pilot',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Action Maverick',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    name: 'Vintage Noir',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    name: 'Cinema Director',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '7',
    name: 'Marvel Vibe',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '8',
    name: 'Popcorn Buff',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
  },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to pick a profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setLoading(true);
        await onSelectAvatar(pickedUri);
        setLoading(false);
        onClose();
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error picking image', err.message || 'Could not select photo');
    }
  };

  const handleSelectPreset = async (url: string) => {
    setLoading(true);
    await onSelectAvatar(url);
    setLoading(false);
    onClose();
  };

  const handleSaveCustomUrl = async () => {
    if (!customUrl.trim()) return;
    setLoading(true);
    await onSelectAvatar(customUrl.trim());
    setLoading(false);
    setCustomUrl('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={styles.title}>Choose Profile Picture</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Gallery Upload Action */}
            <Pressable
              style={({ pressed }) => [styles.galleryCard, pressed && styles.btnPressed]}
              onPress={handlePickFromGallery}
              disabled={loading}
            >
              <View style={styles.galleryIconWrap}>
                <ImageIcon size={22} color="#FFF" />
              </View>
              <View style={styles.galleryTextWrap}>
                <Text style={styles.galleryTitle}>Choose from Gallery</Text>
                <Text style={styles.gallerySubtitle}>
                  Select any photo from your phone storage
                </Text>
              </View>
            </Pressable>

            {/* Presets Grid */}
            <Text style={styles.sectionHeader}>OR CHOOSE A CINEMATIC AVATAR</Text>
            <View style={styles.presetGrid}>
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = currentAvatarUrl === preset.url;
                return (
                  <Pressable
                    key={preset.id}
                    style={({ pressed }) => [
                      styles.presetItem,
                      isSelected && styles.presetItemActive,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={() => handleSelectPreset(preset.url)}
                    disabled={loading}
                  >
                    <Image
                      source={{ uri: preset.url }}
                      style={styles.presetAvatar}
                      contentFit="cover"
                    />
                    {isSelected && (
                      <View style={styles.selectedCheckBadge}>
                        <Check size={12} color="#FFF" />
                      </View>
                    )}
                    <Text style={styles.presetName} numberOfLines={1}>
                      {preset.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom URL Input */}
            <Text style={styles.sectionHeader}>OR ENTER IMAGE WEB URL</Text>
            <View style={styles.urlInputRow}>
              <View style={styles.inputWrapper}>
                <Link2 size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={colors.textMuted}
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Pressable
                style={[
                  styles.saveUrlBtn,
                  !customUrl.trim() && styles.saveUrlBtnDisabled,
                ]}
                onPress={handleSaveCustomUrl}
                disabled={!customUrl.trim() || loading}
              >
                <Text style={styles.saveUrlBtnText}>Save</Text>
              </Pressable>
            </View>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Updating Avatar...</Text>
              </View>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  galleryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    gap: 14,
    marginBottom: 20,
  },
  galleryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryTextWrap: {
    flex: 1,
  },
  galleryTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  gallerySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  presetItem: {
    width: '22%',
    alignItems: 'center',
    position: 'relative',
  },
  presetAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  presetItemActive: {
    transform: [{ scale: 1.05 }],
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 0,
    right: 4,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  presetName: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  urlInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  saveUrlBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveUrlBtnDisabled: {
    opacity: 0.5,
  },
  saveUrlBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
  },
  loadingText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
  },
});

export default AvatarPickerModal;

