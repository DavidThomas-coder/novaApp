# Eventbrite API Rate Limits

## What Happened

You've hit the Eventbrite API rate limit (HTTP 429 error). This is normal when using the dashboard extensively, especially the **Performance** tab.

## Why It Happens

- **Performance Tab**: Makes 1 API call per event (179+ calls for your account)
- **Insights Tab**: Also makes many calls for predictions
- **Eventbrite Limits**: ~1000 requests per hour (varies by plan)

## How to Fix

### Immediate Solution (2-3 minutes)
1. **Wait 2-3 minutes** for the rate limit to reset
2. Click the **Retry** button in the dashboard
3. **Avoid** clicking Performance tab repeatedly

### Long-Term Solutions

#### Option 1: Use Caching (Already Implemented)
- The dashboard caches data for 5 minutes
- If you stay on Dashboard/Customers/Events tabs, you won't hit limits
- Only Performance and first-time loads hit the API heavily

#### Option 2: Backend Caching (Recommended for Production)
Add this to `backend/app.py`:

```python
from functools import lru_cache
from datetime import datetime, timedelta

# Cache performance data for 1 hour
performance_cache = {}
performance_cache_time = {}

@app.route('/api/event-performance', methods=['GET'])
def get_event_performance():
    org_id = request.args.get('org_id')
    
    # Check cache first
    if org_id in performance_cache:
        cache_age = datetime.now() - performance_cache_time[org_id]
        if cache_age < timedelta(hours=1):
            return jsonify(performance_cache[org_id])
    
    # ... rest of function
    # Then at the end:
    result = {'events': event_performance}
    performance_cache[org_id] = result
    performance_cache_time[org_id] = datetime.now()
    return jsonify(result)
```

#### Option 3: Upgrade Eventbrite Plan
- Higher-tier Eventbrite plans have higher rate limits
- Check your current plan at https://www.eventbrite.com/account-settings/

## Current Status

**Rate Limit Hit At:** Just now  
**Expected Reset:** 2-3 minutes from when you saw the error  
**Safe Tabs to Use:** Dashboard, Customers, Events (use cached data)  
**Heavy Tabs:** Performance, Insights (first load)

## Best Practices

1. **Use Dashboard/Customers tabs** for quick checks (cached)
2. **Load Performance tab** only when needed (once per hour max)
3. **Export data** for offline analysis
4. **Let cache work** - don't force refresh constantly

## Technical Details

- **Rate Limit**: ~1000 requests/hour (resets on rolling window)
- **Performance Tab**: ~180 requests on first load
- **Dashboard/Insights**: ~20-50 requests on first load
- **Cache Duration**: 5 minutes (frontend), can increase if needed

The dashboard is working perfectly - you just need to wait a few minutes for the Eventbrite API to reset! 🎯

