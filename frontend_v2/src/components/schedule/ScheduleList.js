import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

const ScheduleList = ({ schedules = [], onEdit, onDelete, onCreateNew, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDateTime = (dateString, hour, ampm) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
      if (hour && ampm) {
        return `${dateStr}, ${hour} ${ampm}`;
      }
      return dateStr;
    } catch {
      return dateString;
    }
  };

  const formatDuration = (quantity, unit) => {
    if (!quantity || !unit) return 'N/A';
    return `${quantity} ${unit}`;
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSchedules = [...schedules];
    const draggedSchedule = newSchedules[draggedIndex];
    newSchedules.splice(draggedIndex, 1);
    newSchedules.splice(dropIndex, 0, draggedSchedule);
    
    if (onReorder) {
      onReorder(newSchedules);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <div className="section-title">Schedules</div>
        <EmptyState
          icon="📋"
          title="No Schedules Yet"
          description="Start by creating your first schedule"
          actionLabel="Create Schedule"
          onAction={onCreateNew}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div className="section-title">Schedules</div>
        <Button onClick={onCreateNew}>Create Schedule</Button>
      </div>

      {/* Desktop/Tablet View */}
      <div style={{ 
        overflowX: 'auto', 
        width: '100%', 
        WebkitOverflowScrolling: 'touch',
        display: 'block'
      }}
      className="desktop-view"
      >
        {/* Table Header */}
        <div 
          className="schedule-table-header"
          style={{
          display: 'grid',
          gridTemplateColumns: '50px 2fr minmax(100px, 120px) minmax(100px, 120px) minmax(120px, 150px) minmax(140px, 1fr) minmax(140px, 1fr) minmax(50px, 60px)',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: 'var(--primary-gradient)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.5rem',
          alignItems: 'center',
          minWidth: '1000px',
        }}>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Move</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Title</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owners</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', wordBreak: 'break-word' }}>Start Date & Time</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', wordBreak: 'break-word' }}>End Date & Time</div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Edit</div>
        </div>

        {/* Table Rows */}
        <div>
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id || index}
              className="schedule-table-row"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 2fr minmax(100px, 120px) minmax(100px, 120px) minmax(120px, 150px) minmax(140px, 1fr) minmax(140px, 1fr) minmax(50px, 60px)',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                background: draggedIndex === index ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.5rem',
                alignItems: 'center',
                cursor: 'grab',
                transition: 'all 0.2s ease',
                minWidth: '1000px',
                opacity: draggedIndex === index ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (draggedIndex !== index) {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
              }}
              onMouseLeave={(e) => {
                if (draggedIndex !== index) {
                  e.currentTarget.style.background = 'var(--bg-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Move Icon */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="var(--text-secondary)" 
                  strokeWidth="2"
                  style={{ cursor: 'grab' }}
                >
                  <circle cx="9" cy="12" r="1"></circle>
                  <circle cx="9" cy="5" r="1"></circle>
                  <circle cx="9" cy="19" r="1"></circle>
                  <circle cx="15" cy="12" r="1"></circle>
                  <circle cx="15" cy="5" r="1"></circle>
                  <circle cx="15" cy="19" r="1"></circle>
                </svg>
              </div>

              {/* Task Title */}
              <div style={{ 
                fontWeight: '600', 
                color: 'var(--text-primary)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0
              }}>
                {schedule.taskTitle || schedule.scheduleName || schedule.name || 'Untitled Task'}
              </div>

              {/* Priority */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Badge variant={
                  schedule.priority === 'high' ? 'danger' : 
                  schedule.priority === 'medium' ? 'warning' : 
                  'success'
                }>
                  {((schedule.priority || 'medium').charAt(0).toUpperCase() + (schedule.priority || 'medium').slice(1))}
                </Badge>
              </div>

              {/* Duration */}
              <div style={{ 
                color: 'var(--text-primary)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                minWidth: 0
              }}>
                {formatDuration(schedule.durationQuantity, schedule.durationUnit)}
              </div>

              {/* Owners */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {schedule.owners && schedule.owners.length > 0 ? (
                  schedule.owners.slice(0, 3).map((owner, i) => (
                    <div
                      key={i}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        background: i === 0 
                          ? 'var(--primary-gradient)' 
                          : i === 1 
                          ? 'var(--secondary-gradient)' 
                          : 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        flexShrink: 0,
                      }}
                      title={typeof owner === 'string' ? owner : owner.name || 'Owner'}
                    >
                      {getInitials(typeof owner === 'string' ? owner : owner.name || '')}
                    </div>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No owners</span>
                )}
              </div>

              {/* Start Date & Time */}
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3',
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {formatDateTime(schedule.startDate, schedule.startHour, schedule.startAMPM)}
              </div>

              {/* End Date & Time */}
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3',
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {formatDateTime(schedule.endDate, schedule.endHour, schedule.endAMPM)}
              </div>

              {/* Edit Icon */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '50px',
                maxWidth: '60px',
                flexShrink: 0,
              }}>
                <button
                  onClick={() => onEdit && onEdit(schedule)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary-color)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    minHeight: '32px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="Edit schedule"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="mobile-view" style={{ display: 'none' }}>
        {schedules.map((schedule, index) => (
          <Card
            key={schedule.id || index}
            style={{
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: 0, 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {schedule.taskTitle || schedule.scheduleName || schedule.name || 'Untitled Task'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Badge variant={
                    schedule.priority === 'high' ? 'danger' : 
                    schedule.priority === 'medium' ? 'warning' : 
                    'success'
                  }>
                    {((schedule.priority || 'medium').charAt(0).toUpperCase() + (schedule.priority || 'medium').slice(1))}
                  </Badge>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {formatDuration(schedule.durationQuantity, schedule.durationUnit)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onEdit && onEdit(schedule)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary-color)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
                aria-label="Edit schedule"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center', 
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Owners:</span>
              {schedule.owners && schedule.owners.length > 0 ? (
                schedule.owners.map((owner, i) => (
                  <div
                    key={i}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      background: i === 0 
                        ? 'var(--primary-gradient)' 
                        : i === 1 
                        ? 'var(--secondary-gradient)' 
                        : 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                    title={typeof owner === 'string' ? owner : owner.name || 'Owner'}
                  >
                    {getInitials(typeof owner === 'string' ? owner : owner.name || '')}
                  </div>
                ))
              ) : (
                <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No owners</span>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Start: </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {formatDateTime(schedule.startDate, schedule.startHour, schedule.startAMPM)}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>End: </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {formatDateTime(schedule.endDate, schedule.endHour, schedule.endAMPM)}
                </span>
              </div>
            </div>

            {/* Drag handle for mobile */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '3rem',
              cursor: 'grab',
            }}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="var(--text-secondary)" 
                strokeWidth="2"
              >
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </div>
          </Card>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-view {
            display: none !important;
          }
          .mobile-view {
            display: block !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1200px) {
          .desktop-view {
            display: block !important;
          }
          .mobile-view {
            display: none !important;
          }
          .desktop-view .schedule-table-header,
          .desktop-view .schedule-table-row {
            gridTemplateColumns: 40px 1.5fr minmax(80px, 100px) minmax(80px, 100px) minmax(100px, 120px) minmax(120px, 1fr) minmax(120px, 1fr) minmax(45px, 55px) !important;
            gap: 0.75rem !important;
            padding: 1rem !important;
            minWidth: 800px !important;
          }
          .desktop-view .schedule-table-header div,
          .desktop-view .schedule-table-row > div {
            font-size: 0.8rem !important;
          }
        }
        @media (min-width: 1201px) {
          .desktop-view {
            display: block !important;
          }
          .mobile-view {
            display: none !important;
          }
        }
        .schedule-table-header,
        .schedule-table-row {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .schedule-table-row > div {
          overflow: hidden;
        }
      `}</style>
    </Card>
  );
};

ScheduleList.propTypes = {
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      taskTitle: PropTypes.string,
      scheduleName: PropTypes.string,
      name: PropTypes.string,
      priority: PropTypes.oneOf(['low', 'medium', 'high']),
      durationQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      durationUnit: PropTypes.string,
      owners: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({
            name: PropTypes.string,
          })
        ])
      ),
      startDate: PropTypes.string,
      startHour: PropTypes.string,
      startAMPM: PropTypes.string,
      endDate: PropTypes.string,
      endHour: PropTypes.string,
      endAMPM: PropTypes.string,
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreateNew: PropTypes.func,
  onReorder: PropTypes.func,
};

export default ScheduleList;
