"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { AlertCircle, Shield, User, Mail, Phone, Lock, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminSignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    employeeId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.role) {
      setError("Please select a role");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          employeeId: formData.employeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Registration successful!", {
        description: "Your admin account request has been submitted for approval.",
      });

      router.push("/auth/signin?message=registration-pending");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
      toast.error("Registration failed", {
        description: error.message || "An unexpected error occurred.",
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
            <UserCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Request access to the civic complaints admin panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Administrative Access Request</CardTitle>
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
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your official email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">System Administrator</SelectItem>
                      <SelectItem value="officer">Complaint Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">
                    Department
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    placeholder="e.g., Municipal Corporation, Public Works"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="employeeId">
                    Employee ID (Optional)
                  </Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                    placeholder="Enter your employee ID"
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
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Submitting Request..." : "Request Admin Access"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an admin account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Admin account requests require approval.
                  You will be contacted within 24-48 hours regarding your application status.
                </p>
              </div>
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