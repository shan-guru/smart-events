import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';

const Header = ({ 
  logo, 
  title, 
  subtitle, 
  userAvatar, 
  userName,
  onLogoClick,
  navigationItems = [],
  actions = []
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left Section - Logo and Title */}
        <div className="header-left">
          {logo && (
            <div className="header-logo" onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }}>
              {typeof logo === 'string' ? (
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="logo-image"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                logo
              )}
              <div className="logo-placeholder" style={{ display: typeof logo === 'string' ? 'none' : 'flex' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            </div>
          )}
          <div className="header-title-section">
            {title && <h1 className="header-title">{title}</h1>}
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Center Section - Navigation */}
        {navigationItems.length > 0 && (
          <nav className="header-navigation">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href || '#'}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                {item.icon && <span className="nav-icon">{item.icon}</span>}
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Section - Actions and User */}
        <div className="header-right">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`header-action ${action.variant || 'default'}`}
              title={action.title}
            >
              {action.icon && <span className="action-icon">{action.icon}</span>}
              {action.label && <span className="action-label">{action.label}</span>}
            </button>
          ))}
          
          {userAvatar && (
            <div className="header-user">
              {typeof userAvatar === 'string' ? (
                <img 
                  src={userAvatar} 
                  alt={userName || 'User'} 
                  className="user-avatar"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                userAvatar
              )}
              <div 
                className="user-avatar-placeholder" 
                style={{ display: typeof userAvatar === 'string' ? 'none' : 'flex' }}
              >
                {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
              {userName && <span className="user-name">{userName}</span>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  userAvatar: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  userName: PropTypes.string,
  onLogoClick: PropTypes.func,
  navigationItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
      icon: PropTypes.node,
      active: PropTypes.bool,
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      title: PropTypes.string,
    })
  ),
};

export default Header;

