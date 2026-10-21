export type AutoSaveActionId = 'withdraw' | 'interests' | 'settings';

const AUTO_SAVE_CHAT: Record<AutoSaveActionId, string> = {
  withdraw: 'I want to withdraw from Auto Save',
  interests: 'I want to see my Auto Save interests',
  settings: 'I want to change my Auto Save settings',
};

export function autoSaveChatMessage(action: AutoSaveActionId): string {
  return AUTO_SAVE_CHAT[action];
}
