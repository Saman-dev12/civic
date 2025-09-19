"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  MapPin,
  UserCheck,
  Settings
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  activeOfficers: number;
  completionRate: number;
  avgResolutionTime: number;
}

interface RecentComplaint {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function AdminHomePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    activeOfficers: 0,
    completionRate: 0,
    avgResolutionTime: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      redirect("/auth/signin");
      return;
    }

    if (session.user.role !== "admin" && session.user.role !== "officer") {
      redirect("/auth/signin");
      return;
    }

    fetchDashboardData();
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, complaintsResponse] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/recent-complaints?limit=5")
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        setRecentComplaints(complaintsData.complaints || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "default";
      case "in_progress": return "secondary";
      case "assigned": return "outline";
      case "pending": return "destructive";
      default: return "outline";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name}. Here's your civic complaints overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/complaints">
                <FileText className="h-4 w-4 mr-2" />
                View All Complaints
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/complaints?status=pending">
                <AlertCircle className="h-4 w-4 mr-2" />
                Pending Complaints
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingComplaints}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent complaints</p>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{complaint.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityColor(complaint.priority)} className="text-xs">
                          {complaint.priority}
                        </Badge>
                        <Badge variant={getStatusColor(complaint.status)} className="text-xs">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {complaint.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/complaints/${complaint.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/dashboard/complaints?status=pending">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Review Pending Complaints
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link href="/dashboard/complaints?status=assigned">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check Assigned Tasks
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link href="/dashboard/complaints">
                  <FileText className="h-4 w-4 mr-2" />
                  Browse All Complaints
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link href="/dashboard/reports">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports & Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
