import { Redirect } from 'expo-router';

/** Support lives under Profile → Support. */
export default function SupportRedirect() {
  return <Redirect href="/(app)/profile/support" />;
}
