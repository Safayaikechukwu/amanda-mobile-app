import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'udara.userPreferences';
const PUSH_DEFAULT_MIGRATION_KEY = 'udara.userPreferences.pushDefaultMigrated';

export type UserPreferences = {
  showBalanceInNaira: boolean;
  hideBalance: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  showBalanceInNaira: true,
  hideBalance: false,
  pushNotifications: true,
  emailNotifications: false,
};

export async function loadUserPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT_USER_PREFERENCES };

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const merged: UserPreferences = { ...DEFAULT_USER_PREFERENCES, ...parsed };

    const migrated = await AsyncStorage.getItem(PUSH_DEFAULT_MIGRATION_KEY);
    if (!migrated && merged.pushNotifications === false) {
      merged.pushNotifications = true;
      await AsyncStorage.setItem(PUSH_DEFAULT_MIGRATION_KEY, '1');
      await saveUserPreferences(merged);
    }

    return merged;
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
