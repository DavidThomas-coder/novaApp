import React, { useState } from 'react';
import './EventDetails.css';

function EventDetails({ event, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAttendees = event.attendees.filter(attendee =>
    attendee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ticketTypeCounts = event.attendees.reduce((acc, attendee) => {
    acc[attendee.ticket_class_name] = (acc[attendee.ticket_class_name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="event-details">
      <button className="back-button" onClick={onBack}>
        ← Back to Events
      </button>

      <div className="event-header-card">
        <h2>{event.name}</h2>
        <div className="event-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{formatDate(event.start)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🎟️</span>
            <span>{event.attendees.length} Attendees</span>
          </div>
          {event.capacity > 0 && (
            <div className="meta-item">
              <span className="meta-icon">🎪</span>
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="ticket-types-card">
        <h3>Ticket Types</h3>
        <div className="ticket-types-grid">
          {Object.entries(ticketTypeCounts).map(([type, count]) => (
            <div key={type} className="ticket-type-item">
              <span className="ticket-type-name">{type}</span>
              <span className="ticket-type-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="attendees-card">
        <div className="attendees-header">
          <h3>Attendees ({filteredAttendees.length})</h3>
          <input
            type="text"
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="attendees-table-container">
          <table className="attendees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Ticket Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map(attendee => (
                <tr key={attendee.id}>
                  <td className="name-cell">
                    {attendee.first_name} {attendee.last_name}
                  </td>
                  <td className="email-cell">{attendee.email}</td>
                  <td>{attendee.ticket_class_name}</td>
                  <td>
                    <span className="status-pill">{attendee.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAttendees.length === 0 && (
            <div className="no-results">
              No attendees found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;

