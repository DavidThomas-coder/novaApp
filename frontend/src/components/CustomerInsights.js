import React from 'react';
import { exportCustomersToCSV } from '../utils/csvExport';
import './CustomerInsights.css';

function CustomerInsights({ insights }) {
  const {
    new_customers = 0,
    repeat_customers = 0,
    repeat_customer_rate = 0,
    avg_customer_lifetime_value = 0,
    top_customers = []
  } = insights;

  return (
    <div className="customer-insights">
      <h2 className="section-title">Customer Insights</h2>
      
      <div className="customer-stats-grid">
        <div className="customer-stat-card">
          <div className="customer-stat-icon">🆕</div>
          <div className="customer-stat-content">
            <h3>New Customers</h3>
            <p className="customer-stat-value">{new_customers}</p>
            <p className="customer-stat-detail">First-time attendees</p>
          </div>
        </div>
        
        <div className="customer-stat-card">
          <div className="customer-stat-icon">🔄</div>
          <div className="customer-stat-content">
            <h3>Returning Customers</h3>
            <p className="customer-stat-value">{repeat_customers}</p>
            <p className="customer-stat-detail">{repeat_customer_rate}% retention</p>
          </div>
        </div>
        
        <div className="customer-stat-card">
          <div className="customer-stat-icon">💎</div>
          <div className="customer-stat-content">
            <h3>Customer Lifetime Value</h3>
            <p className="customer-stat-value">${avg_customer_lifetime_value.toFixed(2)}</p>
            <p className="customer-stat-detail">Average per customer</p>
          </div>
        </div>
      </div>

      {top_customers.length > 0 && (
        <div className="top-customers-card">
          <div className="customers-header">
            <h3>Top 10 Most Engaged Customers</h3>
            <button 
              onClick={() => exportCustomersToCSV(top_customers)}
              className="export-button"
              title="Export customer data to CSV"
            >
              📊 Export Customers
            </button>
          </div>
          <div className="top-customers-table-container">
            <table className="top-customers-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Email</th>
                  <th>Events Attended</th>
                  <th>Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {top_customers.map((customer, index) => (
                  <tr key={customer.email}>
                    <td className="rank-cell">
                      {index + 1 === 1 && '🥇'}
                      {index + 1 === 2 && '🥈'}
                      {index + 1 === 3 && '🥉'}
                      {index + 1 > 3 && `#${index + 1}`}
                    </td>
                    <td className="email-cell">{customer.email}</td>
                    <td className="events-cell">{customer.events_attended}</td>
                    <td className="value-cell">${customer.lifetime_value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerInsights;

