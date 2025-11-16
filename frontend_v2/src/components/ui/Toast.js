import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-primary)',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideInRight 0.3s ease-out',
      position: 'relative',
      zIndex: 1000,
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          borderLeft: '4px solid var(--success)',
        };
      case 'error':
        return {
          ...baseStyles,
          borderLeft: '4px solid var(--error)',
        };
      case 'warning':
        return {
          ...baseStyles,
          borderLeft: '4px solid var(--warning)',
        };
      case 'info':
      default:
        return {
          ...baseStyles,
          borderLeft: '4px solid var(--info)',
        };
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
      default:
        return 'var(--info)';
    }
  };

  return (
    <div style={getStyles()}>
      <div style={{ color: getIconColor(), flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default Toast;

