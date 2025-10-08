# Quick Setup Guide

## Environment Variables Setup

### Backend Environment Variables

Create a file `backend/.env` with the following content:

```
EVENTBRITE_TOKEN=your_eventbrite_api_token_here
```

Get your Eventbrite API token from: https://www.eventbrite.com/platform/api

### Frontend Environment Variables (Optional)

Create a file `frontend/.env` with the following content:

```
REACT_APP_API_URL=http://localhost:5000
```

This is optional as the frontend defaults to `http://localhost:5000` if not set.

## Quick Start

### Option 1: Using the start script

```bash
./start.sh
```

### Option 2: Manual start

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export EVENTBRITE_TOKEN=your_token_here
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

## Access the Dashboard

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Token Permissions

Your Eventbrite token needs the following permissions:
- Read organization data
- Read event data
- Read attendee data

Make sure these are enabled when creating your private token in Eventbrite.

