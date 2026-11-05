import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ModalType = 'confirm' | 'success' | 'error' | 'info';

export interface CinematicModalProps {
  visible: boolean;
  onClose: () => void;
  type?: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
}

export const CinematicModal: React.FC<CinematicModalProps> = ({
  visible,
  onClose,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  isDestructive = false,
}) => {
  if (!visible) return null;

  const renderIcon = () => {
    switch (type) {
      case 'confirm':
        return (
          <View style={[styles.iconWrap, isDestructive ? styles.iconWrapDestructive : styles.iconWrapInfo]}>
            {isDestructive ? (
              <LogOut size={26} color="#EF4444" />
            ) : (
              <Sparkles size={26} color={colors.primary} />
            )}
          </View>
        );
      case 'success':
        return (
          <View style={[styles.iconWrap, styles.iconWrapSuccess]}>
            <CheckCircle2 size={26} color="#22C55E" />
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconWrap, styles.iconWrapError]}>
            <AlertTriangle size={26} color="#EF4444" />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconWrap, styles.iconWrapInfo]}>
            <Sparkles size={26} color={colors.primary} />
          </View>
        );
    }
  };

  const handleConfirmPress = () => {
    const action = onConfirm;
    onClose();
    if (action) {
      setTimeout(() => {
        action();
      }, 120);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={styles.card}>
          {/* Subtle Top Close Cross */}
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
            <X size={16} color={colors.textMuted} />
          </Pressable>

          {/* Icon Header */}
          <View style={styles.iconContainer}>{renderIcon()}</View>

          {/* Title & Message */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            {cancelText ? (
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.confirmBtn,
                isDestructive ? styles.destructiveBtn : styles.primaryBtn,
                !cancelText && { flex: 1 },
                pressed && styles.btnPressed,
              ]}
              onPress={handleConfirmPress}
            >
              <Text
                style={[
                  isDestructive ? styles.destructiveBtnText : styles.primaryBtnText,
                ]}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#16161A',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 24,
    position: 'relative',
    zIndex: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    marginBottom: 14,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  iconWrapSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  iconWrapError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  iconWrapInfo: {
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 9, 20, 0.35)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  destructiveBtn: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  destructiveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

export default CinematicModal;
