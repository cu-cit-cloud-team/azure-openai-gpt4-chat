import clsx from 'clsx';
import { memo, useEffect } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

interface FooterProps {
  formRef: React.RefObject<HTMLFormElement>;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  input: string;
  isLoading: boolean;
  model: string;
  systemMessageRef: React.RefObject<HTMLTextAreaElement>;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (files: FileList | null) => void;
  onRemoveAttachment: (id: string) => void;
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  attachmentError: string | null;
}

export const Footer = memo(
  ({
    formRef,
    fileInputRef,
    onInputChange,
    onFileSelect,
    onRemoveAttachment,
    onSubmit,
    onKeyDown,
    input,
    attachments,
    attachmentError,
    isLoading,
    model,
    systemMessageRef,
    textAreaRef,
  }: FooterProps) => {
    useEffect(() => {
      if (document?.activeElement !== systemMessageRef?.current && !isLoading) {
        textAreaRef?.current?.focus();
      }
    }, [isLoading, textAreaRef, systemMessageRef]);

    // Auto-resize textarea based on content
    // biome-ignore lint/correctness/useExhaustiveDependencies: necessary dependencies are included
    useEffect(() => {
      const textarea = textAreaRef?.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
      }
    }, [input, textAreaRef]);

    return (
      <footer className="fixed bottom-0 z-40 w-full px-4 py-2 text-center lg:p-4 bg-base-300">
        <form ref={formRef} onSubmit={onSubmit} className="w-full">
          {/* Model and Token Count Container */}
          <div className="flex justify-between items-center mb-1 max-w-6xl mx-auto">
            {/* Left-aligned model name */}
            <div className="text-xs text-base-content opacity-50 uppercase text-left ml-11">
              <strong>Model:</strong>{' '}
              <span className="font-normal">{model}</span>
            </div>
            {/* Right-aligned token count */}
            <div className="text-right">
              <TokenCount
                input={input}
                systemMessage={systemMessageRef?.current?.value || ''}
                display={'input'}
              />
            </div>
          </div>
          <div className="flex items-end justify-center max-w-6xl mx-auto gap-2">
            <div className="pb-1">
              <label
                className="btn btn-sm btn-ghost"
                htmlFor="file-upload-input"
              >
                📎
              </label>
              <input
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => onFileSelect(e.target.files)}
              />
            </div>
            <textarea
              autoFocus={true}
              className={clsx(
                'bg-base-100 w-full max-w-6xl p-2 overflow-x-hidden overflow-y-auto text-sm border border-gray-300 rounded shadow-xl resize-none',
                {
                  'skeleton': isLoading,
                }
              )}
              disabled={isLoading}
              placeholder={
                isLoading ? 'Loading response...' : 'Type a message...'
              }
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              ref={textAreaRef}
              value={input}
              rows={2}
            />
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center justify-start max-w-5xl mx-auto mt-2 gap-2 ">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-2 py-1 text-xs border rounded bg-base-100 border-base-300"
                >
                  {att.type.startsWith('image/') ? (
                    <figure className="w-12 h-12 overflow-hidden rounded">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${att.url})` }}
                      />
                    </figure>
                  ) : (
                    <span className="text-lg">📄</span>
                  )}
                  {!att.type.startsWith('image/') && (
                    <span className="max-w-40 truncate" title={att.name}>
                      {att.name}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={() => onRemoveAttachment(att.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {attachmentError && (
            <div className="max-w-6xl mx-auto mt-1 text-xs text-error text-left">
              {attachmentError}
            </div>
          )}
          <button
            type="submit"
            className="mb-2 btn-block btn btn-xs btn-primary lg:hidden"
          >
            send message
          </button>
          <br />
          <small className="hidden text-xs bottom-8 lg:inline-block">
            <kbd className="kbd">Enter</kbd> to send /
            <kbd className="kbd">Shift</kbd>+<kbd className="kbd">Enter</kbd>{' '}
            for new line
          </small>
        </form>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
