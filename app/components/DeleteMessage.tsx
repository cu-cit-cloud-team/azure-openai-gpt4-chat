import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { React, useState } from 'react';

import { getItem, setItem } from '../utils/localStorage.ts';

export const DeleteMessage = ({ isUser, message }) => {
  const [buttonId] = useState(nanoid());

  async function deleteMessage(id) {
    if (confirm('Are you sure you want to delete this message?')) {
      const messages = getItem('messages');
      const updatedMessages = messages.filter((m) => m.id !== id);
      setItem('messages', updatedMessages);
      window.location.reload();
    }
  }

  const deleteClickHandler = () => {
    deleteMessage(message.id);
  };

  return (
    <div
      className={`delete-container ${
        isUser ? 'float-left ml-3' : 'float-right mr-3'
      }`}
    >
      <button
        key={buttonId}
        onClick={deleteClickHandler}
        type="button"
        className={`w-6 h-6 p-0 m-0 mr-0 btn btn-xs ${
          isUser
            ? 'btn-primary text-primary-content'
            : 'btn-secondary text-secondary-content'
        }`}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
};

export default DeleteMessage;
