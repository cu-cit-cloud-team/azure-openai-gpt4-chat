import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

export const UserAvatar = ({ userMeta }) => {
  return (
    <>
      <span className="mr-2 hidden lg:flex text-sm">
        {userMeta?.email ? userMeta.email : ''}
      </span>
      <label
        className={`avatar${
          userMeta?.email && userMeta?.name ? ' placeholder' : ''
        }`}
      >
        <div
          className={`p-${
            userMeta?.email && userMeta?.name ? '2' : '1'
          } rounded-full bg-neutral text-neutral-content`}
        >
          {userMeta?.email && userMeta?.name ? (
            userMeta?.name?.split(' ')?.map((part) => part[0].toUpperCase())
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
