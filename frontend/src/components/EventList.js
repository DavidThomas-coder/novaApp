import React from 'react';
import './EventList.css';

function EventList({ events, onEventSelect }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      live: { color: '#43e97b', label: 'Live' },
      completed: { color: '#667eea', label: 'Completed' },
      draft: { color: '#ffd700', label: 'Draft' },
      canceled: { color: '#e74c3c', label: 'Canceled' }
    };
    
    const config = statusConfig[status] || { color: '#999', label: status };
    
    return (
      <span 
        className="status-badge" 
        style={{ background: config.color }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="event-list">
      <h2 className="section-title">All Events ({events.length})</h2>
      <div className="events-grid">
        {events.map(event => (
          <div 
            key={event.id} 
            className="event-card"
            onClick={() => onEventSelect(event.id)}
          >
            <div className="event-header">
              <h3 className="event-name">{event.name}</h3>
              {getStatusBadge(event.status)}
            </div>
            
            <div className="event-details">
              <div className="event-info">
                <span className="info-icon">📅</span>
                <span>{formatDate(event.start)}</span>
              </div>
              
              {event.capacity > 0 && (
                <div className="event-info">
                  <span className="info-icon">🎟️</span>
                  <span>Capacity: {event.capacity}</span>
                </div>
              )}
              
              {event.is_free && (
                <div className="event-info">
                  <span className="info-icon">🎁</span>
                  <span>Free Event</span>
                </div>
              )}
            </div>
            
            <button className="view-details-btn">
              View Details →
            </button>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="empty-state">
          <p>No events found</p>
        </div>
      )}
    </div>
  );
}

export default EventList;

