import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export type Attachment = {
  id: string;
  kind: 'image' | 'document' | 'audio';
  uri: string;
  name: string;
  mimeType?: string | null;
  /** Voice note length in milliseconds. */
  durationMs?: number;
};

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const asked = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (asked.granted) return true;
  Alert.alert(
    'Photo access needed',
    'Allow photo library access to attach receipts and images.',
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS !== 'web') void Linking.openSettings();
        },
      },
    ],
  );
  return false;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const asked = await ImagePicker.requestCameraPermissionsAsync();
  if (asked.granted) return true;
  Alert.alert(
    'Camera access needed',
    'Allow camera access to photograph receipts or scan QR codes.',
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS !== 'web') void Linking.openSettings();
        },
      },
    ],
  );
  return false;
}

export async function pickPhotoFromLibrary(): Promise<Attachment | null> {
  if (Platform.OS !== 'web') {
    const ok = await ensureLibraryPermission();
    if (!ok) return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsMultipleSelection: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return {
    id: `img-${Date.now()}`,
    kind: 'image',
    uri: asset.uri,
    name: asset.fileName ?? asset.uri.split('/').pop() ?? 'Photo.jpg',
    mimeType: asset.mimeType,
  };
}

export async function captureReceiptPhoto(): Promise<Attachment | null> {
  if (Platform.OS !== 'web') {
    const ok = await ensureCameraPermission();
    if (!ok) return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.85,
    allowsEditing: Platform.OS !== 'web',
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return {
    id: `cam-${Date.now()}`,
    kind: 'image',
    uri: asset.uri,
    name: asset.fileName ?? 'Receipt.jpg',
    mimeType: asset.mimeType,
  };
}

export async function pickDocument(): Promise<Attachment | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'text/plain'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return {
      id: `doc-${Date.now()}`,
      kind: 'document',
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
    };
  } catch {
    Alert.alert('Could not open documents', 'Try again or pick a different file.');
    return null;
  }
}
