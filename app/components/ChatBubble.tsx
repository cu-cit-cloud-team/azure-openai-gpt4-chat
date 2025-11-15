import {
  faFile,
  faRobot,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import markdownToTxt from 'markdown-to-txt';
import { nanoid } from 'nanoid';
import { memo, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';

import { ChatMeta } from '@/app/components/ChatMeta';
import { CopyToClipboard } from '@/app/components/CopyToClipboard';
import { DeleteMessage } from '@/app/components/DeleteMessage';
import { ReloadMessage } from '@/app/components/ReloadMessage';

// import { markdownToText } from '@/app/utils/markdownToText';

import { editorThemeAtom } from '@/app/page';

interface ChatBubbleProps {
  index?: number;
  isLoading?: boolean;
  isUser?: boolean;
  messageContent?: string;
  messageFiles?: {
    type: string;
    mediaType: string;
    url: string;
    name?: string;
    size?: number;
  }[];
  messageCreatedAt?: string | Date;
  messageId?: string;
  model?: string;
  regenerate?(...args: unknown[]): unknown;
  stop?(...args: unknown[]): unknown;
  totalMessages?: number;
}

const Pre = ({ children }) => {
  return (
    <pre className="code-pre">
      <CopyToClipboard key={nanoid()} textToCopy={children.props.children} />
      {children}
    </pre>
  );
};

Pre.displayName = 'Pre';

export const ChatBubble = memo(
  ({
    index,
    isLoading,
    isUser,
    messageContent,
    messageFiles,
    messageCreatedAt,
    messageId,
    model,
    regenerate,
    stop,
    totalMessages,
  }: ChatBubbleProps) => {
    const editorTheme = useAtomValue(editorThemeAtom);
    const copyToClipBoardKey = nanoid();
    const [modalImageUrl, setModalImageUrl] = useState<string>('');

    const rehypePlugins = useMemo(
      () => [rehypeKatex, rehypeSanitize, rehypeStringify],
      []
    );

    const remarkPlugins = useMemo(
      () => [remarkGfm, remarkMath, remarkParse, remarkRehype],
      []
    );

    const chatBubbleUserIcon = useMemo(() => {
      return isUser ? (
        <FontAwesomeIcon
          className="chat-avatar-icon"
          size="2x"
          icon={faUser}
          fixedWidth
        />
      ) : isLoading && index === totalMessages ? (
        <FontAwesomeIcon
          className="chat-avatar-icon"
          size="2x"
          icon={faSpinner}
          spinPulse={true}
          fixedWidth
        />
      ) : (
        <FontAwesomeIcon
          className="chat-avatar-icon"
          size="2x"
          icon={faRobot}
          fixedWidth
        />
      );
    }, [index, isLoading, isUser, totalMessages]);

    const handleImageClick = (imageUrl: string) => {
      const modal = document.getElementById(
        'image-modal'
      ) as HTMLDialogElement | null;
      if (modal) {
        setModalImageUrl(imageUrl);
        modal.showModal();
      }
    };

    return (
      <div
        className={clsx('chat mb-10', {
          'chat-start': isUser,
          'chat-end': !isUser,
        })}
      >
        <div className="chat-image avatar">
          <div
            className={clsx('w-12 pt-2 p-1 rounded', {
              'bg-primary text-primary-content': isUser,
              'bg-secondary text-secondary-content': !isUser,
            })}
          >
            {chatBubbleUserIcon}
          </div>
        </div>
        <div
          className={clsx('relative chat-bubble', {
            'chat-bubble-primary': isUser,
            'chat-bubble-secondary bot': !isUser,
          })}
        >
          {(isUser || !isLoading || index !== totalMessages) && (
            <>
              <CopyToClipboard
                key={copyToClipBoardKey}
                isUser={isUser}
                textToCopy={markdownToTxt(messageContent)}
              />
              <DeleteMessage isUser={isUser} messageId={messageId} />
              {index === totalMessages ? (
                <ReloadMessage
                  isUser={isUser}
                  regenerate={regenerate}
                  messageId={messageId}
                />
              ) : null}
            </>
          )}
          {!isUser &&
          isLoading &&
          index === totalMessages &&
          (!messageContent || messageContent.trim() === '') ? (
            <div className="flex items-center gap-2 py-2">
              <FontAwesomeIcon
                icon={faSpinner}
                spinPulse
                className="text-secondary-content opacity-60"
              />
              <span className="text-sm opacity-60">Thinking...</span>
            </div>
          ) : (
            <>
              <Markdown
                rehypePlugins={rehypePlugins}
                remarkPlugins={remarkPlugins}
                components={{
                  pre: Pre,
                  code({ children, className, ...rest }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        style={editorTheme}
                        language={match[1]}
                        PreTag="div"
                        showLineNumbers={true}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {messageContent?.replace(/\n/g, '  \n') || ''}
              </Markdown>
              {messageFiles && messageFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {messageFiles.map((file) => (
                    <div
                      key={`${file.url}-${file.name ?? ''}`}
                      className="flex items-center gap-2 px-2 py-1 text-xs border rounded bg-base-100 border-base-300"
                    >
                      {file.mediaType.startsWith('image/') ? (
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => handleImageClick(file.url)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              handleImageClick(file.url);
                            }
                          }}
                        >
                          <figure className="w-12 h-12 overflow-hidden rounded">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${file.url})` }}
                            />
                          </figure>
                        </button>
                      ) : (
                        <FontAwesomeIcon icon={faFile} className="text-base" />
                      )}
                      {!file.mediaType.startsWith('image/') && (
                        <span className="max-w-40 truncate" title={file.name}>
                          {file.name || 'Attachment'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div
          className={clsx('chat-footer', {
            'bot': !isUser,
          })}
        >
          <ChatMeta
            index={index}
            isLoading={isLoading}
            isUser={isUser}
            model={model}
            messageCreatedAt={messageCreatedAt}
            stop={stop}
            totalMessages={totalMessages}
          />
        </div>
        <dialog id="image-modal" className="modal">
          <div className="modal-box max-w-5xl w-auto">
            {modalImageUrl && (
              <>
                <form method="dialog">
                  {/** biome-ignore lint/a11y/useButtonType: daisyUI */}
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    ✕
                  </button>
                </form>
                {/** biome-ignore lint/performance/noImgElement: intentional */}
                <img
                  src={modalImageUrl}
                  alt="Attachment"
                  className="w-full h-auto max-h-[80vh] object-contain rounded"
                />
              </>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        </dialog>
      </div>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
