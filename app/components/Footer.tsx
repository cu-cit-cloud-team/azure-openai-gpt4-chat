import { useAtom } from 'jotai';
import { GlobeIcon, PlusIcon } from 'lucide-react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  // PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/app/components/ai-elements/prompt-input';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { modelAtom } from '@/app/utils/atoms';
import { setItem } from '@/app/utils/localStorage';
import { models } from '@/app/utils/models';

interface FooterProps {
  onSubmit: (message: PromptInputMessage) => void;
  isLoading: boolean;
  focusTextarea: () => void;
  systemMessageRef: React.RefObject<HTMLTextAreaElement | null>;
  promptInputRef: React.RefObject<HTMLTextAreaElement | null>;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
}

// Component that accesses attachments context and monitors file changes
const AttachmentButton = ({ onFilesAdded }: { onFilesAdded: () => void }) => {
  const attachments = usePromptInputAttachments();
  const prevFileCountRef = React.useRef(attachments.files.length);

  // Detect when files are added
  useEffect(() => {
    const currentCount = attachments.files.length;
    const prevCount = prevFileCountRef.current;

    // If file count increased, files were added
    if (currentCount > prevCount) {
      onFilesAdded();
    }

    prevFileCountRef.current = currentCount;
  }, [attachments.files.length, onFilesAdded]);

  return (
    <PromptInputButton onClick={attachments.openFileDialog}>
      <PlusIcon className="size-4" />
    </PromptInputButton>
  );
};

export const Footer = memo(
  ({
    onSubmit,
    isLoading,
    focusTextarea,
    systemMessageRef,
    promptInputRef,
    useWebSearch,
    onToggleWebSearch,
  }: FooterProps) => {
    const [model, setModel] = useAtom(modelAtom);
    const [pendingModel, setPendingModel] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const hasInteractedRef = useRef(false);
    // const [speechSupported, setSpeechSupported] = useState(false);
    // const [micPermission, setMicPermission] = useState<
    //   'granted' | 'denied' | 'prompt' | 'unknown' | 'error'
    // >('unknown');
    // const [speechStatusMessage, setSpeechStatusMessage] = useState<
    //   string | null
    // >(null);

    // useEffect(() => {
    //   if (typeof window === 'undefined') {
    //     return;
    //   }

    //   const supported =
    //     'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    //   setSpeechSupported(supported);

    //   if (!supported) {
    //     setSpeechStatusMessage(
    //       'Speech input not supported in this browser. Try Chrome/Edge on HTTPS or localhost.'
    //     );
    //     setMicPermission('denied');
    //     return;
    //   }

    //   let permissionStatus: PermissionStatus | undefined;

    //   const updateFromPermission = (state: PermissionState) => {
    //     setMicPermission(state);
    //     if (state === 'denied') {
    //       setSpeechStatusMessage(
    //         'Microphone is blocked. Allow mic access in browser site settings and reload.'
    //       );
    //     } else {
    //       setSpeechStatusMessage(null);
    //     }
    //   };

    //   navigator.permissions
    //     ?.query({ name: 'microphone' as PermissionName })
    //     .then((status) => {
    //       permissionStatus = status;
    //       updateFromPermission(status.state);
    //       status.onchange = () => updateFromPermission(status.state);
    //     })
    //     .catch(() => {
    //       // Permissions API may be unavailable; keep prompt state
    //       setMicPermission('prompt');
    //     });

    //   return () => {
    //     if (permissionStatus) {
    //       permissionStatus.onchange = null;
    //     }
    //   };
    // }, []);

    const handleModelChange = useCallback(
      (value: string) => {
        // Only show confirmation if:
        // 1. The model is actually changing
        // 2. User has interacted (not the initial mount)
        if (value !== model) {
          if (hasInteractedRef.current) {
            setPendingModel(value);
            setShowConfirmDialog(true);
          } else {
            // First interaction - just mark as interacted and update without confirm
            hasInteractedRef.current = true;
          }
        }
      },
      [model]
    );

    const confirmModelChange = useCallback(() => {
      if (pendingModel) {
        setItem('model', pendingModel);
        setModel(pendingModel);
        setShowConfirmDialog(false);
        setPendingModel(null);
        focusTextarea();
      }
    }, [pendingModel, setModel, focusTextarea]);

    const cancelModelChange = useCallback(() => {
      setShowConfirmDialog(false);
      setPendingModel(null);
    }, []);

    const handleFileError = useCallback((error: { message: string }) => {
      setFileError(error.message);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setFileError(null), 5000);
    }, []);

    const handleSubmit = useCallback(
      (message: PromptInputMessage) => {
        onSubmit(message);
      },
      [onSubmit]
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useEffect(() => {
      if (document?.activeElement !== systemMessageRef?.current && !isLoading) {
        // Focus handled by PromptInput internally
      }
    }, [isLoading, systemMessageRef]);

    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <PromptInput
            accept="image/*,.pdf,.txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.sh"
            multiple
            maxFiles={3}
            maxFileSize={25 * 1024 * 1024}
            onSubmit={handleSubmit}
            onError={handleFileError}
          >
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                ref={promptInputRef}
                placeholder={
                  isLoading
                    ? 'Loading response...'
                    : 'What would you like to know?'
                }
                disabled={isLoading}
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex" role="presentation">
                      <AttachmentButton onFilesAdded={focusTextarea} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">
                    Add photos or files
                  </TooltipContent>
                </Tooltip>
                {/* {speechStatusMessage &&
                (!speechSupported ||
                  micPermission === 'denied' ||
                  isLoading) ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex" role="presentation">
                        <PromptInputSpeechButton
                          textareaRef={promptInputRef}
                          disabled
                          title={speechStatusMessage ?? undefined}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start">
                      {speechStatusMessage}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <PromptInputSpeechButton
                    textareaRef={promptInputRef}
                    disabled={isLoading}
                    title={speechStatusMessage ?? undefined}
                  />
                )} */}
                <PromptInputButton
                  onClick={onToggleWebSearch}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <PromptInputSelect
                  value={model}
                  onValueChange={handleModelChange}
                >
                  <PromptInputSelectTrigger>
                    <PromptInputSelectValue placeholder="Select model" />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent className="max-h-[300px]">
                    {models.map((m) => (
                      <PromptInputSelectItem key={m.name} value={m.name}>
                        <span className="truncate">{m.displayName}</span>
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </PromptInputTools>

              <PromptInputSubmit
                status={isLoading ? 'streaming' : undefined}
                disabled={isLoading}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>

        {fileError && (
          <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          </div>
        )}

        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="Switch Model?"
          description={`Are you sure you want to switch to ${pendingModel}? This will update your model selection.`}
          confirmText="Continue"
          onConfirm={confirmModelChange}
          onCancel={cancelModelChange}
        />
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
