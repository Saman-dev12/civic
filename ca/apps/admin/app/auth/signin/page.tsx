"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { AlertCircle, Shield, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminSignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        toast.error("Sign in failed", {
          description: "Invalid email or password.",
        });
      } else {
        // Check if user has admin/officer role
        const session = await getSession();
        if (session?.user?.role === "admin" || session?.user?.role === "officer") {
          toast.success("Welcome back!", {
            description: "You have been signed in successfully.",
          });
          router.push("/dashboard");
        } else {
          // Sign out the user since they don't have admin privileges
          await signIn(); // This will sign them out
          setError("Access denied. Admin or officer privileges required.");
          toast.error("Access denied", {
            description: "You don't have permission to access the admin panel.",
          });
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred. Please try again.");
      toast.error("Sign in failed", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the civic complaints admin panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Administrative Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an admin account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Request Access
                </Link>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This is a restricted area for authorized personnel only.
                <br />
                All access attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}