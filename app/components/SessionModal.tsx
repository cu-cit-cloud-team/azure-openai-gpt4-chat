import React from 'react';

export const SessionModal = () => {
  return (
    <dialog className="modal modal-bottom sm:modal-middle sessionModal">
      <div className="w-11/12 max-w-5xl modal-box bg-warning-content">
        <h3 className="text-lg font-bold text-warning">Warning</h3>
        <p className="py-4 text-warning">Your session has expired.</p>
        <div className="modal-action">
          <button
            type="button"
            className="btn text-warning-content btn-warning"
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh your session
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SessionModal;

SessionModal.displayName = 'SessionModal';
