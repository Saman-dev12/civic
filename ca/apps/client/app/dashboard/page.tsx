"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

interface RecentComplaint {
  id: string;
  title: string;
  status: string;
  category: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, complaintsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/recent-complaints"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        setRecentComplaints(complaintsData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in_progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      case "resolved":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Here's an overview of your civic complaints.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-complaint">
            <Plus className="h-4 w-4 mr-2" />
            File New Complaint
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No complaints filed yet.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/new-complaint">
                  File Your First Complaint
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(complaint.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/complaints/${complaint.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/complaints">View All Complaints</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}