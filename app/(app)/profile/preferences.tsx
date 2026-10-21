import { usePreferences } from '@/context/PreferencesContext';
import {
  SettingsCurrencyPicker,
  SettingsDetailScreen,
  SettingsNote,
  SettingsRowDivider,
  SettingsToggleRow,
  type BalanceCurrency,
} from '@/components/settings/SettingsDetailScreen';

export default function PreferencesScreen() {
  const { preferences, setShowBalanceInNaira, setHideBalance } = usePreferences();

  const currency: BalanceCurrency = preferences.showBalanceInNaira ? 'ngn' : 'usd';

  const onCurrencyChange = (next: BalanceCurrency) => {
    void setShowBalanceInNaira(next === 'ngn');
  };

  return (
    <SettingsDetailScreen
      title="Preferences"
      heroIcon="options-outline"
      heroTitle="Your display choices."
      heroDescription="Control how balances appear across Insights, Savings, and receipts."
      sectionLabel="Display"
      footer={
        <SettingsNote>
          Hide balance masks amounts everywhere. Currency only changes how visible balances are formatted.
        </SettingsNote>
      }>
      <SettingsCurrencyPicker value={currency} onChange={onCurrencyChange} />
      <SettingsRowDivider />
      <SettingsToggleRow
        icon="eye-off-outline"
        title="Hide balance"
        subtitle="Replace amounts with ••••••"
        value={preferences.hideBalance}
        onValueChange={(v) => void setHideBalance(v)}
      />
    </SettingsDetailScreen>
  );
}
