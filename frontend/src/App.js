import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import CustomerInsights from './components/CustomerInsights';
import EventPerformance from './components/EventPerformance';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [insights, setInsights] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadData();
    }
  }, [selectedOrgId]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/organizations`);
      const orgs = response.data.organizations;
      setOrganizations(orgs);
      
      // Select the first organization by default
      if (orgs.length > 0) {
        setSelectedOrgId(orgs[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedOrgId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Load insights and events in parallel with org_id parameter
      const [insightsRes, eventsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/insights`, { params: { org_id: selectedOrgId } }),
        axios.get(`${API_BASE_URL}/api/events`, { params: { org_id: selectedOrgId } })
      ]);
      
      setInsights(insightsRes.data);
      setEvents(eventsRes.data.events);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (orgId) => {
    setSelectedOrgId(orgId);
    setActiveView('dashboard'); // Reset to dashboard when switching orgs
  };

  const handleEventSelect = async (eventId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/event/${eventId}/attendees`);
      const event = events.find(e => e.id === eventId);
      setSelectedEvent({
        ...event,
        attendees: response.data.attendees
      });
      setActiveView('event-details');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Nova Comedy Collective data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <p className="hint">Make sure your EVENTBRITE_TOKEN is set correctly.</p>
          <button onClick={loadData} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎭 The Nova Comedy Collective</h1>
          <p className="subtitle">Eventbrite Analytics Dashboard</p>
          
          {organizations.length > 1 && (
            <div className="org-selector">
              <label htmlFor="org-select">Organization:</label>
              <select 
                id="org-select"
                value={selectedOrgId || ''} 
                onChange={(e) => handleOrgChange(e.target.value)}
                className="org-dropdown"
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <nav className="nav-tabs">
          <button 
            className={activeView === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeView === 'customers' ? 'active' : ''}
            onClick={() => setActiveView('customers')}
          >
            Customers
          </button>
          <button 
            className={activeView === 'performance' ? 'active' : ''}
            onClick={() => setActiveView('performance')}
          >
            Performance
          </button>
          <button 
            className={activeView === 'events' ? 'active' : ''}
            onClick={() => setActiveView('events')}
          >
            Events
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeView === 'dashboard' && insights && (
          <Dashboard insights={insights} />
        )}
        
        {activeView === 'customers' && insights && (
          <CustomerInsights insights={insights} />
        )}
        
        {activeView === 'performance' && (
          <EventPerformance orgId={selectedOrgId} />
        )}
        
        {activeView === 'events' && (
          <EventList 
            events={events} 
            onEventSelect={handleEventSelect}
          />
        )}
        
        {activeView === 'event-details' && selectedEvent && (
          <EventDetails 
            event={selectedEvent}
            onBack={() => setActiveView('events')}
          />
        )}
      </main>
    </div>
  );
}

export default App;

