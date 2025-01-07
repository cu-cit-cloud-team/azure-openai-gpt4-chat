import {
  faCircleUser,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { memo, useCallback, useEffect, useMemo } from 'react';

export const userMetaAtom = atomWithStorage('userMeta', {});

export const UserAvatar = memo(() => {
  const emailAtom = atom('');
  const nameAtom = atom('');
  const hasDataAtom = atom(false);

  const [email, setEmail] = useAtom(emailAtom);
  const [name, setName] = useAtom(nameAtom);
  const [hasData, setHasData] = useAtom(hasDataAtom);

  const [userMeta, setUserMeta] = useAtom(userMetaAtom);

  useEffect(() => {
    if (userMeta?.email && userMeta?.name) {
      return;
    }
    const getUserMeta = async () => {
      await fetch('/.auth/me', {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })
        .then(async (resp) => {
          const response = await resp.json();
          const email = response?.data[0]?.user_claims.find(
            (item) => item.typ === 'preferred_username'
          ).val;

          const name = response?.data[0]?.user_claims.find(
            (item) => item.typ === 'name'
          ).val;

          const user_id = response?.data[0]?.user_id;

          const expires_on = response?.data[0]?.expires_on;

          const meta = {
            email,
            name,
            user_id,
            expires_on,
          };

          setUserMeta(meta);
        })
        // biome-ignore lint/correctness/noUnusedVariables: used for debugging
        .catch((error) => {
          // console.error(error);
        });
    };
    getUserMeta();
  }, [userMeta, setUserMeta]);

  useEffect(() => {
    if (!userMeta) {
      return;
    }

    if (userMeta?.email) {
      setEmail(userMeta.email);
    } else {
      if (userMeta?.user_id) {
        setEmail(userMeta.user_id);
      }
    }

    if (userMeta?.name) {
      setName(userMeta.name);
    }

    if (userMeta?.email && userMeta?.name) {
      setHasData(true);
    }
  }, [setEmail, setHasData, setName, userMeta]);

  const formatName = useCallback((name) => {
    if (!name) {
      return;
    }

    let returnName = '';
    returnName = name.split(' ')?.map((part) => part[0].toUpperCase());
    if (returnName.length > 2) {
      const firstInitial = returnName[0];
      const lastInitial = returnName[returnName.length - 1];
      returnName = `${firstInitial}${lastInitial}`;
    }
    return returnName;
  }, []);

  const icon = useMemo(() => {
    return hasData ? (
      formatName(name)
    ) : (
      <FontAwesomeIcon size="2x" icon={faCircleUser} />
    );
  }, [formatName, hasData, name]);

  return (
    <>
      <span className="hidden mr-2 text-sm lg:flex">{email}</span>
      <div className="dropdown dropdown-end bg-base-300">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label tabIndex={0} className="avatar placeholder">
          <div
            className={clsx(
              'rounded-full bg-primary text-primary-content cursor-pointer',
              {
                'p-2': hasData,
                'p-1': !hasData,
              }
            )}
          >
            {icon}
          </div>
        </label>
        {hasData ? (
          <ul
            tabIndex={0}
            className="w-48 p-2 mt-3 shadow menu menu-sm dropdown-content z-1 bg-base-200 rounded-box"
          >
            <li>
              <a href="/.auth/logout">
                <FontAwesomeIcon icon={faRightFromBracket} fixedWidth />
                Logout
              </a>
            </li>
          </ul>
        ) : null}
      </div>
    </>
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
