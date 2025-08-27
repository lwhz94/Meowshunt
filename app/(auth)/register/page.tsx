import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register - Meowshunt",
  description: "Create your Meowshunt account",
};

export default async function RegisterPage() {
  // Check if user is already authenticated
  const user = await getUser();
  
  // If authenticated, redirect to camp
  if (user) {
    redirect('/camp');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-6">
            <span className="text-2xl font-bold text-white">🐱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join Meowshunt</h1>
          <p className="mt-2 text-gray-600">Create an account to start hunting Meows</p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
