import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';

import pkg from '../../package.json';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

const DEPLOY_INTERVAL = 10; // minutes

export const UpdateCheck = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const getLatestVersion = async (
      org = 'CU-CommunityApps',
      repo = 'ct-azure-openai-gpt4-chat'
    ) => {
      const latest = await axios
        .get(`https://api.github.com/repos/${org}/${repo}/releases/latest`)
        .then((response) => {
          const version = response.data.tag_name;
          const published = response.data.published_at;

          return {
            version,
            published,
          };
        })
        // biome-ignore lint/correctness/noUnusedVariables: used for debugging
        .catch((error) => {
          setUpdateAvailable(false);
          // console.error(error);
        });

      setUpdateAvailable(
        latest.version !== `v${pkg.version}` &&
          dayjs().utc() >
            dayjs(latest.published).utc().add(DEPLOY_INTERVAL, 'm')
      );
    };

    // check for updates every hour
    const updateHandle = setInterval(getLatestVersion(), 1000 * 60 * 60);

    // check for updates on load
    getLatestVersion();

    // clear update check interval on unmount
    return () => clearInterval(updateHandle);
  }, []);

  const clickHandler = () => {
    window.location.reload();
  };

  return updateAvailable ? (
    <button
      type="button"
      onClick={clickHandler}
      className="hidden tooltip tooltip-bottom tooltip-accent lg:block"
      data-tip="Click here or manually reload for latest version"
    >
      <span className="px-2 text-sm indicator-item badge badge-accent">
        <FontAwesomeIcon className="mr-1" icon={faCircleArrowUp} />
        Update available
      </span>
    </button>
  ) : null;
};

export default UpdateCheck;
