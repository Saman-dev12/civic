"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin
} from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

interface ReportStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionTime: number;
  completionRate: number;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  priorityStats: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    complaints: number;
    resolved: number;
  }>;
  departmentStats: Array<{
    department: string;
    assignedComplaints: number;
    resolvedComplaints: number;
    avgResolutionTime: number;
  }>;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ReportStats>({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    avgResolutionTime: 0,
    completionRate: 0,
    categoryStats: [],
    priorityStats: [],
    monthlyTrends: [],
    departmentStats: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  // Only admins can access this page
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        from: dateRange.from || '',
        to: dateRange.to || '',
      });

      const response = await fetch(`/api/admin/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        from: dateRange.from || '',
        to: dateRange.to || '',
        format,
      });

      const response = await fetch(`/api/admin/reports/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `civic-complaints-report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into complaint management performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <label className="text-sm font-medium">Date Range:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded-md"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">{stats.totalComplaints}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}d</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoryStats.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium capitalize">
                      {category.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {category.count} ({category.percentage}%)
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{width: `${category.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Complaints by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.priorityStats.map((priority) => (
                <div key={priority.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      priority.priority === 'critical' ? 'bg-red-500' :
                      priority.priority === 'high' ? 'bg-orange-500' :
                      priority.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">
                      {priority.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {priority.count} ({priority.percentage}%)
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          priority.priority === 'critical' ? 'bg-red-500' :
                          priority.priority === 'high' ? 'bg-orange-500' :
                          priority.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{width: `${priority.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyTrends.map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{trend.month}</h4>
                  <p className="text-sm text-muted-foreground">
                    {trend.complaints} complaints received
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    {trend.resolved} resolved
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((trend.resolved / trend.complaints) * 100)}% completion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Department</th>
                  <th className="text-right p-2">Assigned</th>
                  <th className="text-right p-2">Resolved</th>
                  <th className="text-right p-2">Success Rate</th>
                  <th className="text-right p-2">Avg Resolution (days)</th>
                </tr>
              </thead>
              <tbody>
                {stats.departmentStats.map((dept) => (
                  <tr key={dept.department} className="border-b">
                    <td className="p-2 font-medium">{dept.department || "Unassigned"}</td>
                    <td className="p-2 text-right">{dept.assignedComplaints}</td>
                    <td className="p-2 text-right text-green-600">{dept.resolvedComplaints}</td>
                    <td className="p-2 text-right">
                      {Math.round((dept.resolvedComplaints / dept.assignedComplaints) * 100)}%
                    </td>
                    <td className="p-2 text-right">{dept.avgResolutionTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}