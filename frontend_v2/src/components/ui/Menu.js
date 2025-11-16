import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Menu.css';

const Menu = ({ trigger, items = [], placement = 'bottom-right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  const getPlacementClass = () => {
    const placements = {
      'bottom-right': 'menu-bottom-right',
      'bottom-left': 'menu-bottom-left',
      'top-right': 'menu-top-right',
      'top-left': 'menu-top-left',
    };
    return placements[placement] || placements['bottom-right'];
  };

  return (
    <div className="menu-wrapper">
      <div
        ref={triggerRef}
        className="menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className={`menu-dropdown ${getPlacementClass()}`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="menu-divider" />;
            }
            return (
              <button
                key={index}
                className={`menu-item ${item.danger ? 'menu-item-danger' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                {item.icon && <span className="menu-item-icon">{item.icon}</span>}
                <span className="menu-item-label">{item.label}</span>
                {item.badge && (
                  <span className="menu-item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {isOpen && <div className="menu-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

Menu.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func,
      danger: PropTypes.bool,
      disabled: PropTypes.bool,
      badge: PropTypes.node,
      divider: PropTypes.bool,
    })
  ),
  placement: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
};

export default Menu;

