import clsx from 'clsx';
import { memo, useEffect } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

interface FooterProps {
  formRef?: (...args: unknown[]) =>
    | unknown
    | {
        current?: object;
      };
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  isLoading: boolean;
  model: string;
  systemMessageRef?: (...args: unknown[]) =>
    | unknown
    | {
        current?: object;
      };
  textAreaRef?: (...args: unknown[]) =>
    | unknown
    | {
        current?: object;
      };
}

export const Footer = memo(
  ({
    formRef,
    onInputChange,
    onSubmit,
    input,
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

    return (
      <footer className="fixed bottom-0 z-40 w-full px-4 py-2 text-center lg:p-4 bg-base-300">
        <form ref={formRef} onSubmit={onSubmit} className="w-full">
          {/* Model and Token Count Container */}
          <div className="flex justify-between items-center mb-1 max-w-6xl mx-auto">
            {/* Left-aligned model name */}
            <div className="text-xs text-base-content opacity-50 uppercase text-left">
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
          <textarea
            autoFocus={true}
            className={clsx(
              'bg-base-100 w-full max-w-6xl p-2 overflow-x-hidden overflow-y-auto text-sm border border-gray-300 rounded shadow-xl min-h-14 h-14 lg:text-base lg:h-20 lg:min-h-20 max-h-75',
              {
                'skeleton': isLoading,
              }
            )}
            disabled={isLoading}
            placeholder={
              isLoading ? 'Loading response...' : 'Type a message...'
            }
            onChange={(e) => onInputChange(e.target.value)}
            ref={textAreaRef}
            value={input}
          />
          <button
            type="button"
            className="mb-2 btn-block btn btn-xs btn-primary lg:hidden"
            onClick={(e) => onSubmit(e as unknown as React.FormEvent)}
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
