import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to camp since that's our main game area
  redirect('/camp');
}
