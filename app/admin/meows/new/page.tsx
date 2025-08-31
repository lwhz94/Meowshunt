import { MeowForm } from '@/components/admin/MeowForm';

export default function NewMeowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Meow</h1>
        <p className="text-gray-600 mt-2">Add a new huntable Meow to the game</p>
      </div>
      
      <MeowForm mode="create" />
    </div>
  );
}
