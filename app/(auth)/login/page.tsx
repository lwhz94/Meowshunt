import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login - Meowshunt",
  description: "Sign in to your Meowshunt account",
};

export default async function LoginPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to continue hunting Meows</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
