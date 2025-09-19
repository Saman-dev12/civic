"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { Camera, MapPin, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.enum(["roads", "streetlight", "sanitation", "water", "tree", "electricity", "drainage", "others"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().min(1, "Location is required"),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

export default function NewComplaintPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: "medium",
      category: "others",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureCurrentLocation = () => {
    setIsCapturingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || ''}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.results[0]?.formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setValue("location", address);
            toast.success("Location captured successfully");
          } else {
            setValue("location", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            toast.success("Location coordinates captured");
          }
        } catch (error) {
          setValue("location", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast.success("Location coordinates captured");
        }
        
        setIsCapturingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to capture location. Please enter manually.");
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("priority", data.priority);
      formData.append("location", data.location);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Complaint filed successfully!");
        router.push(`/dashboard/complaints/${result.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to file complaint");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to file complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };
    return labels[priority] || priority;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          File New Complaint
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Report civic issues in your area for quick resolution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue"
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value:any) => setValue("category", value as any)} defaultValue="others">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
                {errors.category && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select onValueChange={(value:any) => setValue("priority", value as any)} defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter location or use current location"
                  {...register("location")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={captureCurrentLocation}
                  disabled={isCapturingLocation}
                >
                  {isCapturingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.location && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photo (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Upload a photo to help illustrate the issue
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Photo
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Filing Complaint...
                  </>
                ) : (
                  "File Complaint"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}