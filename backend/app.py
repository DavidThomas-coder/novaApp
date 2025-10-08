from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Eventbrite API configuration
EVENTBRITE_API_BASE = "https://www.eventbriteapi.com/v3"
EVENTBRITE_TOKEN = os.environ.get('EVENTBRITE_TOKEN', '')

def get_headers():
    return {
        'Authorization': f'Bearer {EVENTBRITE_TOKEN}',
        'Content-Type': 'application/json'
    }

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Nova Comedy Collective Dashboard API'})

@app.route('/api/organizations', methods=['GET'])
def get_organizations():
    """Fetch all organizations the user has access to"""
    try:
        org_response = requests.get(
            f"{EVENTBRITE_API_BASE}/users/me/organizations/",
            headers=get_headers()
        )
        
        if org_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch organizations'}), 500
        
        organizations = org_response.json().get('organizations', [])
        
        # Format organizations
        formatted_orgs = []
        for org in organizations:
            formatted_orgs.append({
                'id': org['id'],
                'name': org['name'],
                'image_id': org.get('image_id', None)
            })
        
        return jsonify({'organizations': formatted_orgs})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Fetch all events for the organization"""
    try:
        # Get organization ID from query parameter or use first organization
        org_id = request.args.get('org_id')
        
        if not org_id:
            org_response = requests.get(
                f"{EVENTBRITE_API_BASE}/users/me/organizations/",
                headers=get_headers()
            )
            
            if org_response.status_code != 200:
                return jsonify({'error': 'Failed to fetch organization'}), 500
            
            organizations = org_response.json().get('organizations', [])
            if not organizations:
                return jsonify({'error': 'No organization found'}), 404
            
            org_id = organizations[0]['id']
        
        # Get all events for the organization
        events_response = requests.get(
            f"{EVENTBRITE_API_BASE}/organizations/{org_id}/events/",
            headers=get_headers(),
            params={'status': 'all', 'order_by': 'start_desc'}
        )
        
        if events_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch events'}), 500
        
        events_data = events_response.json()
        events = events_data.get('events', [])
        
        # Format events
        formatted_events = []
        for event in events:
            formatted_events.append({
                'id': event['id'],
                'name': event['name']['text'],
                'start': event['start']['local'],
                'end': event['end']['local'],
                'status': event['status'],
                'url': event['url'],
                'capacity': event.get('capacity', 0),
                'is_free': event.get('is_free', False)
            })
        
        return jsonify({'events': formatted_events})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/event/<event_id>/attendees', methods=['GET'])
def get_event_attendees(event_id):
    """Fetch attendees for a specific event"""
    try:
        attendees_response = requests.get(
            f"{EVENTBRITE_API_BASE}/events/{event_id}/attendees/",
            headers=get_headers(),
            params={'status': 'attending'}
        )
        
        if attendees_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch attendees'}), 500
        
        attendees_data = attendees_response.json()
        attendees = attendees_data.get('attendees', [])
        
        # Format attendees
        formatted_attendees = []
        for attendee in attendees:
            profile = attendee.get('profile', {})
            formatted_attendees.append({
                'id': attendee['id'],
                'first_name': profile.get('first_name', ''),
                'last_name': profile.get('last_name', ''),
                'email': profile.get('email', ''),
                'created': attendee.get('created', ''),
                'status': attendee.get('status', ''),
                'ticket_class_name': attendee.get('ticket_class_name', ''),
                'quantity': attendee.get('quantity', 1)
            })
        
        return jsonify({'attendees': formatted_attendees})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights', methods=['GET'])
def get_insights():
    """Get comprehensive insights across all events"""
    try:
        # Get organization ID from query parameter or use first organization
        org_id = request.args.get('org_id')
        
        if not org_id:
            org_response = requests.get(
                f"{EVENTBRITE_API_BASE}/users/me/organizations/",
                headers=get_headers()
            )
            
            if org_response.status_code != 200:
                return jsonify({'error': 'Failed to fetch organization'}), 500
            
            organizations = org_response.json().get('organizations', [])
            if not organizations:
                return jsonify({'error': 'No organization found'}), 404
            
            org_id = organizations[0]['id']
        
        # Get all events
        events_response = requests.get(
            f"{EVENTBRITE_API_BASE}/organizations/{org_id}/events/",
            headers=get_headers(),
            params={'status': 'all', 'order_by': 'start_desc'}
        )
        
        if events_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch events'}), 500
        
        events = events_response.json().get('events', [])
        
        # Aggregate insights
        total_events = len(events)
        total_attendees = 0
        events_by_month = defaultdict(int)
        attendees_by_month = defaultdict(int)
        ticket_types = defaultdict(int)
        unique_emails = set()
        repeat_customers = defaultdict(int)
        
        for event in events:
            event_id = event['id']
            
            # Get attendees for each event
            attendees_response = requests.get(
                f"{EVENTBRITE_API_BASE}/events/{event_id}/attendees/",
                headers=get_headers(),
                params={'status': 'attending'}
            )
            
            if attendees_response.status_code == 200:
                attendees = attendees_response.json().get('attendees', [])
                event_attendee_count = len(attendees)
                total_attendees += event_attendee_count
                
                # Parse event date
                event_start = event['start']['local']
                event_date = datetime.fromisoformat(event_start.replace('Z', '+00:00'))
                month_key = event_date.strftime('%Y-%m')
                
                events_by_month[month_key] += 1
                attendees_by_month[month_key] += event_attendee_count
                
                # Process attendees
                for attendee in attendees:
                    profile = attendee.get('profile', {})
                    email = profile.get('email', '')
                    
                    if email:
                        repeat_customers[email] += 1
                        unique_emails.add(email)
                    
                    ticket_class = attendee.get('ticket_class_name', 'Unknown')
                    ticket_types[ticket_class] += 1
        
        # Calculate repeat customer percentage
        repeat_customer_count = sum(1 for count in repeat_customers.values() if count > 1)
        repeat_customer_rate = (repeat_customer_count / len(unique_emails) * 100) if unique_emails else 0
        
        # Format monthly data for charts
        monthly_data = []
        for month in sorted(events_by_month.keys()):
            monthly_data.append({
                'month': month,
                'events': events_by_month[month],
                'attendees': attendees_by_month[month]
            })
        
        # Format ticket type data
        ticket_data = [{'type': k, 'count': v} for k, v in ticket_types.items()]
        
        insights = {
            'total_events': total_events,
            'total_attendees': total_attendees,
            'unique_customers': len(unique_emails),
            'repeat_customers': repeat_customer_count,
            'repeat_customer_rate': round(repeat_customer_rate, 2),
            'avg_attendees_per_event': round(total_attendees / total_events, 2) if total_events > 0 else 0,
            'monthly_trends': monthly_data,
            'ticket_types': ticket_data
        }
        
        return jsonify(insights)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not EVENTBRITE_TOKEN:
        print("Warning: EVENTBRITE_TOKEN environment variable not set!")
    app.run(debug=True, port=8080, use_reloader=False)

