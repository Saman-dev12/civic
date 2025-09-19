"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { ArrowLeft, Calendar, MapPin, User, MessageSquare, Send, FileText, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Assignment {
  id: string;
  assignedAt: string;
  officer: {
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
  author: {
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
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  assignments: Assignment[];
  comments: Comment[];
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchComplaint();
    }
  }, [params.id]);

  const fetchComplaint = async () => {
    try {
      const response = await fetch(`/api/complaints/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setComplaint(data);
      } else if (response.status === 404) {
        toast.error("Complaint not found");
        router.push("/dashboard/complaints");
      } else {
        toast.error("Failed to fetch complaint details");
      }
    } catch (error) {
      console.error("Failed to fetch complaint:", error);
      toast.error("Failed to fetch complaint details");
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/complaints/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComplaint(prev => prev ? {
          ...prev,
          comments: [...prev.comments, comment]
        } : null);
        setNewComment("");
        toast.success("Comment added successfully");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "assigned":
        return <User className="h-5 w-5 text-blue-500" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "closed":
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-20 bg-gray-300 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Complaint not found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The complaint you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/dashboard/complaints")}>
          Back to Complaints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {getStatusIcon(complaint.status)}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {complaint.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(complaint.status)}
                    {getPriorityBadge(complaint.priority)}
                  </div>
                  <CardTitle className="text-xl">{complaint.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {complaint.imageUrl && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Attached Image
                  </h3>
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint"
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Filed: {new Date(complaint.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{complaint.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  <span>{getCategoryLabel(complaint.category)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
                </div>
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
              {complaint.comments.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                  No comments yet. Be the first to add one!
                </p>
              ) : (
                <div className="space-y-4">
                  {complaint.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {comment.author.role}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={submitComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingComment ? "Adding..." : "Add Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          {complaint.assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complaint.assignments.map((assignment) => (
                  <div key={assignment.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {assignment.officer.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p>{assignment.officer.email}</p>
                      {assignment.officer.department && (
                        <p>Department: {assignment.officer.department}</p>
                      )}
                      <p>Assigned: {new Date(assignment.assignedAt).toLocaleString()}</p>
                      <p>By: {assignment.assigner.name}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Complaint Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Complaint Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300">ID:</span>
                <p className="font-mono text-xs text-gray-800 dark:text-gray-100">
                  {complaint.id}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Filed by:</span>
                <p className="text-gray-900 dark:text-white">{complaint.user.name}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <p className="text-gray-900 dark:text-white">{complaint.user.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}