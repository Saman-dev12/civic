"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { FileText, Filter, Search, Eye, Calendar, MapPin, User, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  assignments: Array<{
    officer: {
      name: string;
      email: string;
    };
    assignedBy: {
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
  _count: {
    comments: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    category: searchParams.get("category") || "all",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    fetchComplaints();
  }, [searchParams]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const page = searchParams.get("page") || "1";
      params.set("page", page);
      params.set("limit", "10");

      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.category && filters.category !== "all") params.set("category", filters.category);

      const response = await fetch(`/api/complaints?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    const params = new URLSearchParams();
    if (updatedFilters.status && updatedFilters.status !== "all") params.set("status", updatedFilters.status);
    if (updatedFilters.category && updatedFilters.category !== "all") params.set("category", updatedFilters.category);
    if (updatedFilters.search) params.set("search", updatedFilters.search);

    router.push(`/dashboard/complaints?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "secondary",
      in_progress: "default",
      resolved: "outline",
      rejected: "destructive",
    };

    const labels: { [key: string]: string } = {
      pending: "Pending",
      in_progress: "In Progress",
      resolved: "Resolved",
      rejected: "Rejected",
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
      <Badge variant={variants[priority] || "default"}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      roads: "Roads & Infrastructure",
      streetlight: "Street Light",
      sanitation: "Sanitation & Cleanliness",
      water: "Water Supply",
      tree: "Tree Related",
      electricity: "Electricity",
      drainage: "Drainage",
      others: "Others",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Complaints</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Complaints
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track the status of your filed complaints
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-complaint">
            <FileText className="h-4 w-4 mr-2" />
            File New Complaint
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="roads">Roads & Infrastructure</SelectItem>
                  <SelectItem value="streetlight">Street Light</SelectItem>
                  <SelectItem value="sanitation">Sanitation & Cleanliness</SelectItem>
                  <SelectItem value="water">Water Supply</SelectItem>
                  <SelectItem value="tree">Tree Related</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="drainage">Drainage</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search complaints..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No complaints found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {Object.values(filters).some(Boolean)
                  ? "Try adjusting your filters to see more results."
                  : "You haven't filed any complaints yet."}
              </p>
              <Button asChild>
                <Link href="/dashboard/new-complaint">
                  File Your First Complaint
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {complaint.title}
                      </h3>
                      {getStatusBadge(complaint.status)}
                      {getPriorityBadge(complaint.priority)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/complaints/${complaint.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Filed: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{complaint.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{getCategoryLabel(complaint.category)}</span>
                  </div>
                </div>

                {complaint.assignments.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <User className="h-4 w-4" />
                      <span>
                        Assigned to: {complaint?.assignments[0]?.officer.name}
                      </span>
                    </div>
                  </div>
                )}

                {complaint._count.comments > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MessageSquare className="h-4 w-4" />
                    <span>{complaint._count.comments} comments</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pagination.pages)].map((_, i) => {
            const page = i + 1;
            const isActive = page === pagination.page;
            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", page.toString());
                  router.push(`/dashboard/complaints?${params.toString()}`);
                }}
              >
                {page}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}