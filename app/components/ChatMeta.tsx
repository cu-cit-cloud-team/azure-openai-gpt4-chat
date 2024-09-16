import { faSpinner, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import { atom, useAtom, useAtomValue } from 'jotai';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';

import {
  gpt4oMiniEnabledAtom,
  parametersAtom,
} from '@/app/components/Parameters';
import { userMetaAtom } from '@/app/components/UserAvatar';

dayjs.extend(isToday);
dayjs.extend(relativeTime);

export const ChatMeta = memo(
  ({ index, isLoading, isUser, messageCreatedAt, stop, totalMessages }) => {
    const modelAtom = atom('gpt-4o');
    const lastUpdatedStringAtom = atom('');

    const parameters = useAtomValue(parametersAtom);
    const userMeta = useAtomValue(userMetaAtom);
    const gpt4oMiniEnabled = useAtomValue(gpt4oMiniEnabledAtom);

    const [lastUpdatedString, setLastUpdatedString] = useAtom(
      lastUpdatedStringAtom
    );

    useEffect(() => {
      setLastUpdatedString(dayjs(dayjs(messageCreatedAt)).from());
    }, [messageCreatedAt, setLastUpdatedString]);

    const [model, setModel] = useAtom(modelAtom);

    useEffect(() => {
      setModel(parameters.model);
    }, [parameters, setModel]);

    useEffect(() => {
      const updateString = () => {
        setLastUpdatedString(dayjs(dayjs(messageCreatedAt)).from());
      };
      const clockInterval = setInterval(updateString, 10000);

      updateString();

      return () => clearInterval(clockInterval);
    }, [messageCreatedAt, setLastUpdatedString]);

    return (
      <>
        <div
          className={clsx('cursor-default text-xs', {
            'tooltip-primary tooltip-right': isUser,
            'tooltip-secondary tooltip-left': !isUser,
            'tooltip': !isLoading || index !== totalMessages,
          })}
          data-tip={
            dayjs(messageCreatedAt).isToday()
              ? dayjs(messageCreatedAt).format('hh:mm a')
              : dayjs(messageCreatedAt).format('ddd MMM DD YYYY [at] h:mm a')
          }
        >
          {!isUser && index === totalMessages && isLoading ? (
            <>
              <div
                className="cursor-pointer tooltip tooltip-secondary tooltip-left"
                data-tip={'Stop loading response'}
                onClick={stop}
                onKeyDown={stop}
              >
                <FontAwesomeIcon icon={faStop} className="mr-2" />
              </div>
              <FontAwesomeIcon icon={faSpinner} spinPulse className="mr-2" />
            </>
          ) : null}
          {isUser
            ? `${userMeta?.name ?? 'User'}`
            : `Azure OpenAI ${
                model === 'gpt-35-turbo'
                  ? 'GPT-3.5 Turbo (1106)'
                  : model === 'gpt-4'
                    ? 'GPT-4 (1106)'
                    : model === 'gpt-4-turbo'
                      ? 'GPT-4 Turbo (2024-04-09)'
                      : model === 'gpt-4o'
                        ? 'GPT-4o (2024-05-13)'
                        : gpt4oMiniEnabled && model === 'gpt-4o-mini'
                          ? 'GPT-4o Mini (2024-07-18)'
                          : 'GPT-4o (2024-05-13)'
              }`}
          {isUser || index !== totalMessages ? (
            <time>
              <span className="opacity-60">&nbsp;{lastUpdatedString}</span>
            </time>
          ) : null}
          {index === totalMessages && !isLoading && !isUser ? (
            <time>
              <span className="opacity-60">&nbsp;{lastUpdatedString}</span>
            </time>
          ) : null}
        </div>
      </>
    );
  }
);

ChatMeta.displayName = 'ChatMeta';
ChatMeta.propTypes = {
  isLoading: PropTypes.bool,
  index: PropTypes.number,
  totalMessages: PropTypes.number,
  isUser: PropTypes.bool,
  messageCreatedAt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  stop: PropTypes.func,
};

export default ChatMeta;
