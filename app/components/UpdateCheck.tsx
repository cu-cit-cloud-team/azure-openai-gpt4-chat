import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ArrowUpCircle } from 'lucide-react';
// Replace per-render atom with local component state to prevent infinite loops
import { useEffect, useState } from 'react';

import pkg from '../../package.json';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

const DEPLOY_INTERVAL = 10; // minutes

export const UpdateCheck = () => {
  // Local state instead of Jotai atom defined in component (atoms should be static)
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const getLatestVersion = async (
      org = 'cu-cit-cloud-team',
      repo = 'azure-openai-gpt4-chat'
    ) => {
      const latest = await fetch(
        `https://api.github.com/repos/${org}/${repo}/releases/latest`
      )
        .then(async (response) => {
          const data = await response.json();
          const { version, published } = data;
          return {
            version,
            published,
          };
        })
        .catch((error) => {
          setUpdateAvailable(false);
          console.error(error);
        });

      setUpdateAvailable(
        latest.version !== `v${pkg.version}` &&
          dayjs().utc() >
            dayjs(latest.published).utc().add(DEPLOY_INTERVAL, 'm')
      );
    };

    // check for updates on load
    getLatestVersion();

    // check for updates every hour
    const updateHandle = setInterval(getLatestVersion, 1000 * 60 * 60);

    // clear update check interval on unmount
    return () => clearInterval(updateHandle);
    // setUpdateAvailable is stable from useState; no need in deps array
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
        <ArrowUpCircle className="mr-1 size-4" />
        Update available
      </span>
    </button>
  ) : null;
};

export default UpdateCheck;
