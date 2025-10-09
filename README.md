# Nova Analytics Dashboard

Full-stack analytics dashboard built with React and Flask that integrates with the Eventbrite API to track ticket sales, attendee demographics, and event performance metrics for The Nova Comedy Collective. Provides real-time visualization of key performance indicators including attendance trends, customer retention rates, and revenue analytics to support data-driven decision-making.

## Key Features

### Data Analytics & Visualization
- **Real-time Metrics**: Track total events, attendees, unique customers, and repeat customer rates
- **Interactive Charts**: Line charts, bar charts, and pie charts powered by Recharts
- **Event Filtering**: Filter monthly trends by specific show or view aggregate data
- **Date Range Analysis**: Automated monthly trend aggregation with custom date formatting

### Event Management
- **Organization Filtering**: Automatic filtering to Nova Comedy Collective organization
- **Event Browser**: Browse all events with status badges and metadata
- **Attendee Management**: Complete attendee lists with search functionality and export capabilities
- **Pagination Support**: Efficiently handles 100+ events via Eventbrite API pagination

### Technical Features
- **RESTful API**: Clean separation between frontend and backend
- **Error Handling**: Comprehensive error states and user feedback
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Performance Optimized**: Efficient data fetching and caching strategies

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

### Dashboard Tab
- Total events count
- Total attendees across all events
- Unique customer count
- Repeat customer statistics
- Average attendees per event
- Monthly trends (line and bar charts)
- Ticket type distribution (pie chart)

### Events Tab
- List of all events with status badges
- Event dates and capacity information
- Click any event to view detailed attendee information

### Event Details View
- Complete attendee list with search functionality
- Ticket type breakdown
- Exportable attendee data

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

