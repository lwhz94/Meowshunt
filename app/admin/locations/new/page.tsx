import { LocationForm } from '@/components/admin/LocationForm';

export default function NewLocationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Location</h1>
        <p className="text-gray-600 mt-2">Add a new hunting location to the game</p>
      </div>
      
      <LocationForm mode="create" />
    </div>
  );
}
