import React, { useState, useMemo } from 'react';
import { exportEventsToCSV } from '../utils/csvExport';
import './EventList.css';

function EventList({ events, onEventSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // Sort events
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc':
          return new Date(b.start) - new Date(a.start);
        case 'date-asc':
          return new Date(a.start) - new Date(b.start);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [events, searchTerm, statusFilter, sortBy]);
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
      <h2 className="section-title">All Events ({filteredEvents.length})</h2>
      <p className="tab-description">
        Browse and search all your Eventbrite events. Filter by status, sort by date or name, 
        and click any event to view detailed attendee information.
      </p>
      
      <div className="event-filters">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="event-search-input"
        />
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="event-status-filter"
        >
          <option value="all">All Statuses</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="canceled">Canceled</option>
        </select>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="event-status-filter"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
        
        <button 
          onClick={() => exportEventsToCSV(filteredEvents)}
          className="export-button"
          title="Export filtered events to CSV"
        >
          📊 Export Events
        </button>
      </div>
      
      <div className="events-grid">
        {filteredEvents.map(event => (
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
      
      {filteredEvents.length === 0 && (
        <div className="empty-state">
          <p>No events found{searchTerm || statusFilter !== 'all' ? ' matching your filters' : ''}</p>
        </div>
      )}
    </div>
  );
}

export default EventList;

