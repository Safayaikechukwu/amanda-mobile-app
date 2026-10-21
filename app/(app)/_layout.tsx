import { Tabs, usePathname } from 'expo-router';
import { Platform } from 'react-native';

import { AuthGateRedirect } from '@/components/auth/AuthGateRedirect';
import {
  APP_TAB_BAR_STYLE,
  AppTabBarButton,
  tabBarLabel,
  tabIcon,
} from '@/components/app/AppTabBar';
import { UdaraMarkIcon } from '@/components/icons/UdaraMarkIcon';
import { AppTheme } from '@/constants/AppTheme';
import { isMainTabPath } from '@/helpers/tabBarVisibility';

/** Extra scroll padding on tab screens (bar is docked — no floating overlap). */
export const TAB_BAR_SCROLL_INSET = 16;

const hiddenTab = { href: null, tabBarStyle: { display: 'none' as const } };

const hiddenTabBarStyle = { display: 'none' as const };

/** Slightly larger than default tab icons so the mark reads at a glance. */
const UDARA_TAB_ICON_SIZE = 32;

export default function AppLayout() {
  const pathname = usePathname();
  const showTabBar = isMainTabPath(pathname);

  return (
    <>
      <AuthGateRedirect target="app" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: AppTheme.bg },
          tabBarActiveTintColor: AppTheme.accent,
          tabBarInactiveTintColor: AppTheme.textFaint,
          tabBarStyle: showTabBar ? APP_TAB_BAR_STYLE : hiddenTabBarStyle,
          tabBarButton: (props) => <AppTabBarButton {...props} />,
          tabBarLabel: ({ focused, color, children }) =>
            tabBarLabel({ focused, color: String(color), children: String(children) }),
          tabBarLabelStyle: {
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarHideOnKeyboard: true,
        }}>
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size, focused }) => tabIcon('insights', color, size, focused),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Udara',
            tabBarIcon: ({ color, focused }) => (
              <UdaraMarkIcon
                size={focused ? UDARA_TAB_ICON_SIZE + 1 : UDARA_TAB_ICON_SIZE}
                color={String(color)}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="savings"
          options={{
            title: 'Savings',
            tabBarIcon: ({ color, size, focused }) => tabIcon('savings', color, size, focused),
          }}
        />
        <Tabs.Screen name="profile" options={hiddenTab} />
        <Tabs.Screen name="bills" options={hiddenTab} />
        <Tabs.Screen name="support" options={hiddenTab} />
        <Tabs.Screen name="transaction/[id]" options={hiddenTab} />
        <Tabs.Screen name="receipt/[id]" options={hiddenTab} />
        <Tabs.Screen name="subscription/[id]" options={hiddenTab} />
      </Tabs>
    </>
  );
}
