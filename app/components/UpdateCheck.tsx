import axios from 'axios';
import { useEffect, useState } from 'react';

import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import pkg from '../../package.json';

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
          const latest = response.data.tag_name;

          return latest;
        })
        // biome-ignore lint/correctness/noUnusedVariables: used for debugging
        .catch((error) => {
          setUpdateAvailable(false);
          // console.error(error);
        });
      setUpdateAvailable(latest !== `v${pkg.version}`);
    };
    getLatestVersion();
  }, []);

  const clickHandler = () => {
    window.location.reload();
  };

  return updateAvailable ? (
    <button
      type="button"
      onClick={clickHandler}
      className="hidden tooltip tooltip-bottom tooltip-accent lg:block"
      data-tip="Click to reload for latest version"
    >
      <span className="px-2 text-sm indicator-item badge badge-accent">
        <FontAwesomeIcon className="mr-1" icon={faCircleArrowUp} />
        Update available
      </span>
    </button>
  ) : null;
};

export default UpdateCheck;
