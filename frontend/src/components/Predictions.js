import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { predictNextMonths, analyzeBestDays, analyzeSeasonality } from '../utils/predictions';
import './Predictions.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function Predictions({ insights, events, orgId }) {
  const { monthly_trends = [] } = insights;
  const [performanceData, setPerformanceData] = useState([]);
  const [loadingPerf, setLoadingPerf] = useState(false);

  // Don't auto-load performance data - it uses too many API calls
  // Instead, calculate best days from events list with basic attendance estimates
  useEffect(() => {
    // Use events data we already have
    if (events && events.length > 0) {
      // The events don't have attendee counts, so we'll just show event frequency by day
      setPerformanceData(events);
    }
  }, [events]);

  const forecast = useMemo(() => {
    return predictNextMonths(monthly_trends, 3);
  }, [monthly_trends]);

  const bestDays = useMemo(() => {
    // Use events data to show frequency by day
    const daysAnalysis = analyzeBestDays(performanceData.length > 0 ? performanceData : events);
    return daysAnalysis.filter(day => day.count > 0); // Only show days with events
  }, [performanceData, events]);

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
      <p className="tab-description">
        Data-driven predictions and patterns to help you plan future events. See forecasted attendance, 
        discover the best days to schedule shows, and understand seasonal trends.
      </p>
      
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
          <h3>Most Popular Days for Shows</h3>
          <p className="insight-subtitle">Based on event frequency</p>
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
                <span className="day-count">{day.count} events scheduled</span>
                {day.avgAttendees > 0 && (
                  <span className="day-avg">{day.avgAttendees} avg attendees</span>
                )}
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

