import React, { useState } from 'react';
import { exportCustomersToCSV } from '../utils/csvExport';
import './CustomerInsights.css';

function CustomerInsights({ insights }) {
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const {
    new_customers = 0,
    repeat_customers = 0,
    repeat_customer_rate = 0,
    avg_customer_lifetime_value = 0,
    top_customers = [],
    pseudo_subscribers = 0,
    pseudo_subscriber_rate = 0,
    multi_show_buyers = 0,
    first_time_customers = 0,
    first_timer_retention_rate = 0,
    unique_customers = 0,
    customer_details = []
  } = insights;
  
  // Filter customers for detailed view
  const filteredCustomers = customer_details.filter(customer =>
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );
  
  const displayedCustomers = showAllCustomers 
    ? filteredCustomers 
    : filteredCustomers.slice(0, 20);

  return (
    <div className="customer-insights">
      <h2 className="section-title">Customer Insights</h2>
      <p className="tab-description">
        Understand your audience with detailed customer analytics. Track new vs. returning customers, 
        lifetime value, and identify your most engaged fans.
      </p>
      
      <div className="customer-stats-grid">
        <div className="customer-stat-card">
          <div className="customer-stat-icon">🆕</div>
          <div className="customer-stat-content">
            <h3>First-Time Attendees</h3>
            <p className="customer-stat-value">{first_time_customers}</p>
            <p className="customer-stat-detail">Single event customers</p>
          </div>
        </div>
        
        <div className={`customer-stat-card ${first_timer_retention_rate >= 30 && first_timer_retention_rate <= 50 ? 'benchmark-met' : ''}`}>
          <div className="customer-stat-icon">🔄</div>
          <div className="customer-stat-content">
            <h3>First-Timer Retention</h3>
            <p className="customer-stat-value">{first_timer_retention_rate.toFixed(1)}%</p>
            <p className="customer-stat-detail">Benchmark: 30-50%</p>
          </div>
        </div>
        
        <div className="customer-stat-card">
          <div className="customer-stat-icon">🎫</div>
          <div className="customer-stat-content">
            <h3>Multi-Show Buyers</h3>
            <p className="customer-stat-value">{multi_show_buyers}</p>
            <p className="customer-stat-detail">Attended 2+ events</p>
          </div>
        </div>
        
        <div className="customer-stat-card">
          <div className="customer-stat-icon">⭐</div>
          <div className="customer-stat-content">
            <h3>Pseudo-Subscribers</h3>
            <p className="customer-stat-value">{pseudo_subscribers}</p>
            <p className="customer-stat-detail">{pseudo_subscriber_rate.toFixed(1)}% attend 3+ shows</p>
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
      
      <div className="retention-insights-card">
        <h3>Retention Analysis</h3>
        <div className="retention-breakdown">
          <div className="retention-item">
            <div className="retention-label">One-Time Customers</div>
            <div className="retention-bar">
              <div 
                className="retention-fill one-time" 
                style={{width: `${(first_time_customers / unique_customers * 100).toFixed(0)}%`}}
              />
            </div>
            <div className="retention-value">{first_time_customers} ({(first_time_customers / unique_customers * 100).toFixed(1)}%)</div>
          </div>
          
          <div className="retention-item">
            <div className="retention-label">2+ Events (Returners)</div>
            <div className="retention-bar">
              <div 
                className="retention-fill returners" 
                style={{width: `${(multi_show_buyers / unique_customers * 100).toFixed(0)}%`}}
              />
            </div>
            <div className="retention-value">{multi_show_buyers} ({(multi_show_buyers / unique_customers * 100).toFixed(1)}%)</div>
          </div>
          
          <div className="retention-item">
            <div className="retention-label">3+ Events (Super Fans)</div>
            <div className="retention-bar">
              <div 
                className="retention-fill super-fans" 
                style={{width: `${(pseudo_subscribers / unique_customers * 100).toFixed(0)}%`}}
              />
            </div>
            <div className="retention-value">{pseudo_subscribers} ({pseudo_subscriber_rate.toFixed(1)}%)</div>
          </div>
        </div>
        <p className="retention-note">
          💡 Industry insight: 5% increase in retention = 25-95% profit increase
        </p>
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
      
      <div className="customer-history-card">
        <div className="customers-header">
          <h3>Customer Event History ({customer_details.length} total)</h3>
          <div className="customer-controls">
            <input
              type="text"
              placeholder="Search by email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="customer-search-input"
            />
          </div>
        </div>
        
        <div className="customer-history-table-container">
          <table className="customer-history-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Events Attended</th>
                <th>Lifetime Value</th>
                <th>Active Months</th>
              </tr>
            </thead>
            <tbody>
              {displayedCustomers.map((customer) => (
                <React.Fragment key={customer.email}>
                  <tr 
                    onClick={() => setExpandedCustomer(expandedCustomer === customer.email ? null : customer.email)}
                    className="customer-row clickable"
                  >
                    <td className="email-cell">
                      <span className="expand-icon">
                        {expandedCustomer === customer.email ? '▼' : '▶'}
                      </span>
                      {customer.email}
                    </td>
                    <td className="events-count-cell">{customer.total_events}</td>
                    <td className="value-cell">${customer.lifetime_value.toFixed(2)}</td>
                    <td className="months-cell">
                      {customer.event_months.length} {customer.event_months.length === 1 ? 'month' : 'months'}
                    </td>
                  </tr>
                  {expandedCustomer === customer.email && (
                    <tr className="expanded-row">
                      <td colSpan="4">
                        <div className="event-details-list">
                          <h4>Events Attended:</h4>
                          <div className="events-grid-small">
                            {customer.events && customer.events.map((event, idx) => {
                              const eventDate = new Date(event.event_date);
                              const formattedDate = eventDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              });
                              
                              return (
                                <div key={idx} className="event-badge">
                                  <span className="badge-name">{event.event_name}</span>
                                  <span className="badge-date">{formattedDate}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {!showAllCustomers && filteredCustomers.length > 20 && (
          <button 
            onClick={() => setShowAllCustomers(true)}
            className="show-more-button"
          >
            Show All {filteredCustomers.length} Customers
          </button>
        )}
      </div>
    </div>
  );
}

export default CustomerInsights;

