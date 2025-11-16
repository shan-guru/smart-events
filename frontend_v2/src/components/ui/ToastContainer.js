import React from 'react';
import PropTypes from 'prop-types';
import Toast from './Toast';

const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '400px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
          }}
        >
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      duration: PropTypes.number,
    })
  ),
  onClose: PropTypes.func.isRequired,
};

export default ToastContainer;

