/**
 * Utility functions for exporting data to CSV format
 */

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Convert array of objects to CSV
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape commas and quotes in values
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Create CSV string
  const csvString = csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const exportMonthlyTrendsToCSV = (monthlyTrends) => {
  const data = monthlyTrends.map(item => ({
    Month: item.month,
    Events: item.events,
    Attendees: item.attendees,
    Revenue: `$${item.revenue || 0}`
  }));
  exportToCSV(data, 'nova-monthly-trends');
};

export const exportCustomersToCSV = (customers) => {
  const data = customers.map((customer, index) => ({
    Rank: index + 1,
    Email: customer.email,
    'Events Attended': customer.events_attended,
    'Lifetime Value': `$${customer.lifetime_value}`
  }));
  exportToCSV(data, 'nova-top-customers');
};

export const exportEventsToCSV = (events) => {
  const data = events.map(event => ({
    Name: event.name,
    Status: event.status,
    Start: event.start,
    Capacity: event.capacity,
    'Is Free': event.is_free ? 'Yes' : 'No',
    URL: event.url
  }));
  exportToCSV(data, 'nova-events');
};

export const exportAttendeesToCSV = (attendees, eventName) => {
  const data = attendees.map(attendee => ({
    'First Name': attendee.first_name,
    'Last Name': attendee.last_name,
    Email: attendee.email,
    'Ticket Type': attendee.ticket_class_name,
    Status: attendee.status,
    'Created Date': attendee.created
  }));
  const safeEventName = eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  exportToCSV(data, `nova-attendees-${safeEventName}`);
};

