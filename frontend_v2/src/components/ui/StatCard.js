import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ label, value, icon, className = '', ...props }) => {
  return (
    <div className={`stat-card ${className}`} {...props}>
      {icon && <div style={{ marginBottom: '0.5rem' }}>{icon}</div>}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default StatCard;

