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
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/markdown',
  'application/pdf',
];

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

        const isTextFile =
          file.type === 'text/plain' || file.type === 'text/markdown';
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
