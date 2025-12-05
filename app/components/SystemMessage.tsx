import type { UIMessage } from 'ai';
import { useAtom } from 'jotai';
import { Bot, RotateCcw, Save, X } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

// import { TokenCount } from '@/app/components/TokenCount';
import { useClearMessages } from '@/app/hooks/useClearMessages';
import { systemMessageAtom } from '@/app/page';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SystemMessageProps {
  systemMessageRef?: React.RefObject<HTMLTextAreaElement>;
  setMessages: (messages: UIMessage[]) => void;
  focusTextarea: () => void;
}

export const SystemMessage = memo(
  ({ systemMessageRef, setMessages, focusTextarea }: SystemMessageProps) => {
    const [systemMessage, setSystemMessage] = useAtom(systemMessageAtom);
    const [localSystemMessage, setLocalSystemMessage] = useState('');
    const [originalSystemMessage, setOriginalSystemMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const clearMessages = useClearMessages(setMessages);

    useEffect(() => {
      setOriginalSystemMessage(systemMessage);
      setLocalSystemMessage(systemMessage);
    }, [systemMessage]);

    const handleClose = useCallback(() => {
      setLocalSystemMessage(originalSystemMessage);
      setOpen(false);
    }, [originalSystemMessage]);

    const handleReset = useCallback(() => {
      if (localSystemMessage.trim() !== originalSystemMessage.trim()) {
        setShowResetDialog(true);
      }
    }, [localSystemMessage, originalSystemMessage]);

    const confirmReset = useCallback(() => {
      setLocalSystemMessage(originalSystemMessage);
      setShowResetDialog(false);
    }, [originalSystemMessage]);

    const handleSave = useCallback(() => {
      if (localSystemMessage.trim() !== originalSystemMessage.trim()) {
        setShowSaveDialog(true);
      }
    }, [localSystemMessage, originalSystemMessage]);

    const confirmSave = useCallback(async () => {
      setSystemMessage(localSystemMessage);
      await clearMessages();
      setShowSaveDialog(false);
      setOpen(false);
      focusTextarea();
    }, [localSystemMessage, setSystemMessage, clearMessages, focusTextarea]);

    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipProvider>
            <Tooltip>
              <DialogTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="System message"
                  >
                    <Bot className="size-5" />
                  </Button>
                </TooltipTrigger>
              </DialogTrigger>
              <TooltipContent>
                <p>System message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>System Message</DialogTitle>
              <DialogDescription>
                Configure the AI assistant's behavior and personality
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                ref={systemMessageRef}
                value={localSystemMessage}
                onChange={(e) => setLocalSystemMessage(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="You are a helpful AI assistant."
              />

              {/* <TokenCount
              input={input}
              systemMessage={localSystemMessage}
              display={'systemMessage'}
              useLocalCalculation={true}
            /> */}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="size-4 mr-2" />
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={
                  localSystemMessage.trim() === originalSystemMessage.trim()
                }
              >
                <RotateCcw className="size-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  localSystemMessage.trim() === originalSystemMessage.trim()
                }
              >
                <Save className="size-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset confirmation dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reset your unsaved changes?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReset}>
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save confirmation dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change System Message?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the system message?
                <br />
                <br />
                <strong>NOTE:</strong> This will also clear your chat history
                and reload the app.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

SystemMessage.displayName = 'SystemMessage';

export default SystemMessage;
