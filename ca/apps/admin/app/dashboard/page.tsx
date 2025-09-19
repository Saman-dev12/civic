"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  User
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  assignedComplaints: number;
  resolvedComplaints: number;
  totalOfficers: number;
  activeOfficers: number;
}

interface RecentComplaint {
  id: string;
  title: string;
  status: string;
  category: string;
  priority: string;
  createdAt: string;
  user: {
    name: string;
  };
  location: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    totalOfficers: 0,
    activeOfficers: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, complaintsResponse] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/recent-complaints"),
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

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "secondary",
      assigned: "default",
      in_progress: "default",
      resolved: "outline",
      closed: "outline",
    };

    const labels: { [key: string]: string } = {
      pending: "Pending",
      assigned: "Assigned",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      low: "outline",
      medium: "secondary",
      high: "default",
      critical: "destructive",
    };

    return (
      <Badge variant={variants[priority] || "default"} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      roads: "Roads",
      streetlight: "Street Light",
      sanitation: "Sanitation",
      water: "Water",
      tree: "Tree",
      electricity: "Electricity",
      drainage: "Drainage",
      others: "Others",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Here's an overview of the civic complaint management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">
              All time complaints filed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingComplaints}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assignedComplaints}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfficers}</div>
            <p className="text-xs text-muted-foreground">
              Registered officers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeOfficers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Complaints</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/complaints">
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No recent complaints found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {complaint.title}
                      </h3>
                      {getStatusBadge(complaint.status)}
                      {getPriorityBadge(complaint.priority)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>{getCategoryLabel(complaint.category)}</span>
                      <span>by {complaint.user.name}</span>
                      <span className="truncate">{complaint.location}</span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/complaints/${complaint.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild className="h-16 flex-col">
          <Link href="/dashboard/complaints?status=pending">
            <Clock className="h-5 w-5 mb-1" />
            <span>View Pending</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 flex-col">
          <Link href="/dashboard/assignments">
            <User className="h-5 w-5 mb-1" />
            <span>Manage Assignments</span>
          </Link>
        </Button>
        {session?.user?.role === "admin" && (
          <>
            <Button asChild variant="outline" className="h-16 flex-col">
              <Link href="/dashboard/officers">
                <Users className="h-5 w-5 mb-1" />
                <span>Manage Officers</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col">
              <Link href="/dashboard/reports">
                <TrendingUp className="h-5 w-5 mb-1" />
                <span>View Reports</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}