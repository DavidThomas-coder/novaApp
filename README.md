# Nova Analytics Dashboard

A dashboard for The Nova Comedy Collective that pulls data from Eventbrite to track ticket sales, revenue, and customer behavior. Built with React and Flask.

## Features

- Track revenue, attendance, and customer metrics
- See which shows perform best
- Identify repeat customers and super fans
- Export data to CSV for reports
- Weekly sales reports
- Capacity utilization tracking
- Predictive analytics and forecasting

## Tech Stack

- React frontend with Recharts for visualizations
- Flask backend (Python)
- Eventbrite API for data
- Custom CSS (space-themed: black, neon pink, neon green)

## Setup

**Requirements:** Python 3.8+, Node.js 16+, Eventbrite API token

### Quick Start

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export EVENTBRITE_TOKEN=your_token_here
python app.py
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

Dashboard runs at http://localhost:3000

## Dashboard Structure

**4 Main Tabs:**
1. **Overview** - Key metrics, charts, and predictions all in one place
2. **Customers** - Retention analysis, top customers, event history per customer
3. **Events** - Event browser with weekly report toggle
4. **Performance** - Advanced analytics (opt-in to avoid API limits)

## Notes

- Filters to only show Nova Comedy Collective events
- Draft events are excluded from all analytics
- Future months shown with faded colors on charts
- Performance tab loads on-demand to avoid API rate limits
- Data cached for 5 minutes to speed up navigation
- Weekly report accessible from Events tab


## Known Issues

- Initial load takes 1-2 minutes (analyzing all prior events)
- Performance tab requires manual load to avoid API rate limits
- Clear browser cache if you don't see new features

## Future Plans

- HubSpot CRM integration
- Cost tracking for net profit calculations
- Automated weekly email reports

