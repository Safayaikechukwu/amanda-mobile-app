/**
 * Marketing copy — synced with useudara.com (lib/copy.ts)
 */
export const Copy = {
  brand: 'Udara',
  tagline: 'Your strict savings partner, on WhatsApp.',

  welcome: {
    headlineLine1: 'End overspending',
    headlineLine2: 'with a strict partner.',
    primaryCta: 'Join Udara',
    legalPrefix: 'By using Udara, you agree to accept our ',
    termsLabel: 'Terms of Use',
    privacyLabel: 'Privacy Policy',
    legalJoin: ' and ',
  },

  email: {
    title: "What's your email?",
    placeholder: 'Email',
    continue: 'Continue',
  },

  signIn: {
    title: 'Sign in',
    subtitle: 'Enter the email linked to your Udara account.',
    placeholder: 'Email',
    continue: 'Continue',
    newUser: 'New to Udara?',
    createAccount: 'Create account',
  },

  passkey: {
    title: 'Secure your account',
    subtext:
      'Enable biometric authentication for a smoother, more secure experience.',
    create: 'Enable Face ID',
    skipNote: 'Required to protect your savings account.',
    successTitle: 'You’re in',
    successSubtext: 'Your passkey is set. Welcome to Udara.',
    continue: 'Continue',
  },

  passkeySignIn: {
    greeting: 'Welcome back, {name}',
    hint: 'Confirm with Passkey to open your account.',
    verifying: 'Waiting for Passkey…',
    cta: 'Continue with Passkey',
    switchAccountPrefix: 'Not you? ',
    switchAccountLink: 'Use another account',
  },

  logout: {
    confirmTitle: 'Are you sure you want to log out?',
    cancel: 'Cancel',
    confirm: 'Log out',
  },

  notifications: {
    enabled: 'On',
    disabled: 'Off',
    sendTest: 'Send test notification',
    testSent: 'Test notification in 2 seconds',
    permissionRequired: 'Turn on notifications in Settings to receive alerts.',
    enabledTitle: 'Alerts are on',
    enabledBody: 'You’ll get transfers, savings, and account updates. Manage them in Settings.',
    openSettings: 'Open Settings',
    cancel: 'Cancel',
    pushOnConfirmTitle: 'Are you sure you want to turn on push notifications?',
    pushOffConfirmTitle: 'Are you sure you want to turn off push notifications?',
    emailOnConfirmTitle: 'Are you sure you want to turn on email notifications?',
    emailOffConfirmTitle: 'Are you sure you want to turn off email notifications?',
    turnOn: 'Turn on',
    turnOff: 'Turn off',
  },

  profile: {
    emailCopied: 'Email copied',
    emailCopiedBody: 'Paste it anywhere you need your Udara email.',
    securityTitle: 'Security & privacy',
    securityBody: 'Your account is protected with Passkey sign-in.',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
    cancel: 'Cancel',
  },
} as const;
