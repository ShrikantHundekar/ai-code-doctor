import { useCallback } from 'react';

export function useClipboard() {
  const copy = useCallback(async (text: string, _message: string = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      return false;
    }
  }, []);

  return { copy };
}
