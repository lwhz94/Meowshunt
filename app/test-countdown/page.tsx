import { EnergyDisplay } from '@/components/camp/energy-display';

export default function TestCountdownPage() {
  // Test with a recent timestamp (5 minutes ago) to show countdown in action
  const testLastRefill = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Energy Countdown Test</h1>
        <p className="text-gray-600 mb-6">
          This page tests the energy countdown functionality with a timestamp from 5 minutes ago.
          The countdown should continue from where it left off even after page refresh!
        </p>

        <EnergyDisplay
          currentEnergy={0}
          lastRefill={testLastRefill}
          maxEnergy={15}
        />

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Test Data:</h2>
          <p><strong>Current Energy:</strong> 0</p>
          <p><strong>Max Energy:</strong> 15</p>
          <p><strong>Last Refill:</strong> {new Date(testLastRefill).toLocaleString()}</p>
          <p><strong>Time Since Refill:</strong> 5 minutes</p>
          <p><strong>Expected Next Refill:</strong> In ~10 minutes</p>
          <p><strong>Test:</strong> Refresh the page - the countdown should continue from the same time!</p>
        </div>
      </div>
    </div>
  );
}
