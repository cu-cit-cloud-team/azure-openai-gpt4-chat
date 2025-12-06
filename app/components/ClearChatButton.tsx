import type { UIMessage } from 'ai';
import { Eraser } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { useClearMessages } from '@/app/hooks/useClearMessages';

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

        <ConfirmDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          title="Clear Chat History?"
          description="Are you sure you want to clear the chat history? This action cannot be undone."
          confirmText="Clear"
          onConfirm={handleClearConfirm}
          variant="destructive"
        />
      </>
    );
  }
);

ClearChatButton.displayName = 'ClearChatButton';

export default ClearChatButton;
