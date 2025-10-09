import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventPerformance.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function EventPerformance({ orgId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [sortBy, setSortBy] = useState('revenue');
  const [showCount, setShowCount] = useState(20);

  const loadPerformance = async () => {
    setLoading(true);
    setHasLoaded(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/event-performance`, {
        params: { org_id: orgId },
        timeout: 120000 // 2 minute timeout for large datasets
      });
      setEvents(response.data.events);
    } catch (err) {
      console.error('Failed to load performance data:', err);
      alert('Failed to load performance data. You may have hit the API rate limit. Please wait 2-3 minutes and try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedEvents = React.useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      switch(sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'attendees':
          return b.attendees - a.attendees;
        case 'sell-through':
          return b.sell_through_rate - a.sell_through_rate;
        case 'check-in':
          return b.check_in_rate - a.check_in_rate;
        default:
          return 0;
      }
    });
    return sorted.slice(0, showCount);
  }, [events, sortBy, showCount]);

  if (!hasLoaded) {
    return (
      <div className="event-performance">
        <h2 className="section-title">Event Performance Rankings</h2>
        <p className="tab-description">
          Compare all events by attendance, revenue, sell-through rates, and check-in rates. 
          Identify your best-performing shows and track which events drive the most engagement.
        </p>
        
        <div className="load-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Performance Data Not Loaded</h3>
            <p>
              This analysis requires fetching detailed data for all 179+ events, which makes 
              approximately 180 API calls to Eventbrite. To avoid hitting rate limits, 
              click the button below only when you need this detailed analysis.
            </p>
            <p className="hint-text">
              💡 Tip: Once loaded, the data will be available for this session. 
              Avoid reloading this tab frequently.
            </p>
            <button 
              onClick={loadPerformance}
              className="load-performance-button"
            >
              📊 Load Performance Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="event-performance">
        <h2 className="section-title">Event Performance Rankings</h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading performance data for all events...</p>
          <p className="loading-detail">This may take 1-2 minutes. Please be patient.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-performance">
      <h2 className="section-title">Event Performance Rankings</h2>
      <p className="tab-description">
        Compare all events by attendance, revenue, sell-through rates, and check-in rates. 
        Identify your best-performing shows and track which events drive the most engagement.
      </p>
      
      <div className="performance-controls">
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-dropdown"
        >
          <option value="revenue">By Revenue</option>
          <option value="attendees">By Attendance</option>
          <option value="sell-through">By Sell-Through Rate</option>
          <option value="check-in">By Check-In Rate</option>
        </select>
        
        <select 
          value={showCount}
          onChange={(e) => setShowCount(Number(e.target.value))}
          className="count-dropdown"
        >
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
          <option value={events.length}>All Events</option>
        </select>
      </div>

      <div className="performance-table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Event Name</th>
              <th>Status</th>
              <th>Attendees</th>
              <th>Capacity</th>
              <th>Sell-Through</th>
              <th>Checked In</th>
              <th>Check-In Rate</th>
              <th>Revenue</th>
              <th>Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((event, index) => (
              <tr key={event.id}>
                <td className="rank-cell">
                  {index + 1 === 1 && '🥇'}
                  {index + 1 === 2 && '🥈'}
                  {index + 1 === 3 && '🥉'}
                  {index + 1 > 3 && `#${index + 1}`}
                </td>
                <td className="name-cell">{event.name}</td>
                <td>
                  <span className={`status-badge ${event.status}`}>
                    {event.status}
                  </span>
                </td>
                <td className="number-cell">{event.attendees}</td>
                <td className="number-cell">{event.capacity || 'N/A'}</td>
                <td className="percent-cell">
                  {event.capacity > 0 ? `${event.sell_through_rate.toFixed(1)}%` : 'N/A'}
                </td>
                <td className="number-cell">{event.checked_in}</td>
                <td className="percent-cell">
                  {event.check_in_rate.toFixed(1)}%
                </td>
                <td className="revenue-cell">${event.revenue.toLocaleString()}</td>
                <td className="price-cell">${event.avg_ticket_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedEvents.length === 0 && (
        <div className="empty-state">
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );
}

export default EventPerformance;

