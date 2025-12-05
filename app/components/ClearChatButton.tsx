import type { UIMessage } from 'ai';
import { Eraser } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { useClearMessages } from '@/app/hooks/useClearMessages';
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
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ClearChatButtonProps {
  isLoading: boolean;
  setMessages: (messages: UIMessage[]) => void;
  focusTextarea: () => void;
}

export const ClearChatButton = memo(
  ({ isLoading, setMessages, focusTextarea }: ClearChatButtonProps) => {
    const clearMessages = useClearMessages(setMessages);
    const [showDialog, setShowDialog] = useState(false);

    const handleClearConfirm = useCallback(async () => {
      await clearMessages();
      setShowDialog(false);
      focusTextarea();
    }, [clearMessages, focusTextarea]);

    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowDialog(true)}
                disabled={isLoading}
                aria-label="Clear chat"
              >
                <Eraser className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear the chat history? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearConfirm}>
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

ClearChatButton.displayName = 'ClearChatButton';

export default ClearChatButton;
