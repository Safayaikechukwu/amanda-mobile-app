import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { AuthRoutes } from '@/constants/AuthRoutes';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

type Target = 'onboarding' | 'auth' | 'app';

/**
 * Keeps each stack on the correct step of the auth flow.
 */
export function AuthGateRedirect({ target }: { target: Target }) {
  const { isReady, hasAccount, isUnlocked, needsNotificationSetup } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Theme.color.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Theme.color.cta} />
      </View>
    );
  }

  if (target === 'onboarding') {
    if (hasAccount && !isUnlocked) {
      return <Redirect href={AuthRoutes.passkey} />;
    }
    if (hasAccount && isUnlocked && !needsNotificationSetup) {
      return <Redirect href={{ pathname: '/(app)', params: { focusComposer: '1' } }} />;
    }
    return null;
  }

  if (target === 'auth') {
    if (!hasAccount && isUnlocked) {
      return <Redirect href={AuthRoutes.signIn} />;
    }
    if (hasAccount && isUnlocked && !needsNotificationSetup) {
      return <Redirect href={{ pathname: '/(app)', params: { focusComposer: '1' } }} />;
    }
    return null;
  }

  // app
  if (!hasAccount) {
    return <Redirect href={AuthRoutes.signIn} />;
  }
  if (!isUnlocked) {
    return <Redirect href={AuthRoutes.passkey} />;
  }
  return null;
}
