import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { predictNextMonths, analyzeBestDays, analyzeSeasonality } from '../utils/predictions';
import './Predictions.css';

function Predictions({ insights, events }) {
  const { monthly_trends = [] } = insights;

  const forecast = useMemo(() => {
    return predictNextMonths(monthly_trends, 3);
  }, [monthly_trends]);

  const bestDays = useMemo(() => {
    return analyzeBestDays(events);
  }, [events]);

  const seasonality = useMemo(() => {
    return analyzeSeasonality(monthly_trends);
  }, [monthly_trends]);

  // Combine historical and predicted data
  const combinedData = useMemo(() => {
    const historical = monthly_trends.map(item => ({
      ...item,
      monthLabel: item.monthLabel || item.month,
      type: 'historical'
    }));
    
    const predicted = forecast.predictions.map(item => ({
      ...item,
      type: 'predicted'
    }));
    
    return [...historical.slice(-6), ...predicted]; // Last 6 months + predictions
  }, [monthly_trends, forecast]);

  const getTrendEmoji = (trend) => {
    switch(trend) {
      case 'growing': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  return (
    <div className="predictions">
      <h2 className="section-title">Predictive Analytics & Insights</h2>
      
      <div className="prediction-cards-grid">
        <div className="prediction-card">
          <h3>Attendance Trend</h3>
          <div className="trend-indicator">
            <span className="trend-emoji">{getTrendEmoji(forecast.attendeeTrend)}</span>
            <span className="trend-label">{forecast.attendeeTrend}</span>
          </div>
          <p className="trend-detail">
            {forecast.avgGrowthRate > 0 ? '+' : ''}
            {forecast.avgGrowthRate.toFixed(1)} attendees/month avg change
          </p>
        </div>
        
        <div className="prediction-card">
          <h3>Revenue Trend</h3>
          <div className="trend-indicator">
            <span className="trend-emoji">{getTrendEmoji(forecast.revenueTrend)}</span>
            <span className="trend-label">{forecast.revenueTrend}</span>
          </div>
        </div>
      </div>

      <div className="forecast-chart-card">
        <h3>3-Month Attendance Forecast</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData}>
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
              dataKey="attendees" 
              stroke="#ff1493" 
              strokeWidth={3}
              name="Attendees"
              strokeDasharray={(entry) => entry.type === 'predicted' ? '5 5' : '0'}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="chart-note">Dashed line indicates predicted values</p>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <h3>Best Days for Events</h3>
          <div className="best-days-list">
            {bestDays.slice(0, 5).map((day, index) => (
              <div key={day.name} className="day-item">
                <span className="day-rank">
                  {index + 1 === 1 && '🥇'}
                  {index + 1 === 2 && '🥈'}
                  {index + 1 === 3 && '🥉'}
                  {index + 1 > 3 && `#${index + 1}`}
                </span>
                <span className="day-name">{day.name}</span>
                <span className="day-avg">{day.avgAttendees} avg attendees</span>
                <span className="day-count">({day.count} events)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h3>Seasonal Performance</h3>
          <div className="seasonal-bars">
            {seasonality.insights.map((season) => (
              <div key={season.season} className="season-bar">
                <div className="season-label">{season.season}</div>
                <div className="season-value-bar">
                  <div 
                    className="season-fill"
                    style={{ 
                      width: `${(season.avgAttendees / seasonality.insights[0].avgAttendees) * 100}%` 
                    }}
                  />
                </div>
                <div className="season-stats">
                  <span>{season.avgAttendees} attendees</span>
                  <span className="revenue-stat">${season.avgRevenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Predictions;

