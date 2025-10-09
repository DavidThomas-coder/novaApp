/**
 * Simple predictive analytics and forecasting utilities
 */

// Linear regression for trend prediction
const linearRegression = (data) => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  data.forEach((point, index) => {
    sumX += index;
    sumY += point.value;
    sumXY += index * point.value;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// Predict next N months
export const predictNextMonths = (monthlyTrends, monthsAhead = 3) => {
  if (!monthlyTrends || monthlyTrends.length < 3) {
    return { predictions: [], trend: 'insufficient_data' };
  }

  // Prepare data for regression
  const attendeeData = monthlyTrends.map((item, index) => ({
    value: item.attendees || 0
  }));

  const revenueData = monthlyTrends.map((item, index) => ({
    value: item.revenue || 0
  }));

  // Calculate trends
  const attendeeRegression = linearRegression(attendeeData);
  const revenueRegression = linearRegression(revenueData);

  // Determine trend direction
  const attendeeTrend = attendeeRegression.slope > 5 ? 'growing' : 
                        attendeeRegression.slope < -5 ? 'declining' : 'stable';
  const revenueTrend = revenueRegression.slope > 50 ? 'growing' : 
                       revenueRegression.slope < -50 ? 'declining' : 'stable';

  // Generate predictions for next months
  const predictions = [];
  const lastMonth = monthlyTrends[monthlyTrends.length - 1].month;
  const [year, month] = lastMonth.split('-').map(Number);

  for (let i = 1; i <= monthsAhead; i++) {
    const nextIndex = monthlyTrends.length + i - 1;
    
    const predictedAttendees = Math.max(0, Math.round(
      attendeeRegression.slope * nextIndex + attendeeRegression.intercept
    ));
    
    const predictedRevenue = Math.max(0, Math.round(
      revenueRegression.slope * nextIndex + revenueRegression.intercept
    ));

    // Calculate next month
    let nextMonth = month + i;
    let nextYear = year;
    while (nextMonth > 12) {
      nextMonth -= 12;
      nextYear++;
    }

    const monthKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    const monthName = new Date(nextYear, nextMonth - 1).toLocaleString('en-US', { month: 'short' });
    
    predictions.push({
      month: monthKey,
      monthLabel: `${monthName} '${String(nextYear).slice(-2)}`,
      attendees: predictedAttendees,
      revenue: predictedRevenue
    });
  }

  return {
    predictions,
    attendeeTrend,
    revenueTrend,
    avgGrowthRate: attendeeRegression.slope
  };
};

// Calculate best performing day of week
export const analyzeBestDays = (events) => {
  if (!events || events.length === 0) return [];

  const dayStats = {
    0: { name: 'Sunday', count: 0, totalAttendees: 0 },
    1: { name: 'Monday', count: 0, totalAttendees: 0 },
    2: { name: 'Tuesday', count: 0, totalAttendees: 0 },
    3: { name: 'Wednesday', count: 0, totalAttendees: 0 },
    4: { name: 'Thursday', count: 0, totalAttendees: 0 },
    5: { name: 'Friday', count: 0, totalAttendees: 0 },
    6: { name: 'Saturday', count: 0, totalAttendees: 0 }
  };

  events.forEach(event => {
    if (event.start && event.attendees !== undefined) {
      const date = new Date(event.start);
      const day = date.getDay();
      dayStats[day].count++;
      dayStats[day].totalAttendees += event.attendees;
    }
  });

  // Calculate averages and sort
  const dayAnalysis = Object.values(dayStats)
    .map(day => ({
      ...day,
      avgAttendees: day.count > 0 ? Math.round(day.totalAttendees / day.count) : 0
    }))
    .sort((a, b) => b.avgAttendees - a.avgAttendees);

  return dayAnalysis;
};

// Calculate seasonal patterns
export const analyzeSeasonality = (monthlyTrends) => {
  if (!monthlyTrends || monthlyTrends.length < 4) {
    return { pattern: 'insufficient_data', insights: [] };
  }

  const seasonalData = {
    'Winter': { months: [12, 1, 2], attendees: 0, revenue: 0, count: 0 },
    'Spring': { months: [3, 4, 5], attendees: 0, revenue: 0, count: 0 },
    'Summer': { months: [6, 7, 8], attendees: 0, revenue: 0, count: 0 },
    'Fall': { months: [9, 10, 11], attendees: 0, revenue: 0, count: 0 }
  };

  monthlyTrends.forEach(item => {
    const [, monthStr] = item.month.split('-');
    const month = parseInt(monthStr);
    
    for (const [season, data] of Object.entries(seasonalData)) {
      if (data.months.includes(month)) {
        data.attendees += item.attendees || 0;
        data.revenue += item.revenue || 0;
        data.count++;
      }
    }
  });

  const insights = Object.entries(seasonalData)
    .map(([season, data]) => ({
      season,
      avgAttendees: data.count > 0 ? Math.round(data.attendees / data.count) : 0,
      avgRevenue: data.count > 0 ? Math.round(data.revenue / data.count) : 0
    }))
    .sort((a, b) => b.avgAttendees - a.avgAttendees);

  return { pattern: 'analyzed', insights };
};

