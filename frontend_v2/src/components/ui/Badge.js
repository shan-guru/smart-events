import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ children, variant = 'primary', className = '', ...props }) => {
  const variantClass = `badge badge-${variant}`;
  
  return (
    <span className={`${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  className: PropTypes.string,
};

export default Badge;

