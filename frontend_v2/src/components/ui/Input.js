import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  style,
  ...props
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  const containerStyle = {
    marginBottom: '1.5rem',
    width: '100%',
    boxSizing: 'border-box',
    ...(style?.marginBottom !== undefined ? { marginBottom: style.marginBottom } : {}),
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`input-field ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={4}
          style={style}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`input-field ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={style}
          {...props}
        />
      )}
      {error && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--error)' }}>
          {error}
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'number', 'date', 'email', 'tel', 'textarea']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;

