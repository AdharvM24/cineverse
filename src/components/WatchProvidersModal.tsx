import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { X, ExternalLink, Tv, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { WatchProvidersResponse } from '../types/movie';
import { getProviderLogoUrl } from '../utils/imageUrl';

interface WatchProvidersModalProps {
  visible: boolean;
  onClose: () => void;
  providers?: WatchProvidersResponse | null;
  title?: string;
}

export const WatchProvidersModal: React.FC<WatchProvidersModalProps> = ({
  visible,
  onClose,
  providers,
  title,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'IN' | 'US'>('IN');

  if (!providers?.results) return null;

  const currentCountry =
    providers.results[selectedRegion] ||
    providers.results.IN ||
    providers.results.US ||
    Object.values(providers.results)[0];

  const handleOpenLink = () => {
    if (currentCountry?.link) {
      Linking.openURL(currentCountry.link).catch(() => {});
    }
  };

  const hasAnyProvider =
    Boolean(currentCountry?.flatrate?.length) ||
    Boolean(currentCountry?.rent?.length) ||
    Boolean(currentCountry?.buy?.length) ||
    Boolean(currentCountry?.free?.length);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Tv size={18} color={colors.primary} />
              <Text style={styles.title} numberOfLines={1}>
                Where to Watch: {title}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
              hitSlop={8}
            >
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Region Tabs */}
          <View style={styles.regionRow}>
            <Pressable
              style={[
                styles.regionTab,
                selectedRegion === 'IN' && styles.regionTabActive,
              ]}
              onPress={() => setSelectedRegion('IN')}
            >
              <Text
                style={[
                  styles.regionText,
                  selectedRegion === 'IN' && styles.regionTextActive,
                ]}
              >
                🇮🇳 India
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.regionTab,
                selectedRegion === 'US' && styles.regionTabActive,
              ]}
              onPress={() => setSelectedRegion('US')}
            >
              <Text
                style={[
                  styles.regionText,
                  selectedRegion === 'US' && styles.regionTextActive,
                ]}
              >
                🇺🇸 United States
              </Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {!hasAnyProvider ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  No streaming providers found in this region
                </Text>
                <Text style={styles.emptyDesc}>
                  Streaming rights change regularly. Check theatrical release or regional digital store updates.
                </Text>
              </View>
            ) : (
              <>
                {/* Stream / Subscription */}
                {Boolean(currentCountry?.flatrate?.length) && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>STREAM / SUBSCRIPTION</Text>
                    <View style={styles.providerGrid}>
                      {currentCountry.flatrate!.map((p) => (
                        <View key={p.provider_id} style={styles.providerItem}>
                          <Image
                            source={{ uri: getProviderLogoUrl(p.logo_path) }}
                            style={styles.providerLogo}
                            contentFit="cover"
                          />
                          <Text style={styles.providerName} numberOfLines={1}>
                            {p.provider_name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Rent */}
                {Boolean(currentCountry?.rent?.length) && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>RENT</Text>
                    <View style={styles.providerGrid}>
                      {currentCountry.rent!.map((p) => (
                        <View key={p.provider_id} style={styles.providerItem}>
                          <Image
                            source={{ uri: getProviderLogoUrl(p.logo_path) }}
                            style={styles.providerLogo}
                            contentFit="cover"
                          />
                          <Text style={styles.providerName} numberOfLines={1}>
                            {p.provider_name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Buy */}
                {Boolean(currentCountry?.buy?.length) && (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeader}>BUY</Text>
                    <View style={styles.providerGrid}>
                      {currentCountry.buy!.map((p) => (
                        <View key={p.provider_id} style={styles.providerItem}>
                          <Image
                            source={{ uri: getProviderLogoUrl(p.logo_path) }}
                            style={styles.providerLogo}
                            contentFit="cover"
                          />
                          <Text style={styles.providerName} numberOfLines={1}>
                            {p.provider_name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Legal Notice */}
            <View style={styles.disclaimerBox}>
              <ShieldCheck size={16} color={colors.textSecondary} />
              <Text style={styles.disclaimerText}>
                Official provider data provided by JustWatch via TMDB. CineVerse directs users solely to licensed legal streaming services.
              </Text>
            </View>

            {currentCountry?.link && (
              <Pressable
                style={({ pressed }) => [styles.tmdbLinkBtn, pressed && styles.btnPressed]}
                onPress={handleOpenLink}
              >
                <Text style={styles.tmdbLinkText}>View All Rights on JustWatch</Text>
                <ExternalLink size={14} color={colors.text} />
              </Pressable>
            )}
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
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  regionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  regionTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  regionText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  regionTextActive: {
    color: '#FFF',
  },
  body: {
    padding: 16,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  providerItem: {
    alignItems: 'center',
    width: 68,
  },
  providerLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.card,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  providerName: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  tmdbLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tmdbLinkText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
  },
});

export default WatchProvidersModal;

