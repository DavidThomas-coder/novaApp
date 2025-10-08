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
import './Dashboard.css';

const COLORS = ['#ff1493', '#39ff14', '#ff00ff', '#00ffff', '#ffff00', '#ff6600'];

function Dashboard({ insights }) {
  const {
    total_events,
    total_attendees,
    unique_customers,
    repeat_customers,
    repeat_customer_rate,
    avg_attendees_per_event,
    monthly_trends,
    ticket_types
  } = insights;

  return (
    <div className="dashboard">
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
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#39ff14" />
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
            <BarChart data={monthly_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#39ff14" />
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

        {ticket_types && ticket_types.length > 0 && (
          <div className="chart-card">
            <h3>Ticket Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticket_types}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {ticket_types.map((entry, index) => (
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

