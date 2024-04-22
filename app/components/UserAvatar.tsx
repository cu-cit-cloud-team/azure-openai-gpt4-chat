import {
  faCircleUser,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { memo, useEffect, useState } from 'react';

import { useUserMetaContext } from '@/app/contexts/UserMetaContext';

export const UserAvatar = memo(() => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const { userMeta } = useUserMetaContext();

  useEffect(() => {
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
  }, [userMeta]);

  const formatName = (name) => {
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
  };

  return (
    <>
      <span className="hidden mr-2 text-sm lg:flex">{email}</span>
      <div className="dropdown dropdown-end bg-base-300">
        <label tabIndex={0} className="avatar placeholder">
          <div
            className={`p-${
              email.length && name.length ? '2' : '1'
            } rounded-full bg-primary text-primary-content cursor-pointer`}
          >
            {email.length && name.length ? (
              formatName(name)
            ) : (
              <FontAwesomeIcon size="2x" icon={faCircleUser} />
            )}
          </div>
        </label>
        {email.length && name.length ? (
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
