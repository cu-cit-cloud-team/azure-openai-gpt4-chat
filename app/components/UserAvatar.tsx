import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

export const UserAvatar = ({ userMeta }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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
    let returnName = name.split(' ')?.map((part) => part[0].toUpperCase());
    if (returnName.length > 2) {
      const firstInitial = returnName.split('')[0];
      const lastInitial = returnName.split('')[returnName.length - 1];
      returnName = `${firstInitial}${lastInitial}`;
    }
    return returnName;
  };

  return (
    <>
      <span className="mr-2 hidden lg:flex text-sm">{email}</span>
      <label
        className={`avatar${
          userMeta?.email && userMeta?.name ? ' placeholder' : ''
        }`}
      >
        <div
          className={`p-${
            email.length && name.length ? '2' : '1'
          } rounded-full bg-neutral text-neutral-content`}
        >
          {email.length && name.length ? (
            formatName(name)
          ) : (
            <FontAwesomeIcon size="2x" icon={faCircleUser} />
          )}
        </div>
      </label>
    </>
  );
};

UserAvatar.displayName = 'UserAvatar';
UserAvatar.propTypes = {
  userMeta: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    PropTypes.instanceOf(undefined),
  ]),
};

export default UserAvatar;
