
import { getContacts, getGroups, getDashboardStats } from '@/lib/data';
import { DashboardClient } from './dashboard-client';

export const revalidate = 0; // Ensure dynamic rendering

export default async function DashboardPage() {
  // Fetch initial data on the server
  const [initialContacts, initialGroups, initialStats] = await Promise.all([
    getContacts(),
    getGroups(),
    getDashboardStats(),
  ]);

  return (
    <DashboardClient
      initialContacts={initialContacts}
      initialGroups={initialGroups}
      initialStats={initialStats}
    />
  );
}
