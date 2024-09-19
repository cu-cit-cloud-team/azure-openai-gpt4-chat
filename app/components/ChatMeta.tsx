import { faSpinner, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import { atom, useAtom, useAtomValue } from 'jotai';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';

import { parametersAtom } from '@/app/components/Parameters';
import { userMetaAtom } from '@/app/components/UserAvatar';

import { modelStringFromName } from '@/app/utils/models';

dayjs.extend(isToday);
dayjs.extend(relativeTime);

export const ChatMeta = memo(
  ({
    index,
    isLoading,
    isUser,
    messageCreatedAt,
    model,
    stop,
    totalMessages,
  }) => {
    const lastUpdatedStringAtom = atom('');
    const modelAtom = atom(model);

    const parameters = useAtomValue(parametersAtom);
    const userMeta = useAtomValue(userMetaAtom);

    const [lastUpdatedString, setLastUpdatedString] = useAtom(
      lastUpdatedStringAtom
    );
    const [modelInfo, setModelInfo] = useAtom(modelAtom);

    useEffect(() => {
      if (!modelInfo || model === undefined) {
        setModelInfo(modelStringFromName(parameters.model));
      } else {
        setModelInfo(modelStringFromName(model));
      }
    }, [model, modelInfo, parameters.model, setModelInfo]);

    useEffect(() => {
      setLastUpdatedString(dayjs(dayjs(messageCreatedAt)).from());
    }, [messageCreatedAt, setLastUpdatedString]);

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
          {isUser ? `${userMeta?.name ?? 'User'}` : `${modelInfo}`}
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
  index: PropTypes.number,
  isLoading: PropTypes.bool,
  isUser: PropTypes.bool,
  messageCreatedAt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  model: PropTypes.string,
  stop: PropTypes.func,
  totalMessages: PropTypes.number,
};

export default ChatMeta;
