import { useCallback } from 'react';

/**
 * Hook to create a callback for focusing the main textarea input
 * @param textAreaRef - Reference to the main textarea input
 * @param systemMessageRef - Reference to the system message textarea
 * @returns A callback function that focuses the textarea (if safe to do so)
 */
export function useFocusTextarea(
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  systemMessageRef: React.RefObject<HTMLTextAreaElement>
) {
  const focusTextarea = useCallback(() => {
    // Use setTimeout to ensure focus happens after DOM updates and dialogs close
    setTimeout(() => {
      // Don't steal focus from system message textarea
      if (document?.activeElement !== systemMessageRef?.current) {
        textAreaRef?.current?.focus();
      }
    }, 0);
  }, [textAreaRef, systemMessageRef]);

  return focusTextarea;
}
