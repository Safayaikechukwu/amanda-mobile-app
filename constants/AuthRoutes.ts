/** Central auth routes — keeps logout / switch-account navigation consistent. */
export const AuthRoutes = {
  signIn: '/(auth)/sign-in',
  passkey: '/(auth)/passkey',
  join: '/(onboarding)/welcome',
} as const;
