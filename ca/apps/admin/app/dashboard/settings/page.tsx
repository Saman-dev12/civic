"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Mail, 
  Database,
  Shield,
  Globe,
  Clock
} from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoAssignment: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  defaultPriority: string;
  defaultCategory: string;
  maintenanceMode: boolean;
  sessionTimeout: number;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Civic Complaints System",
    siteDescription: "Report and track civic issues in your community",
    contactEmail: "admin@civic.gov",
    maxFileSize: 5,
    allowedFileTypes: ["jpg", "jpeg", "png", "pdf"],
    autoAssignment: false,
    emailNotifications: true,
    smsNotifications: false,
    defaultPriority: "medium",
    defaultCategory: "others",
    maintenanceMode: false,
    sessionTimeout: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Only admins can access this page
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      siteName: "Civic Complaints System",
      siteDescription: "Report and track civic issues in your community",
      contactEmail: "admin@civic.gov",
      maxFileSize: 5,
      allowedFileTypes: ["jpg", "jpeg", "png", "pdf"],
      autoAssignment: false,
      emailNotifications: true,
      smsNotifications: false,
      defaultPriority: "medium",
      defaultCategory: "others",
      maintenanceMode: false,
      sessionTimeout: 30,
    });
    toast.info("Settings reset to defaults");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                placeholder="Enter site name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                placeholder="Enter contact email"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Site Description</label>
            <Input
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              placeholder="Enter site description"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            File Upload Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Max File Size (MB)</label>
              <Input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                min="1"
                max="50"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Allowed File Types</label>
              <Input
                value={settings.allowedFileTypes.join(", ")}
                onChange={(e) => setSettings({
                  ...settings, 
                  allowedFileTypes: e.target.value.split(",").map(type => type.trim())
                })}
                placeholder="jpg, png, pdf"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-xs text-muted-foreground">Send email alerts for new complaints</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="w-4 h-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">SMS Notifications</label>
                <p className="text-xs text-muted-foreground">Send SMS alerts for urgent complaints</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                className="w-4 h-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Complaint Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto Assignment</label>
              <p className="text-xs text-muted-foreground">Automatically assign complaints to available officers</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoAssignment}
              onChange={(e) => setSettings({...settings, autoAssignment: e.target.checked})}
              className="w-4 h-4"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Default Priority</label>
              <select
                value={settings.defaultPriority}
                onChange={(e) => setSettings({...settings, defaultPriority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Default Category</label>
              <select
                value={settings.defaultCategory}
                onChange={(e) => setSettings({...settings, defaultCategory: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="roads">Roads & Infrastructure</option>
                <option value="streetlight">Street Light</option>
                <option value="sanitation">Sanitation & Cleanliness</option>
                <option value="water">Water Supply</option>
                <option value="tree">Tree Related</option>
                <option value="electricity">Electricity</option>
                <option value="drainage">Drainage</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Maintenance Mode</label>
              <p className="text-xs text-muted-foreground">Enable maintenance mode to restrict access</p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="w-4 h-4"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              min="5"
              max="120"
              placeholder="30"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Version:</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Status:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Used:</span>
                <span className="font-medium">2.3 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Sessions:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime:</span>
                <span className="font-medium">7 days, 14 hours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}