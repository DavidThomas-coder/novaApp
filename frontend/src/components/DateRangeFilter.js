import React, { useState } from 'react';
import './DateRangeFilter.css';

function DateRangeFilter({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preset, setPreset] = useState('all');

  const handlePresetChange = (presetValue) => {
    setPreset(presetValue);
    
    const now = new Date();
    let start = null;
    let end = now;
    
    switch(presetValue) {
      case 'last30':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'last90':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        break;
      case 'last6months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'last12months':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'ytd':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        start = null;
        end = null;
        break;
    }
    
    const startStr = start ? start.toISOString().split('T')[0] : '';
    const endStr = end ? end.toISOString().split('T')[0] : '';
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeChange(startStr, endStr);
  };

  const handleCustomDateChange = () => {
    setPreset('custom');
    onDateRangeChange(startDate, endDate);
  };

  return (
    <div className="date-range-filter">
      <label>Date Range:</label>
      
      <select 
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value)}
        className="preset-dropdown"
      >
        <option value="all">All Time</option>
        <option value="last30">Last 30 Days</option>
        <option value="last90">Last 90 Days</option>
        <option value="last6months">Last 6 Months</option>
        <option value="last12months">Last 12 Months</option>
        <option value="ytd">Year to Date</option>
        <option value="custom">Custom Range</option>
      </select>
      
      {preset === 'custom' && (
        <div className="custom-date-inputs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
          <button 
            onClick={handleCustomDateChange}
            className="apply-button"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export default DateRangeFilter;

