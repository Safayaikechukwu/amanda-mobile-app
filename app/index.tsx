import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { AuthRoutes } from '@/constants/AuthRoutes';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { isReady, hasAccount, isUnlocked } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Theme.color.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Theme.color.cta} />
      </View>
    );
  }

  if (!hasAccount) {
    return <Redirect href={AuthRoutes.signIn} />;
  }

  if (!isUnlocked) {
    return <Redirect href={AuthRoutes.passkey} />;
  }

  return <Redirect href={{ pathname: '/(app)', params: { focusComposer: '1' } }} />;
}
