export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface Group {
  id: string;
  name: string;
  memberCount: number;
}

export interface SmsRecord {
  id: string;
  recipient: string;
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  date: string;
}

const contacts: Contact[] = [
  { id: '1', name: 'John Doe', phone: '+1234567890' },
  { id: '2', name: 'Jane Smith', phone: '+1234567891' },
  { id: '3', name: 'Alice Johnson', phone: '+1234567892' },
  { id: '4', name: 'Bob Brown', phone: '+1234567893' },
  { id: '5', name: 'Charlie Davis', phone: '+1234567894' },
  { id: '6', name: 'Diana Miller', phone: '+1234567895' },
];

const groups: Group[] = [
  { id: 'g1', name: 'VIP Customers', memberCount: 12 },
  { id: 'g2', name: 'New Leads', memberCount: 45 },
  { id: 'g3', name: 'Tier 1 Suppliers', memberCount: 8 },
  { id: 'g4', name: 'All Staff', memberCount: 22 },
];

const smsHistory: SmsRecord[] = [
  { id: 'h1', recipient: 'VIP Customers', message: 'Dear VIPs, our new collection is out! Check it out.', status: 'Sent', date: '2023-10-26 10:00 AM' },
  { id: 'h2', recipient: 'John Doe', message: 'Your order #1234 has been shipped.', status: 'Sent', date: '2023-10-25 03:45 PM' },
  { id: 'h3', recipient: 'New Leads', message: 'Welcome to Preach It! Here is a 10% off coupon: WELCOME10', status: 'Sent', date: '2023-10-25 09:00 AM' },
  { id: 'h4', recipient: 'Jane Smith', message: 'Hi Jane, we noticed you left items in your cart.', status: 'Failed', date: '2023-10-24 01:20 PM' },
  { id: 'h5', recipient: 'All Staff', message: 'Staff meeting tomorrow at 10 AM in the main conference room.', status: 'Sent', date: '2023-10-23 05:00 PM' },
];

export async function getContacts(): Promise<Contact[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return contacts;
}

export async function getGroups(): Promise<Group[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return groups;
}

export async function getSmsHistory(): Promise<SmsRecord[]> {
    // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return smsHistory;
}
