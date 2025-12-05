import { useAtom } from 'jotai';
import { PlusIcon } from 'lucide-react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { modelAtom } from '@/app/page';
import { setItem } from '@/app/utils/localStorage';
import { models } from '@/app/utils/models';
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
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FooterProps {
  onSubmit: (message: PromptInputMessage) => void;
  isLoading: boolean;
  focusTextarea: () => void;
  systemMessageRef: React.RefObject<HTMLTextAreaElement>;
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
  ({ onSubmit, isLoading, focusTextarea, systemMessageRef }: FooterProps) => {
    const [model, setModel] = useAtom(modelAtom);
    const [pendingModel, setPendingModel] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const isInitialMount = useRef(true);

    const handleModelChange = useCallback(
      (value: string) => {
        // Skip the initial mount's onValueChange call
        if (isInitialMount.current) {
          isInitialMount.current = false;
          return;
        }

        // Only show confirmation if the model is actually changing
        if (value !== model) {
          setPendingModel(value);
          setShowConfirmDialog(true);
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

    const handleSubmit = useCallback(
      (message: PromptInputMessage) => {
        onSubmit(message);
      },
      [onSubmit]
    );

    useEffect(() => {
      if (document?.activeElement !== systemMessageRef?.current && !isLoading) {
        // Focus handled by PromptInput internally
      }
    }, [isLoading, systemMessageRef]);

    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <PromptInput
            accept="image/*,.pdf,.txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.sh"
            multiple
            maxFiles={3}
            maxFileSize={25 * 1024 * 1024}
            onSubmit={handleSubmit}
            onError={(error) => console.error(error.message)}
          >
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
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
                <AttachmentButton onFilesAdded={focusTextarea} />

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

        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Switch Model?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to switch to {pendingModel}? This will
                update your model selection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelModelChange}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmModelChange}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
