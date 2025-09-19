"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Search,
  MoreHorizontal,
  UserCheck,
  FileText,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

interface Officer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  employeeId?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    assignments: number;
  };
}

export default function OfficersPage() {
  const { data: session } = useSession();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [stats, setStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    totalAssignments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    employeeId: "",
    role: "officer",
    password: "",
  });

  // Only admins can access this page
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await fetch("/api/admin/officers");
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data); // Debug log
        setOfficers(data.officers || []); // Now using the correct structure
        setStats(data.stats || {
          totalOfficers: 0,
          activeOfficers: 0,
          totalAssignments: 0
        });
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
      toast.error("Failed to load officers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/officers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOfficer),
      });

      if (response.ok) {
        toast.success("Officer added successfully");
        setNewOfficer({
          name: "",
          email: "",
          phone: "",
          department: "",
          employeeId: "",
          role: "officer",
          password: "",
        });
        setShowAddForm(false);
        fetchOfficers();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add officer");
      }
    } catch (error) {
      console.error("Error adding officer:", error);
      toast.error("Failed to add officer");
    }
  };

  const handleToggleActive = async (officerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/officers/${officerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(`Officer ${!isActive ? "activated" : "deactivated"} successfully`);
        fetchOfficers();
      } else {
        toast.error("Failed to update officer status");
      }
    } catch (error) {
      console.error("Error updating officer:", error);
      toast.error("Failed to update officer status");
    }
  };

  const filteredOfficers = officers.filter(officer =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (officer.department || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Officers Management</h1>
          <p className="text-muted-foreground">
            Manage complaint officers and administrative staff
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Officer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Officers</p>
                <p className="text-2xl font-bold">{stats.totalOfficers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeOfficers}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-blue-600">
                  0
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">
                  {stats.totalAssignments}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search officers by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Officer Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Officer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOfficer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    required
                    value={newOfficer.name}
                    onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    required
                    value={newOfficer.email}
                    onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={newOfficer.phone}
                    onChange={(e) => setNewOfficer({...newOfficer, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={newOfficer.department}
                    onChange={(e) => setNewOfficer({...newOfficer, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Employee ID</label>
                  <Input
                    value={newOfficer.employeeId}
                    onChange={(e) => setNewOfficer({...newOfficer, employeeId: e.target.value})}
                    placeholder="Enter employee ID"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={newOfficer.role}
                    onChange={(e) => setNewOfficer({...newOfficer, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="officer">Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    required
                    value={newOfficer.password}
                    onChange={(e) => setNewOfficer({...newOfficer, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Add Officer</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Officers List */}
      <div className="grid gap-4">
        {filteredOfficers.map((officer) => (
          <Card key={officer.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{officer.name}</h3>
                    <Badge variant={officer.role === "admin" ? "default" : "secondary"}>
                      {officer.role}
                    </Badge>
                    <Badge variant={officer.isActive ? "default" : "destructive"}>
                      {officer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{officer.email}</span>
                    </div>
                    
                    {officer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{officer.phone}</span>
                      </div>
                    )}
                    
                    {officer.department && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{officer.department}</span>
                      </div>
                    )}
                    
                    {officer.employeeId && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">ID:</span>
                        <span>{officer.employeeId}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{officer._count.assignments} assignments</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(officer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={officer.isActive ? "destructive" : "default"}
                    onClick={() => handleToggleActive(officer.id, officer.isActive)}
                  >
                    {officer.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}