import { Linking } from 'react-native';

export async function openExternalUrl(
  url: string | null | undefined,
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void,
): Promise<boolean> {
  if (!url) {
    showToast?.("Couldn't open link", 'error');
    return false;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      // Direct attempt fallback for tel:, mailto: or custom schemes
      await Linking.openURL(url);
      return true;
    }
  } catch (err) {
    showToast?.("Couldn't open link", 'error');
    return false;
  }
}
