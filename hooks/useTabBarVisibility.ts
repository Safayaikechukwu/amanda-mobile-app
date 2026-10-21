import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import { APP_TAB_BAR_STYLE } from '@/components/app/AppTabBar';

const hiddenTabBarStyle = { display: 'none' as const };

type NavLike = {
  getState?: () => { type?: string };
  getParent?: () => NavLike | undefined;
  setOptions: (options: { tabBarStyle: typeof APP_TAB_BAR_STYLE | typeof hiddenTabBarStyle }) => void;
};

function getTabNavigator(navigation: NavLike) {
  let current: NavLike | undefined = navigation;

  while (current) {
    if (current.getState?.().type === 'tab') return current;
    current = current.getParent?.();
  }

  return null;
}

export function useTabBarVisibility(visible: boolean) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const tabNav = getTabNavigator(navigation as NavLike);
    if (!tabNav) return;

    tabNav.setOptions({
      tabBarStyle: visible ? APP_TAB_BAR_STYLE : hiddenTabBarStyle,
    });
  }, [navigation, visible]);
}
