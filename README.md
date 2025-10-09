# Nova Analytics Dashboard

Full-stack analytics dashboard built with React and Flask that integrates with the Eventbrite API to track ticket sales, attendee demographics, and event performance metrics for The Nova Comedy Collective. Provides real-time visualization of key performance indicators including attendance trends, customer retention rates, and revenue analytics to support data-driven decision-making.

## Key Features

### 💰 Revenue Analytics
- **Total Revenue Tracking**: Comprehensive revenue analytics across all events
- **Revenue Trends**: Monthly revenue charts with filtering by show
- **Per-Event Metrics**: Average revenue per event and per ticket
- **Ticket Type Revenue**: Revenue breakdown by ticket category
- **Export Capabilities**: CSV export of all revenue data

### 👥 Customer Intelligence
- **Retention Analysis**: Track new vs. returning customer rates
- **Lifetime Value**: Calculate average customer lifetime value
- **Top Customers**: Identify most engaged customers with purchase history
- **Customer Export**: Download customer lists for email campaigns

### 📊 Event Performance
- **Performance Rankings**: Sort events by revenue, attendance, or engagement
- **Sell-Through Rates**: Track capacity utilization for each event
- **Check-In Analytics**: Monitor actual attendance vs. ticket sales
- **Comparative Metrics**: Compare performance across all shows

### 🔮 Predictive Analytics
- **Attendance Forecasting**: 3-month ahead predictions using linear regression
- **Trend Analysis**: Identify growing, declining, or stable patterns
- **Best Days Analysis**: Discover which days of the week perform best
- **Seasonal Insights**: Understand seasonal performance patterns

### 🎯 Interactive Filtering & Search
- **Date Range Filters**: Last 30/90 days, 6/12 months, YTD, custom ranges
- **Event Search**: Real-time search across all events
- **Status Filters**: Filter by live, completed, draft, or canceled
- **Sort Options**: Sort by date, name, revenue, or attendance
- **Show-Specific Views**: Filter all analytics by specific show

### 💾 Data Export
- **CSV Export**: Export monthly trends, customers, events, and attendees
- **Flexible Formats**: All exports include proper headers and formatting
- **Contextual Naming**: Auto-generated filenames based on content

### 📱 Performance & UX
- **Caching System**: 5-minute localStorage cache for instant load times
- **Mobile Optimized**: Fully responsive design for all screen sizes
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Graceful error states with retry functionality

## Technologies

- **Frontend**: React 18, Recharts, Axios
- **Backend**: Flask (Python), RESTful API architecture
- **External APIs**: Eventbrite API v3
- **Styling**: Custom CSS with responsive design
- **Version Control**: Git/GitHub

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Eventbrite API Token

### Getting Your Eventbrite API Token

1. Go to https://www.eventbrite.com/platform/api
2. Sign in with your Eventbrite account
3. Navigate to Account Settings → API Keys
4. Create a new private token or use an existing one
5. Copy the token for use in the setup

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp ../.env.example .env
   ```
   Edit `.env` and add your Eventbrite API token:
   ```
   EVENTBRITE_TOKEN=your_actual_token_here
   ```

5. **Run the Flask server**:
   ```bash
   export EVENTBRITE_TOKEN=your_actual_token_here
   python app.py
   ```

   The API will be available at `http://localhost:5001`

### Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The dashboard will open at `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/organizations` - Fetch all organizations the user has access to
- `GET /api/events?org_id=<org_id>` - Fetch all events (optional org_id parameter)
- `GET /api/event/<event_id>/attendees` - Fetch attendees for a specific event
- `GET /api/insights?org_id=<org_id>` - Get comprehensive analytics insights (optional org_id parameter)

### Multi-Organization Support

If your Eventbrite API token has access to multiple organizations:
- All organizations will be fetched on initial load
- A dropdown selector will appear in the header (only if you have 2+ organizations)
- Switching organizations will automatically reload all data for that organization
- The dashboard resets to the main view when switching organizations

## Dashboard Views

### 📊 Dashboard Tab
- **8 Key Metrics Cards**: Events, attendees, customers, repeat rate, revenue, and averages
- **Monthly Trends Charts**: Interactive line and bar charts with event filtering
- **Revenue by Month**: Track financial performance over time
- **Ticket Distribution**: Top 5 ticket types in pie chart
- **Date Range Filters**: Analyze specific time periods
- **Export Data**: Download monthly trends to CSV

### 👥 Customers Tab
- **Customer Metrics**: New customers, returning customers, retention rates
- **Lifetime Value**: Average customer value calculation
- **Top 10 Leaderboard**: Most engaged customers with medal rankings
- **Engagement Tracking**: Events attended and total spend per customer
- **Export Customers**: Download customer data for outreach

### 🏆 Performance Tab
- **Event Rankings**: Sortable table of all events by multiple metrics
- **Revenue Leaders**: Identify highest-grossing shows
- **Attendance Leaders**: See most popular events
- **Sell-Through Rates**: Capacity utilization for each event
- **Check-In Rates**: Actual attendance vs. tickets sold
- **Top 10/20/50 Views**: Focus on top performers

### 🔮 Insights Tab (Predictive Analytics)
- **3-Month Forecast**: Attendance predictions using linear regression
- **Trend Indicators**: Growing, declining, or stable patterns
- **Best Days Analysis**: Optimal days of week for scheduling
- **Seasonal Patterns**: Winter/Spring/Summer/Fall performance comparison
- **Growth Rates**: Month-over-month change calculations

### 📅 Events Tab
- **Complete Event Listing**: All 179+ events with full details
- **Advanced Search**: Real-time search by event name
- **Status Filters**: Filter by live, completed, draft, canceled
- **Sort Options**: By date (newest/oldest) or name (A-Z/Z-A)
- **Quick Details**: Click any event for full attendee breakdown
- **Export Events**: Download filtered event lists

### 🎫 Event Details View
- **Attendee Table**: Searchable list of all ticket holders
- **Ticket Breakdown**: Distribution by ticket type
- **Check-In Status**: Track who actually attended
- **Export Attendees**: Download attendee data per event

## Project Structure

```
novaApp/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js      # Main dashboard view
│   │   │   ├── Dashboard.css
│   │   │   ├── EventList.js      # Events list view
│   │   │   ├── EventList.css
│   │   │   ├── EventDetails.js   # Event detail view
│   │   │   └── EventDetails.css
│   │   ├── App.js          # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .env.example            # Environment variables template
├── .gitignore
└── README.md
```

## Deployment

### Backend Deployment

The backend can be deployed to any platform that supports Python Flask applications:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

Make sure to set the `EVENTBRITE_TOKEN` environment variable in your deployment platform.

### Frontend Deployment

1. Build the production version:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `build` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. Set the `REACT_APP_API_URL` environment variable to point to your deployed backend API.

## Troubleshooting

### Backend Issues

- **"Failed to fetch organization"**: Verify your Eventbrite token is valid and has the necessary permissions
- **CORS errors**: Ensure the backend is running and CORS is properly configured

### Frontend Issues

- **Blank dashboard**: Check that the backend API is running at the correct URL
- **API connection errors**: Verify the `REACT_APP_API_URL` environment variable is set correctly

## Future Enhancements

- Export data to CSV/Excel
- Email campaign integration
- Customer segmentation analysis
- Revenue analytics
- Historical trend comparisons
- Automated reporting

## License

This project is private and proprietary to The Nova Comedy Collective.

## Support

For questions or issues, contact the development team.

