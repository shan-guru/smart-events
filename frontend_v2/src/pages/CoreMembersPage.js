import React, { useState } from 'react';
import '../themes/Theme1.css';
import Header from '../components/ui/Header';
import Menu from '../components/ui/Menu';
import ExecutionMembers from '../components/members/ExecutionMembers';

function CoreMembersPage({ navigate }) {
  const [members, setMembers] = useState([
    {
      id: 1,
      type: "person",
      firstName: "Aarav",
      lastName: "Raman",
      email: "aarav.raman@example.com",
      phone: "+919876543210",
      whatsapp: "+919876543210",
      specializedIn: "Birthday Event Planning",
      experience: "5-10",
      address: "12 Gandhi Street, T. Nagar, Chennai"
    },
    {
      id: 2,
      type: "person",
      firstName: "Meera",
      lastName: "Sundaram",
      email: "meera.sundaram@example.com",
      phone: "+919884321567",
      whatsapp: "+919884321567",
      specializedIn: "Decoration & Theme Setup",
      experience: "3-5",
      address: "45 Lakshmi Nagar, Velachery, Chennai"
    },
    {
      id: 3,
      type: "entity",
      name: "Celebrato Events",
      email: "info@celebratoevents.com",
      phone: "+914442223456",
      specializedIn: "End-to-End Birthday Event Management",
      experience: "10-20",
      address: "78 Arcot Road, Kodambakkam, Chennai",
      offline: true
    },
    {
      id: 4,
      type: "entity",
      name: "HappyHive Planners",
      email: "support@happyhive.in",
      phone: "+914465552233",
      specializedIn: "Kids Birthday Themes & Entertainment",
      experience: "5-10",
      address: "22 OMR Main Road, Sholinganallur, Chennai",
      offline: false
    },
    {
      id: 5,
      type: "person",
      firstName: "Karthik",
      lastName: "Raj",
      email: "karthik.raj@example.com",
      phone: "+919902234455",
      whatsapp: "+919902234455",
      specializedIn: "Catering & Party Food Coordination",
      experience: "10-15",
      address: "9 Anna Salai, Mount Road, Chennai"
    }
  ]);

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
        title="Core Members"
        subtitle="Manage your execution members and team"
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
        <ExecutionMembers members={members} setMembers={setMembers} />
      </div>
    </div>
  );
}

export default CoreMembersPage;

