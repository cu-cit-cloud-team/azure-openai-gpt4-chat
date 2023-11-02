import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { React, useState } from 'react';

export const DeleteMessage = ({ isUser, message }) => {
  const [buttonId] = useState(nanoid());

  async function deleteMessage(id) {
    if (confirm('Are you sure you want to delete this message?')) {
      let messages = localStorage.getItem('messages');
      messages = JSON.parse(messages);
      const updatedMessages = messages.filter((m) => m.id !== id);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      location.reload();
    }
  }

  const deleteClickHandler = () => {
    deleteMessage(message.id);
  };

  return (
    <div
      className={`delete-container ${
        isUser ? 'float-left ml-5' : 'float-right mr-5'
      }`}
    >
      <button
        key={buttonId}
        onClick={deleteClickHandler}
        type="button"
        className={`w-8 h-8 p-0 m-0 mr-0 btn btn-sm ${
          isUser
            ? 'btn-primary text-primary-content'
            : 'btn-neutral text-neutral-content'
        }`}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
};

export default DeleteMessage;
