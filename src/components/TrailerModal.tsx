import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ExternalLink, Film } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { youtubeService } from '../services/youtube';

interface TrailerModalProps {
  visible: boolean;
  onClose: () => void;
  videoKey?: string | null;
  title?: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  visible,
  onClose,
  videoKey,
  title,
}) => {
  if (!videoKey) return null;

  const embedUrl = youtubeService.getYoutubeEmbedUrl(videoKey, true);
  const externalUrl = youtubeService.getYoutubeWatchUrl(videoKey);

  const handleOpenExternal = () => {
    Linking.openURL(externalUrl).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Film size={18} color={colors.primary} />
              <Text style={styles.title} numberOfLines={1}>
                {title ? `${title} - Trailer` : 'Official Trailer'}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                onPress={handleOpenExternal}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
                hitSlop={8}
              >
                <ExternalLink size={18} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
                hitSlop={8}
              >
                <X size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Video Player */}
          <View style={styles.playerContainer}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading Official Trailer...</Text>
                </View>
              )}
              startInLoadingState
            />
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by YouTube & TMDB • Official Trailer
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  btnPressed: {
    opacity: 0.6,
  },
});

export default TrailerModal;
