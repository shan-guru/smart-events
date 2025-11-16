import React, { useState, useEffect } from 'react';
import '../themes/Theme1.css';
import Header from '../components/ui/Header';
import Menu from '../components/ui/Menu';
import ExecutionMembers from '../components/members/ExecutionMembers';
import ToastContainer from '../components/ui/ToastContainer';
import memberService from '../services/memberService';
import useToast from '../hooks/useToast';
import { useLabels } from '../contexts/LabelsContext';

function CoreMembersPage({ navigate }) {
  const { getLabel } = useLabels();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getAllMembers();
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(err.message || 'Failed to load members');
      showError('Failed to load members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMembersChange = () => {
    // Reload members after any change
    loadMembers();
  };

  const userMenuItems = [
    {
      label: 'My Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      onClick: () => alert('My Profile clicked'),
    },
    {
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m0 4.243l4.243-4.243M4.636 4.636l4.243 4.243m0-4.243L4.636 8.879"></path>
        </svg>
      ),
      onClick: () => alert('Settings clicked'),
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      ),
      onClick: () => alert('Sign Out clicked'),
      danger: true,
    },
  ];

  return (
    <div className="theme-1">
      <Header
        logo="https://via.placeholder.com/48x48/667eea/ffffff?text=EMS"
        title={getLabel('page.coreMembers.title')}
        subtitle={getLabel('page.coreMembers.subtitle')}
        userAvatar={
          <Menu
            trigger={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <img 
                  src="https://via.placeholder.com/40x40/764ba2/ffffff?text=JD" 
                  alt="John Doe" 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  JD
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  John Doe
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            }
            items={userMenuItems}
            placement="bottom-right"
          />
        }
        navigationItems={[
          { 
            label: 'Events', 
            icon: '📅',
            onClick: () => navigate && navigate('events')
          },
          { 
            label: 'Templates', 
            icon: '📋',
            onClick: () => navigate && navigate('templates')
          },
          { 
            label: 'My Tasks', 
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                <path d="M9 12h6"></path>
                <path d="M9 16h6"></path>
              </svg>
            ),
            onClick: () => navigate && navigate('my-tasks')
          },
          { 
            label: 'Core Members', 
            icon: '👥',
            active: true,
            onClick: () => navigate && navigate('core-members')
          },
        ]}
        actions={[
          {
            label: 'Notifications',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            ),
            onClick: () => alert('Notifications clicked'),
          },
          {
            label: 'Settings',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m0 4.243l4.243-4.243M4.636 4.636l4.243 4.243m0-4.243L4.636 8.879"></path>
              </svg>
            ),
            onClick: () => alert('Settings clicked'),
          },
        ]}
      />
      <div className="app-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Loading members...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>
            <button 
              onClick={loadMembers}
              className="button-primary"
            >
              Retry
            </button>
          </div>
        ) : (
          <ExecutionMembers 
            members={members} 
            setMembers={setMembers}
            onMembersChange={handleMembersChange}
            loading={loading}
            showSuccess={showSuccess}
            showError={showError}
          />
        )}
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default CoreMembersPage;

