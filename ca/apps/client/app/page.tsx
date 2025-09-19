import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { MapPin, Camera, FileText, Bell, Users, Shield } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Civic Portal</h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Report. Track. Resolve.
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Your voice matters in building better communities. Report civic issues, 
          track their progress, and see real change happen in your neighborhood.
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/signup">Start Reporting Issues</Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Camera className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Report Issues</CardTitle>
              <CardDescription>
                Take a photo, add location details, and submit your civic concern in seconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor your complaint status from submission to resolution with real-time updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Get Notified</CardTitle>
              <CardDescription>
                Receive notifications when your issue is assigned, in progress, or resolved.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Issue Types Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Common Issue Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Potholes",
            "Street Lights",
            "Garbage Collection",
            "Water Issues",
            "Drainage Problems",
            "Tree Maintenance",
            "Electricity",
            "Others"
          ].map((issue) => (
            <div key={issue} className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center shadow-sm">
              <p className="font-medium text-gray-900 dark:text-white">{issue}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Ready to Make a Difference?
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Join thousands of citizens working together to improve their communities.
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/signup">Join the Movement</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-300">Civic Portal</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            © 2025 Civic Portal. Making communities better together.
          </p>
        </div>
      </footer>
    </div>
  );
}
