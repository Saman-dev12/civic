"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  User,
  Building
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Assignment {
  id: string;
  assignedAt: string;
  status: string;
  complaint: {
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
  };
  officer: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  assigner: {
    name: string;
  };
}

interface Officer {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export default function AssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    officer: "all",
  });

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    fetchAssignments();
    if (isAdmin) {
      fetchOfficers();
    }
  }, [isAdmin]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/admin/assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await fetch("/api/admin/officers");
      if (response.ok) {
        const data = await response.json();
        setOfficers(data.officers || []);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const handleAssignComplaint = async (complaintId: string, officerId: string) => {
    try {
      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId,
          officerId,
        }),
      });

      if (response.ok) {
        toast.success("Complaint assigned successfully");
        fetchAssignments();
      } else {
        toast.error("Failed to assign complaint");
      }
    } catch (error) {
      console.error("Error assigning complaint:", error);
      toast.error("Failed to assign complaint");
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.officer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === "all" || assignment.complaint.status === filters.status;
    const matchesOfficer = filters.officer === "all" || assignment.officer.id === filters.officer;

    return matchesSearch && matchesStatus && matchesOfficer;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? "All Assignments" : "My Assignments"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Manage complaint assignments across all officers" 
              : "View and manage your assigned complaints"
            }
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/complaints?status=pending">
              <UserCheck className="h-4 w-4 mr-2" />
              Assign Complaints
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <Select value={filters.officer} onValueChange={(value) => setFilters({...filters, officer: value})}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Officers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
              <p className="text-muted-foreground">
                {isAdmin 
                  ? "No assignments match your current filters" 
                  : "You don't have any assignments yet"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">
                          {assignment.complaint.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant={getPriorityColor(assignment.complaint.priority)}>
                            {assignment.complaint.priority}
                          </Badge>
                          <Badge variant={getStatusColor(assignment.complaint.status)}>
                            {assignment.complaint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{assignment.complaint.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Reporter: {assignment.complaint.user.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>Assigned to: {assignment.officer.name}</span>
                        </div>
                        
                        {assignment.officer.department && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{assignment.officer.department}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Created: {new Date(assignment.complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/complaints/${assignment.complaint.id}`}>
                          View Details
                        </Link>
                      </Button>
                      
                      {(isAdmin || assignment.officer.id === session?.user?.id) && (
                        <Button asChild size="sm">
                          <Link href={`/dashboard/complaints/${assignment.complaint.id}/update`}>
                            Update Status
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}