from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
import time
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

def make_api_request(url, params=None, max_retries=3):
    """Make API request with rate limit handling"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=get_headers(), params=params)
            
            if response.status_code == 429:
                # Rate limited - wait and retry
                wait_time = min(2 ** attempt, 10)  # Exponential backoff, max 10 seconds
                print(f"Rate limited, waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                continue
            
            return response
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(1)
    
    return None

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
        
        # Filter to only The Nova Comedy Collective
        formatted_orgs = []
        for org in organizations:
            if 'Nova Comedy Collective' in org['name']:
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
        
        # Get all events for the organization with pagination
        all_events = []
        continuation = None
        
        while True:
            params = {'status': 'all', 'order_by': 'start_desc'}
            if continuation:
                params['continuation'] = continuation
            
            events_response = requests.get(
                f"{EVENTBRITE_API_BASE}/organizations/{org_id}/events/",
                headers=get_headers(),
                params=params
            )
            
            if events_response.status_code != 200:
                return jsonify({'error': 'Failed to fetch events'}), 500
            
            events_data = events_response.json()
            page_events = events_data.get('events', [])
            all_events.extend(page_events)
            
            # Check if there are more pages
            pagination = events_data.get('pagination', {})
            if not pagination.get('has_more_items', False):
                break
            
            continuation = pagination.get('continuation')
            if not continuation:
                break
        
        events = all_events
        
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
                'quantity': attendee.get('quantity', 1),
                'checked_in': attendee.get('checked_in', False)
            })
        
        return jsonify({'attendees': formatted_attendees})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/event-performance', methods=['GET'])
def get_event_performance():
    """Get event performance rankings"""
    try:
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
        
        # Get all events with pagination
        all_events = []
        continuation = None
        
        while True:
            params = {'status': 'all', 'order_by': 'start_desc'}
            if continuation:
                params['continuation'] = continuation
            
            events_response = requests.get(
                f"{EVENTBRITE_API_BASE}/organizations/{org_id}/events/",
                headers=get_headers(),
                params=params
            )
            
            if events_response.status_code != 200:
                return jsonify({'error': 'Failed to fetch events'}), 500
            
            events_data = events_response.json()
            page_events = events_data.get('events', [])
            all_events.extend(page_events)
            
            pagination = events_data.get('pagination', {})
            if not pagination.get('has_more_items', False):
                break
            
            continuation = pagination.get('continuation')
            if not continuation:
                break
        
        # Calculate performance metrics for each event
        event_performance = []
        
        for event in all_events:
            event_id = event['id']
            event_name = event['name']['text']
            capacity = event.get('capacity', 0)
            status = event.get('status', '')
            
            # Get attendees
            attendees_response = requests.get(
                f"{EVENTBRITE_API_BASE}/events/{event_id}/attendees/",
                headers=get_headers(),
                params={'status': 'attending'}
            )
            
            if attendees_response.status_code == 200:
                attendees = attendees_response.json().get('attendees', [])
                attendee_count = len(attendees)
                checked_in_count = sum(1 for a in attendees if a.get('checked_in', False))
                
                # Calculate revenue
                total_event_revenue = 0
                for attendee in attendees:
                    costs = attendee.get('costs', {})
                    gross = costs.get('gross', {})
                    revenue_cents = gross.get('value', 0)
                    total_event_revenue += revenue_cents / 100.0
                
                # Calculate sell-through rate
                sell_through_rate = (attendee_count / capacity * 100) if capacity > 0 else 0
                check_in_rate = (checked_in_count / attendee_count * 100) if attendee_count > 0 else 0
                
                event_performance.append({
                    'id': event_id,
                    'name': event_name,
                    'status': status,
                    'capacity': capacity,
                    'attendees': attendee_count,
                    'checked_in': checked_in_count,
                    'revenue': round(total_event_revenue, 2),
                    'sell_through_rate': round(sell_through_rate, 2),
                    'check_in_rate': round(check_in_rate, 2),
                    'avg_ticket_price': round(total_event_revenue / attendee_count, 2) if attendee_count > 0 else 0
                })
        
        # Sort by revenue for rankings
        event_performance.sort(key=lambda x: x['revenue'], reverse=True)
        
        return jsonify({'events': event_performance})
    
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
        
        # Get all events with pagination
        all_events = []
        continuation = None
        
        while True:
            params = {'status': 'all', 'order_by': 'start_desc'}
            if continuation:
                params['continuation'] = continuation
            
            events_response = requests.get(
                f"{EVENTBRITE_API_BASE}/organizations/{org_id}/events/",
                headers=get_headers(),
                params=params
            )
            
            if events_response.status_code != 200:
                return jsonify({'error': 'Failed to fetch events'}), 500
            
            events_data = events_response.json()
            page_events = events_data.get('events', [])
            all_events.extend(page_events)
            
            # Check if there are more pages
            pagination = events_data.get('pagination', {})
            if not pagination.get('has_more_items', False):
                break
            
            continuation = pagination.get('continuation')
            if not continuation:
                break
        
        events = all_events
        
        # Aggregate insights
        total_events = len(events)
        total_attendees = 0
        total_revenue = 0
        events_by_month = defaultdict(int)
        attendees_by_month = defaultdict(int)
        revenue_by_month = defaultdict(float)
        ticket_types = defaultdict(int)
        ticket_revenue = defaultdict(float)
        unique_emails = set()
        repeat_customers = defaultdict(int)
        customer_revenue = defaultdict(float)  # email -> total revenue
        customer_event_dates = defaultdict(list)  # email -> list of event dates
        events_list = []  # List of events with monthly data for filtering
        events_by_month_by_event = defaultdict(lambda: defaultdict(int))  # event_name -> month -> event count
        attendees_by_month_by_event = defaultdict(lambda: defaultdict(int))  # event_name -> month -> attendee count
        
        for event in events:
            event_id = event['id']
            event_name = event['name']['text']
            
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
                
                # Track per-event data for filtering
                events_by_month_by_event[event_name][month_key] += 1
                attendees_by_month_by_event[event_name][month_key] += event_attendee_count
                if event_name not in [e['name'] for e in events_list]:
                    events_list.append({'id': event_id, 'name': event_name})
                
                # Process attendees
                for attendee in attendees:
                    profile = attendee.get('profile', {})
                    email = profile.get('email', '')
                    
                    if email:
                        repeat_customers[email] += 1
                        unique_emails.add(email)
                        customer_event_dates[email].append(month_key)
                    
                    ticket_class = attendee.get('ticket_class_name', 'Unknown')
                    ticket_types[ticket_class] += 1
                    
                    # Track revenue
                    costs = attendee.get('costs', {})
                    gross = costs.get('gross', {})
                    revenue_cents = gross.get('value', 0)
                    revenue_dollars = revenue_cents / 100.0
                    
                    total_revenue += revenue_dollars
                    revenue_by_month[month_key] += revenue_dollars
                    ticket_revenue[ticket_class] += revenue_dollars
                    
                    if email:
                        customer_revenue[email] += revenue_dollars
        
        # Calculate repeat customer percentage
        repeat_customer_count = sum(1 for count in repeat_customers.values() if count > 1)
        repeat_customer_rate = (repeat_customer_count / len(unique_emails) * 100) if unique_emails else 0
        new_customer_count = len(unique_emails) - repeat_customer_count
        
        # Calculate customer lifetime value
        avg_customer_lifetime_value = (total_revenue / len(unique_emails)) if unique_emails else 0
        
        # Find top customers by event attendance
        top_customers = sorted(repeat_customers.items(), key=lambda x: x[1], reverse=True)[:10]
        top_customers_data = []
        for email, event_count in top_customers:
            top_customers_data.append({
                'email': email,
                'events_attended': event_count,
                'lifetime_value': round(customer_revenue.get(email, 0), 2)
            })
        
        # Format monthly data for charts
        monthly_data = []
        for month in sorted(events_by_month.keys()):
            monthly_data.append({
                'month': month,
                'events': events_by_month[month],
                'attendees': attendees_by_month[month],
                'revenue': round(revenue_by_month[month], 2)
            })
        
        # Format ticket type data with revenue
        ticket_data = []
        for ticket_type, count in ticket_types.items():
            ticket_data.append({
                'type': ticket_type,
                'count': count,
                'revenue': round(ticket_revenue[ticket_type], 2)
            })
        
        # Format event-specific monthly data for filtering
        events_monthly_data = {}
        for event_name in events_by_month_by_event.keys():
            event_monthly = []
            all_months = set(events_by_month_by_event[event_name].keys()) | set(attendees_by_month_by_event[event_name].keys())
            for month in sorted(all_months):
                event_monthly.append({
                    'month': month,
                    'events': events_by_month_by_event[event_name][month],
                    'attendees': attendees_by_month_by_event[event_name][month]
                })
            events_monthly_data[event_name] = event_monthly
        
        insights = {
            'total_events': total_events,
            'total_attendees': total_attendees,
            'total_revenue': round(total_revenue, 2),
            'avg_revenue_per_event': round(total_revenue / total_events, 2) if total_events > 0 else 0,
            'avg_revenue_per_ticket': round(total_revenue / total_attendees, 2) if total_attendees > 0 else 0,
            'unique_customers': len(unique_emails),
            'new_customers': new_customer_count,
            'repeat_customers': repeat_customer_count,
            'repeat_customer_rate': round(repeat_customer_rate, 2),
            'avg_customer_lifetime_value': round(avg_customer_lifetime_value, 2),
            'avg_attendees_per_event': round(total_attendees / total_events, 2) if total_events > 0 else 0,
            'monthly_trends': monthly_data,
            'ticket_types': ticket_data,
            'events_list': events_list,
            'events_monthly_data': events_monthly_data,
            'top_customers': top_customers_data
        }
        
        return jsonify(insights)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not EVENTBRITE_TOKEN:
        print("Warning: EVENTBRITE_TOKEN environment variable not set!")
    app.run(debug=True, port=8080, use_reloader=False)

