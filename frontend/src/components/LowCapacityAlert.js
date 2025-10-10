import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LowCapacityAlert.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function LowCapacityAlert({ orgId }) {
  const [lowCapEvents, setLowCapEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadLowCapacityEvents = async () => {
    setLoading(true);
    setHasLoaded(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/event-performance`, {
        params: { org_id: orgId },
        timeout: 120000
      });
      
      const events = response.data.events || [];
      
      // Filter for future live/upcoming events with low capacity (<40%)
      const now = new Date();
      const lowCap = events.filter(e => {
        // Only show future events
        const eventDate = new Date(e.start || e.event_date);
        return (e.status === 'live' || e.status === 'started') && 
               eventDate > now &&
               e.capacity > 0 && 
               e.sell_through_rate < 40;
      }).slice(0, 5);
      
      setLowCapEvents(lowCap);
    } catch (err) {
      console.error('Failed to load capacity data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasLoaded) {
    return (
      <div className="low-capacity-alert">
        <h3>⚠️ Low Capacity Events</h3>
        <p className="alert-description">
          Identify events that need marketing attention
        </p>
        <button 
          onClick={loadLowCapacityEvents}
          className="load-alert-button"
        >
          Check Events
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="low-capacity-alert">
        <h3>Loading...</h3>
      </div>
    );
  }

  if (lowCapEvents.length === 0) {
    return (
      <div className="low-capacity-alert success">
        <h3>✅ All Events Performing Well</h3>
        <p>No live events with capacity below 40%</p>
      </div>
    );
  }

  return (
    <div className="low-capacity-alert warning">
      <h3>⚠️ Events Needing Marketing Attention</h3>
      <p className="alert-description">
        These {lowCapEvents.length} live events have capacity below 40%
      </p>
      <div className="low-cap-list">
        {lowCapEvents.map(event => {
          const eventDate = new Date(event.start);
          const formattedDate = eventDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          return (
            <div key={event.id} className="low-cap-item">
              <div className="event-info">
                <span className="event-name">{event.name}</span>
                <span className="event-date">📅 {formattedDate}</span>
                <span className="capacity-info">
                  {event.attendees}/{event.capacity} seats ({event.sell_through_rate.toFixed(0)}%)
                </span>
              </div>
              <div className="urgency-indicator" style={{
                background: event.sell_through_rate < 20 ? '#ff1493' : 'rgba(255, 20, 147, 0.5)'
              }}>
                {event.sell_through_rate < 20 ? 'High Priority' : 'Medium'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LowCapacityAlert;

