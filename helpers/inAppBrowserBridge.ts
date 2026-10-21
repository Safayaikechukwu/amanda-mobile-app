import * as Linking from 'expo-linking';

let handler: ((url: string) => void) | null = null;
let pendingUrl: string | null = null;

export function registerInAppBrowser(open: ((url: string) => void) | null) {
  handler = open;
  if (open && pendingUrl) {
    const url = pendingUrl;
    pendingUrl = null;
    open(url);
  }
}

export function showInAppBrowser(url: string) {
  if (handler) {
    handler(url);
    return;
  }

  pendingUrl = url;
  // If the host hasn't mounted yet, fall back instead of doing nothing.
  setTimeout(() => {
    if (pendingUrl !== url) return;
    pendingUrl = null;
    void Linking.openURL(url);
  }, 150);
}
