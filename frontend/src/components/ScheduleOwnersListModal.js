import React from 'react';

const OwnersListModal = ({ owners, isOpen, onClose }) => {
  if (!isOpen || !owners || owners.length === 0) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-gradient flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Task Owners</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 rounded-md p-1 transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-3 bg-gradient-to-b from-white to-gray-50">
          {owners.map((owner, index) => (
            <div
              key={index}
              className="owners-list-item flex items-center gap-3 p-4 rounded-lg"
            >
              <span className={`owner-initial ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : 'bg-purple-600'}`}>
                {owner.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
              <span className="text-gray-900 font-medium text-base">{owner}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-md hover:from-primary-hover hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnersListModal;

