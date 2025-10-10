"""
Helper functions for generating weekly sales reports
"""
from datetime import datetime, timedelta
from collections import defaultdict

def get_week_start(date):
    """Get the Monday of the week for a given date"""
    days_since_monday = date.weekday()
    return date - timedelta(days=days_since_monday)

def get_week_range(week_start):
    """Get start and end dates for a week (Monday to Sunday)"""
    week_end = week_start + timedelta(days=6)
    return week_start, week_end

def generate_weekly_report(all_events, attendees_by_event):
    """
    Generate weekly sales report
    
    Args:
        all_events: List of event objects with dates
        attendees_by_event: Dict mapping event_id -> list of attendees
    
    Returns:
        Dict mapping week_start_date -> list of event sales for that week
    """
    weekly_data = defaultdict(list)
    
    for event in all_events:
        event_id = event['id']
        event_name = event['name']['text']
        event_start = event['start']['local']
        
        # Parse event date
        event_date = datetime.fromisoformat(event_start.replace('Z', '+00:00'))
        week_start = get_week_start(event_date.date())
        
        # Get attendees for this event
        attendees = attendees_by_event.get(event_id, [])
        tickets_sold = len(attendees)
        
        # Calculate revenue
        total_revenue = 0
        for attendee in attendees:
            costs = attendee.get('costs', {})
            gross = costs.get('gross', {})
            revenue_cents = gross.get('value', 0)
            total_revenue += revenue_cents / 100.0
        
        weekly_data[week_start].append({
            'event_name': event_name,
            'event_date': event_date.strftime('%Y-%m-%d'),
            'tickets_sold': tickets_sold,
            'gross_revenue': round(total_revenue, 2)
        })
    
    return weekly_data

