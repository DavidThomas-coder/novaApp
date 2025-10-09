import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { exportMonthlyTrendsToCSV } from '../utils/csvExport';
import DateRangeFilter from './DateRangeFilter';
import './Dashboard.css';

const COLORS = ['#ff1493', '#39ff14', '#ff00ff', '#00ffff', '#ffff00', '#ff6600'];

// Helper function to format YYYY-MM to "Jan '25"
const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(year, parseInt(month) - 1);
  const monthName = date.toLocaleString('en-US', { month: 'short' });
  const shortYear = year.slice(-2);
  return `${monthName} '${shortYear}`;
};

function Dashboard({ insights }) {
  const {
    total_events,
    total_attendees,
    total_revenue = 0,
    avg_revenue_per_event = 0,
    avg_revenue_per_ticket = 0,
    unique_customers,
    repeat_customers,
    repeat_customer_rate,
    avg_attendees_per_event,
    monthly_trends,
    ticket_types,
    events_list = [],
    events_monthly_data = {}
  } = insights;

  const [selectedEvent, setSelectedEvent] = React.useState('all');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });

  const handleDateRangeChange = (start, end) => {
    setDateRange({ start, end });
  };

  // Filter monthly trends based on selected event and date range
  const filteredMonthlyTrends = React.useMemo(() => {
    let data = selectedEvent === 'all' 
      ? monthly_trends 
      : events_monthly_data[selectedEvent] || [];
    
    // Filter by date range
    if (dateRange.start || dateRange.end) {
      data = data.filter(item => {
        if (dateRange.start && item.month < dateRange.start.substring(0, 7)) return false;
        if (dateRange.end && item.month > dateRange.end.substring(0, 7)) return false;
        return true;
      });
    }
    
    // Add formatted month labels
    return data.map(item => ({
      ...item,
      monthLabel: formatMonthLabel(item.month)
    }));
  }, [selectedEvent, monthly_trends, events_monthly_data, dateRange]);

  // Group ticket types: top 5 + "Other"
  const groupedTicketTypes = React.useMemo(() => {
    if (!ticket_types || ticket_types.length === 0) return [];
    
    // Sort by count descending
    const sorted = [...ticket_types].sort((a, b) => b.count - a.count);
    
    // Take top 5
    const top5 = sorted.slice(0, 5);
    const remaining = sorted.slice(5);
    
    // Group remaining as "Other"
    if (remaining.length > 0) {
      const otherCount = remaining.reduce((sum, item) => sum + item.count, 0);
      return [...top5, { type: 'Other', count: otherCount }];
    }
    
    return top5;
  }, [ticket_types]);

  return (
    <div className="dashboard">
      <p className="tab-description">
        Overview of key metrics and trends across all events. Track revenue, attendance, 
        and customer retention at a glance.
      </p>
      
      <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎪</div>
          <div className="stat-content">
            <h3>Total Events</h3>
            <p className="stat-value">{total_events}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎟️</div>
          <div className="stat-content">
            <h3>Total Attendees</h3>
            <p className="stat-value">{total_attendees}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Unique Customers</h3>
            <p className="stat-value">{unique_customers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>Repeat Customers</h3>
            <p className="stat-value">{repeat_customers}</p>
            <p className="stat-detail">{repeat_customer_rate}% of total</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avg Attendees/Event</h3>
            <p className="stat-value">{avg_attendees_per_event}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${total_revenue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Avg Revenue/Event</h3>
            <p className="stat-value">${avg_revenue_per_event.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>Avg Revenue/Ticket</h3>
            <p className="stat-value">${avg_revenue_per_ticket.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {events_list.length > 0 && (
        <div className="event-filter">
          <label htmlFor="event-filter-select">Filter by Show:</label>
          <select 
            id="event-filter-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="event-filter-dropdown"
          >
            <option value="all">All Events Combined</option>
            {events_list.map(event => (
              <option key={event.id} value={event.name}>
                {event.name}
              </option>
            ))}
          </select>
          
          <button 
            onClick={() => exportMonthlyTrendsToCSV(filteredMonthlyTrends)}
            className="export-button"
            title="Export monthly data to CSV"
          >
            📊 Export Data
          </button>
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredMonthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="monthLabel" stroke="#39ff14" />
              <YAxis stroke="#39ff14" />
              <Tooltip 
                contentStyle={{ 
                  background: '#0a0a0a', 
                  border: '1px solid #ff1493',
                  borderRadius: '8px',
                  color: '#39ff14'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke="#ff1493" 
                strokeWidth={3}
                name="Events"
              />
              <Line 
                type="monotone" 
                dataKey="attendees" 
                stroke="#39ff14" 
                strokeWidth={3}
                name="Attendees"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Attendees by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredMonthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="monthLabel" stroke="#39ff14" />
              <YAxis stroke="#39ff14" />
              <Tooltip 
                contentStyle={{ 
                  background: '#0a0a0a', 
                  border: '1px solid #ff1493',
                  borderRadius: '8px',
                  color: '#39ff14'
                }} 
              />
              <Bar dataKey="attendees" fill="#ff1493" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredMonthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="monthLabel" stroke="#39ff14" />
              <YAxis stroke="#39ff14" />
              <Tooltip 
                contentStyle={{ 
                  background: '#0a0a0a', 
                  border: '1px solid #ff1493',
                  borderRadius: '8px',
                  color: '#39ff14'
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="revenue" fill="#39ff14" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {groupedTicketTypes && groupedTicketTypes.length > 0 && (
          <div className="chart-card">
            <h3>Ticket Types Distribution (Top 5)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={groupedTicketTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {groupedTicketTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#0a0a0a', 
                    border: '1px solid #ff1493',
                    borderRadius: '8px',
                    color: '#39ff14'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

