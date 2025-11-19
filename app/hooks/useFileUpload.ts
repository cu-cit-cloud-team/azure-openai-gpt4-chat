import { useCallback, useState } from 'react';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  textContent?: string;
}

const MAX_FILES_PER_MESSAGE = 3;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'application/json', // read as text (.json, .jsonc)
  'application/pdf', // (.pdf)
  'application/typescript', // read as text (.ts)
  'application/x-sh', // read as text (.sh)
  'application/xml', // read as text (.xml)
  'application/yaml', // read as text (.yaml, .yml)
  'image/jpeg', // (.jpeg, .jpg)
  'image/png', // (.png)
  'image/webp', // (.webp)
  'text/css', // read as text (.css)
  'text/x-sass', // read as text (.sass)
  'text/x-scss', // read as text (.scss)
  'text/csv', // read as text (.csv, .tsv, .txt)
  'text/html', // read as text (.html, .htm)
  'text/javascript', // read as text (.js)
  'text/markdown', // read as text (.md)
  'text/plain', // read as text (.txt)
  'text/x-csv', // read as text (.csv, .tsv, .txt)
  'text/x-golang', // read as text (.go)
  'text/x-java', // read as text (.java)
  'text/x-php', // read as text (.php)
  'text/x-python', // read as text (.py)
  'text/x-ruby', // read as text (.rb)
  'text/x-script.python', // read as text (.py)
];

const TEXT_TYPES = new Set([
  'application/json',
  'application/typescript',
  'application/x-sh',
  'application/xml',
  'application/yaml',
  'text/css',
  'text/csv',
  'text/html',
  'text/javascript',
  'text/markdown',
  'text/plain',
  'text/x-csv',
  'text/x-golang',
  'text/x-java',
  'text/x-php',
  'text/x-python',
  'text/x-ruby',
  'text/x-script.python',
]);

export function useFileUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const currentCount = attachments.length;
      const remainingSlots = MAX_FILES_PER_MESSAGE - currentCount;

      if (remainingSlots <= 0) {
        setAttachmentError('You can attach up to 3 files per message.');
        return;
      }

      const filesArray = Array.from(files).slice(0, remainingSlots);
      let error: string | null = null;

      filesArray.forEach((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          error =
            'Unsupported file type. Allowed: PNG, JPEG, WEBP, TXT, MD, PDF.';
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          error = 'File too large. Max size is 25 MB per file.';
          return;
        }

        const isTextFile = TEXT_TYPES.has(file.type);
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            setAttachments((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                url: isTextFile ? '' : result,
                textContent: isTextFile ? result : undefined,
              },
            ]);
          }
        };
        if (isTextFile) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });

      setAttachmentError(error);
    },
    [attachments]
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setAttachmentError(null);
  }, []);

  return {
    attachments,
    attachmentError,
    handleFileSelect,
    handleRemoveAttachment,
    clearAttachments,
  };
}
