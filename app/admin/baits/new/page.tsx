import { BaitForm } from '@/components/admin/BaitForm';

export default function NewBaitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Bait</h1>
        <p className="text-gray-600 mt-2">Add a new hunting bait to the game</p>
      </div>
      
      <BaitForm mode="create" />
    </div>
  );
}
