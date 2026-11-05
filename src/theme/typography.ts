import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
};

export default typography;

