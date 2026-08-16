import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { navigateToIncident } from '../navigation/navigationRef';
import { CATEGORY_META } from '../theme/categories';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';

const AUTO_DISMISS_MS = 4500;

export function NotificationToast() {
  const { toast, dismissToast } = useSocket();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-140)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(hide, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.key]);

  function hide() {
    Animated.timing(translateY, {
      toValue: -140,
      duration: 200,
      useNativeDriver: true,
    }).start(() => dismissToast());
  }

  if (!toast) return null;

  const meta = CATEGORY_META[toast.incident.category];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + spacing.sm, transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          hide();
          navigateToIncident(toast.incident.id);
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon} size={18} color={colors.white} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>New {meta.label.toLowerCase()} reported</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {toast.incident.title}
          </Text>
        </View>
        <TouchableOpacity onPress={hide} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.floating,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
