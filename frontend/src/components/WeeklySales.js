import React, { useState } from 'react';
import axios from 'axios';
import './WeeklySales.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function WeeklySales({ orgId }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadWeeklySales = async (offset) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/weekly-sales`, {
        params: { 
          org_id: orgId,
          week_offset: offset
        },
        timeout: 60000
      });
      setWeekData(response.data);
    } catch (err) {
      alert('Failed to load weekly sales. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (offset) => {
    setWeekOffset(offset);
    loadWeeklySales(offset);
  };

  const exportWeeklySales = () => {
    if (!weekData || !weekData.events) return;
    
    const csvRows = [];
    
    // Add header with week info
    csvRows.push(`"Nova Comedy Collective - Weekly Sales Report"`);
    csvRows.push(`"Week of: ${formatDate(weekData.week_start)} to ${formatDate(weekData.week_end)}"`);
    csvRows.push('');
    
    // Add column headers
    csvRows.push('"Event Name","Event Date","Tickets Sold","Gross Revenue"');
    
    // Add event data
    weekData.events.forEach(event => {
      const date = new Date(event.event_date).toLocaleDateString('en-US');
      csvRows.push(`"${event.event_name}","${date}","${event.tickets_sold}","$${event.gross_revenue.toFixed(2)}"`);
    });
    
    // Add totals
    csvRows.push('');
    csvRows.push(`"TOTALS","${weekData.event_count} Events","${weekData.total_tickets}","$${weekData.total_revenue.toFixed(2)}"`);
    
    // Download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    const weekStr = formatDate(weekData.week_start).replace(/\//g, '-');
    a.setAttribute('download', `nova-weekly-sales-${weekStr}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="weekly-sales">
      <h2 className="section-title">Weekly Sales Report</h2>
      <p className="tab-description">
        Generate weekly reports showing tickets sold and gross revenue by event. 
        Perfect for quick weekly updates and tracking week-over-week performance.
      </p>

      <div className="week-selector">
        <button 
          onClick={() => handleWeekChange(weekOffset - 1)}
          className="week-nav-button"
        >
          ← Previous Week
        </button>
        
        <button 
          onClick={() => handleWeekChange(0)}
          className="week-current-button"
          disabled={weekOffset === 0}
        >
          Current Week
        </button>
        
        <button 
          onClick={() => handleWeekChange(weekOffset + 1)}
          className="week-nav-button"
          disabled={weekOffset >= 0}
        >
          Next Week →
        </button>
      </div>

      {!weekData && !loading && (
        <div className="load-prompt">
          <p>Select a week to view sales report</p>
          <button 
            onClick={() => handleWeekChange(0)}
            className="load-button"
          >
            Load Current Week
          </button>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading weekly sales data...</p>
        </div>
      )}

      {weekData && !loading && (
        <>
          <div className="week-summary">
            <div className="week-info">
              <h3>Week of {formatDate(weekData.week_start)} - {formatDate(weekData.week_end)}</h3>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Events:</span>
                  <span className="stat-value">{weekData.event_count}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Tickets Sold:</span>
                  <span className="stat-value">{weekData.total_tickets}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Gross Revenue:</span>
                  <span className="stat-value">${weekData.total_revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={exportWeeklySales}
              className="export-button-large"
            >
              📊 Export to CSV
            </button>
          </div>

          <div className="sales-table-card">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Tickets Sold</th>
                  <th>Gross Revenue</th>
                </tr>
              </thead>
              <tbody>
                {weekData.events.map((event, index) => (
                  <tr key={index}>
                    <td className="event-name-cell">{event.event_name}</td>
                    <td className="date-cell">{formatDate(event.event_date)}</td>
                    <td className="tickets-cell">{event.tickets_sold}</td>
                    <td className="revenue-cell">${event.gross_revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {weekData.events.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-data">No events this week</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td><strong>TOTALS</strong></td>
                  <td><strong>{weekData.event_count} events</strong></td>
                  <td><strong>{weekData.total_tickets}</strong></td>
                  <td><strong>${weekData.total_revenue.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default WeeklySales;

