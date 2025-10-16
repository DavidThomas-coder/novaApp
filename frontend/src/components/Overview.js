import React from 'react';
import Dashboard from './Dashboard';
import Predictions from './Predictions';
import './Overview.css';

function Overview({ insights, events, orgId }) {
  return (
    <div className="overview">
      <Dashboard insights={insights} orgId={orgId} />
      <div className="overview-divider">
        <h2 className="divider-title">🔮 Predictive Insights</h2>
      </div>
      <Predictions insights={insights} events={events} orgId={orgId} />
    </div>
  );
}

export default Overview;

