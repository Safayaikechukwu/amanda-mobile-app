import { ReactNode, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePathname } from 'expo-router';

import { SidebarContent, useDrawerWidth } from '@/components/app/Sidebar';
import { AppShellProvider, useAppShell } from '@/context/AppShellContext';
import { AppTheme } from '@/constants/AppTheme';
import { DrawerTokens } from '@/constants/DrawerTokens';

type Props = { children: ReactNode };

function AppDrawer({ children }: Props) {
  const { sidebarOpen, openSidebar, closeSidebar } = useAppShell();
  const drawerWidth = useDrawerWidth();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  // ChatGPT: choosing a destination closes the drawer (Settings is a sheet — not a destination)
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      closeSidebar();
    }
  }, [pathname, closeSidebar]);

  return (
    <Drawer
      open={sidebarOpen}
      onOpen={openSidebar}
      onClose={closeSidebar}
      drawerType="slide"
      drawerStyle={[styles.drawer, { width: drawerWidth }]}
      overlayStyle={styles.overlay}
      swipeEnabled
      swipeEdgeWidth={48}
      renderDrawerContent={() => <SidebarContent />}>
      <View style={[styles.main, sidebarOpen && styles.mainOpen]}>{children}</View>
    </Drawer>
  );
}

function ShellChrome({ children }: Props) {
  return <AppDrawer>{children}</AppDrawer>;
}

export function AppShell({ children }: Props) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppShellProvider>
        <ShellChrome>{children}</ShellChrome>
      </AppShellProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DrawerTokens.rootBackdrop,
  },
  main: {
    flex: 1,
    backgroundColor: AppTheme.bg,
    overflow: 'hidden',
  },
  mainOpen: {
    marginVertical: DrawerTokens.peekMarginV,
    borderRadius: DrawerTokens.peekRadius,
    boxShadow: '-8px 0 28px rgba(0,0,0,0.18)',
    elevation: 12,
  },
  drawer: {
    backgroundColor: AppTheme.bg,
    boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
  },
  overlay: {
    backgroundColor: DrawerTokens.peekDim,
  },
});
