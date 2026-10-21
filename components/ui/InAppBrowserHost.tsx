import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { AppTheme } from '@/constants/AppTheme';
import { FontFamily } from '@/constants/Fonts';
import { CloseIconButton } from '@/components/ui/CloseIconButton';
import { registerInAppBrowser } from '@/helpers/inAppBrowserBridge';

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

/** In-app browser sheet — stays inside Udara with share + open-in-Safari escape hatches. */
export function InAppBrowserHost() {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const open = useCallback((nextUrl: string) => {
    setUrl(nextUrl);
    setCurrentUrl(nextUrl);
    setLoading(true);
    setLoadError(null);
    setCanGoBack(false);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setUrl('');
    setCurrentUrl('');
    setLoadError(null);
  }, []);

  useEffect(() => {
    registerInAppBrowser(open);
    return () => registerInAppBrowser(null);
  }, [open]);

  const onNavChange = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    if (nav.url) setCurrentUrl(nav.url);
  };

  const sharePage = async () => {
    const target = currentUrl || url;
    if (!target) return;
    try {
      if (Platform.OS === 'ios') {
        await Share.share({ url: target });
      } else {
        await Share.share({ message: target, title: domainFromUrl(target) });
      }
    } catch {
      /* user dismissed */
    }
  };

  const openExternally = () => {
    const target = currentUrl || url;
    if (target) void Linking.openURL(target);
  };

  const displayDomain = domainFromUrl(currentUrl || url);

  return (
    <Modal
      visible={visible && !!url}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <CloseIconButton onPress={close} variant="plain" style={styles.headerBtn} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayDomain}
          </Text>
          <View style={styles.headerBtn} />
        </View>

        <View style={styles.webWrap}>
          {url ? (
            <WebView
              ref={webRef}
              source={{ uri: url }}
              onLoadStart={() => {
                setLoading(true);
                setLoadError(null);
              }}
              onLoadEnd={() => setLoading(false)}
              onNavigationStateChange={onNavChange}
              onError={() => {
                setLoading(false);
                setLoadError('Could not load this page.');
              }}
              onHttpError={() => {
                setLoading(false);
                setLoadError('This page returned an error.');
              }}
              startInLoadingState
              allowsBackForwardNavigationGestures
              setSupportMultipleWindows={false}
              style={styles.webview}
            />
          ) : null}

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={AppTheme.accent} />
            </View>
          ) : null}

          {loadError ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable
                style={styles.errorBtn}
                onPress={openExternally}
                accessibilityRole="button"
                accessibilityLabel="Open in browser">
                <Text style={styles.errorBtnText}>Open in Safari</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.toolbarFloat, { bottom: Math.max(insets.bottom, 16) }]}>
            <BlurView intensity={72} tint="dark" style={styles.toolbarPill}>
              <Pressable
                onPress={() => webRef.current?.goBack()}
                disabled={!canGoBack}
                style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Back">
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={canGoBack ? '#fff' : 'rgba(255,255,255,0.35)'}
                />
              </Pressable>

              <Pressable
                onPress={() => void sharePage()}
                style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Share">
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>

              <Pressable
                onPress={() => webRef.current?.reload()}
                style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Refresh">
                <Ionicons name="refresh" size={20} color="#fff" />
              </Pressable>

              <Pressable
                onPress={openExternally}
                style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Open in browser">
                <Ionicons name="compass-outline" size={20} color="#fff" />
              </Pressable>
            </BlurView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: AppTheme.text,
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.2,
  },
  webWrap: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  errorWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    gap: 12,
  },
  errorText: {
    color: AppTheme.textMuted,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  errorBtn: {
    backgroundColor: AppTheme.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamily.semibold,
  },
  toolbarFloat: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toolbarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    minWidth: 220,
  },
  toolBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  pressed: { opacity: 0.65 },
});
