"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  UserCheck, 
  MessageSquare,
  AlertTriangle,
  FileText,
  Clock,
  Phone,
  Mail,
  Building
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { toast } from "sonner";

interface Assignment {
  id: string;
  assignedAt: string;
  status: string;
  priority: string;
  notes?: string;
  officer: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  assigner: {
    name: string;
    email: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  area?: string;
  landmark?: string;
  address?: string;
  imageUrl?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  assignments: Assignment[];
  comments: Comment[];
}

interface Officer {
  id: string;
  name: string;
  email: string;
  department?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const categoryLabels = {
  roads: "Roads & Infrastructure",
  streetlight: "Street Lighting",
  sanitation: "Sanitation & Waste",
  water: "Water Supply",
  tree: "Trees & Parks",
  electricity: "Electricity",
  drainage: "Drainage",
  others: "Others",
};

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const isAdmin = session?.user?.role === "admin";
  const isOfficer = session?.user?.role === "officer";

  useEffect(() => {
    if (id) {
      fetchComplaint();
      if (isAdmin) {
        fetchOfficers();
      }
    }
  }, [id, isAdmin]);

  const fetchComplaint = async () => {
    try {
      const response = await fetch(`/api/admin/complaints/${id}`);
      if (response.ok) {
        const data = await response.json();
        setComplaint(data);
        setNewStatus(data.status);
      } else if (response.status === 404) {
        toast.error("Complaint not found");
        router.push("/dashboard/complaints");
      } else if (response.status === 403) {
        toast.error("Access denied");
        router.push("/dashboard/assignments");
      } else {
        toast.error("Failed to load complaint");
      }
    } catch (error) {
      console.error("Error fetching complaint:", error);
      toast.error("Failed to load complaint");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await fetch("/api/admin/officers");
      if (response.ok) {
        const data = await response.json();
        setOfficers(data.officers || []); // Now using the correct structure
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const handleAssignComplaint = async () => {
    console.log("Assignment attempt - Selected Officer:", selectedOfficer);
    console.log("Assignment attempt - Complaint ID:", id);
    console.log("Assignment attempt - Available Officers:", officers);
    
    if (!selectedOfficer) {
      toast.error("Please select an officer");
      return;
    }

    setIsAssigning(true);
    try {
      const assignmentData = {
        complaintId: id,
        officerId: selectedOfficer,
        priority: complaint?.priority || "medium",
      };
      
      console.log("Sending assignment data:", assignmentData);
      
      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      console.log("Assignment response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Assignment successful:", result);
        toast.success("Complaint assigned successfully");
        fetchComplaint();
        setSelectedOfficer("");
      } else {
        const errorData = await response.json();
        console.error("Assignment failed:", errorData);
        toast.error(errorData.error || "Failed to assign complaint");
      }
    } catch (error) {
      console.error("Error assigning complaint:", error);
      toast.error("Failed to assign complaint");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === complaint?.status) return;

    try {
      const response = await fetch(`/api/admin/complaints/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success("Status updated successfully");
        fetchComplaint();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/admin/complaints/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (response.ok) {
        toast.success("Comment added successfully");
        setNewComment("");
        fetchComplaint();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complaint not found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            The complaint you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complaint Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ID: {complaint.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{complaint.title}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className={priorityColors[complaint.priority as keyof typeof priorityColors]}>
                      {complaint.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {categoryLabels[complaint.category as keyof typeof categoryLabels]}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{complaint.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Filed: {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                </div>
                {complaint.area && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Area: {complaint.area}</span>
                  </div>
                )}
                {complaint.landmark && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Landmark: {complaint.landmark}</span>
                  </div>
                )}
              </div>

              {/* Images */}
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Complaint image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={newStatus === complaint.status}
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({complaint.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e:any) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? "Adding..." : "Add Comment"}
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {complaint.comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {comment.user.role}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                ))}
                {complaint.comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Citizen Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Citizen Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{complaint.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {complaint.user.email}
                </span>
              </div>
              {complaint.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {complaint.user.phone}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.assignments.length > 0 ? (
                complaint.assignments.map((assignment) => (
                  <div key={assignment.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{assignment.officer.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>{assignment.officer.email}</p>
                      {assignment.officer.department && (
                        <p>Department: {assignment.officer.department}</p>
                      )}
                      <p>Assigned: {new Date(assignment.assignedAt).toLocaleString()}</p>
                      <p>By: {assignment.assigner.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Not assigned yet</p>
              )}
            </CardContent>
          </Card>

          {/* Status Update (Officers and Admins) */}
          {(isAdmin || isOfficer) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || newStatus === complaint?.status}
                  className="w-full"
                >
                  Update Status
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Assignment Action (Admin Only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assign Complaint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name} - {officer.department || "No Department"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAssignComplaint}
                  disabled={!selectedOfficer || isAssigning}
                  className="w-full"
                >
                  {isAssigning ? "Assigning..." : "Assign Complaint"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}