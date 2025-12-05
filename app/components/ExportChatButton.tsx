import { useAtomValue } from 'jotai';
import { Download } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { database } from '@/app/database/database.config';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExportChatButtonProps {
  isLoading: boolean;
}

export const ExportChatButton = memo(({ isLoading }: ExportChatButtonProps) => {
  const systemMessage = useAtomValue(systemMessageAtom);
  const [showDialog, setShowDialog] = useState(false);

  const downloadFile = useCallback(
    ({ data, fileName = 'chat-history.json', fileType = 'text/json' }) => {
      const blob = new Blob([data], { type: fileType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false,
      });
      link.dispatchEvent(clickEvent);
      URL.revokeObjectURL(link.href);
    },
    []
  );

  const getMessages = useCallback(async () => {
    const messages = await database.messages.toArray();
    const sortedMessages = messages
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((message) => {
        const sortedKeys = Object.keys(message).sort();
        const sortedMessage = {};
        for (const key of sortedKeys) {
          sortedMessage[key] = message[key];
        }
        return sortedMessage;
      });
    sortedMessages.unshift({
      role: 'system',
      content: systemMessage,
    });
    return JSON.stringify(sortedMessages, null, 2);
  }, [systemMessage]);

  const handleExportConfirm = useCallback(async () => {
    const data = await getMessages();
    downloadFile({ data });
    setShowDialog(false);
  }, [getMessages, downloadFile]);

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
              aria-label="Export chat"
            >
              <Download className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will download your chat history as a JSON file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExportConfirm}>
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

ExportChatButton.displayName = 'ExportChatButton';

export default ExportChatButton;
