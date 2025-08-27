import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { getUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is authenticated
  const user = await getUser();
  
  // If authenticated, redirect to camp
  if (user) {
    redirect('/camp');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-8">
          {/* Logo placeholder */}
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">🐱</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Meowshunt</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Hunt for Meows in this exciting mobile-first adventure game
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <a href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </a>
              <a href="/register">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Sign Up
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
