"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreateCoursePage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentUrl: "",
    contentType: "video",
    expirationDate: "",
    quizFile: null,
    totalCEUs: "1.0",
    ethicsCEUs: "0.0",
    supervisionCEUs: "0.0",
    instructorName: "Course Instructor",
    coordinatorName: "ArkABA Coordinator",
    bacbNumber: "AB1000001",
    providerNumber: "TBD",
    // Removed signatureImageUrl
    isPublic: false,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("contentUrl", formData.contentUrl);
    form.append("contentType", formData.contentType);
    form.append("expirationDate", formData.expirationDate);
    form.append("quizFile", formData.quizFile);
    form.append("totalCEUs", formData.totalCEUs);
    form.append("ethicsCEUs", formData.ethicsCEUs);
    form.append("supervisionCEUs", formData.supervisionCEUs);
    form.append("instructorName", formData.instructorName);
    form.append("coordinatorName", formData.coordinatorName);
    form.append("bacbNumber", formData.bacbNumber);
    form.append("providerNumber", formData.providerNumber);
    // Removed signatureImageUrl
    form.append("isPublic", formData.isPublic.toString());

    const res = await fetch("/api/course-platform/courses", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Course created successfully!");
      setFormData({
        title: "",
        description: "",
        contentUrl: "",
        contentType: "video",
        expirationDate: "",
        quizFile: null,
        totalCEUs: "1.0",
        ethicsCEUs: "0.0",
        supervisionCEUs: "0.0",
        instructorName: "Course Instructor",
        coordinatorName: "ArkABA Coordinator",
        bacbNumber: "AB1000001",
        providerNumber: "TBD",
        // Removed signatureImageUrl
        isPublic: false,
      });
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  if (status !== "authenticated" || session?.user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Only admins can create courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn()} className="w-full py-2 text-lg">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Create a New Course
      </h1>
      {message && (
        <p className="mb-4 text-sm text-center text-red-500">{message}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content Type</label>
          <select
            name="contentType"
            value={formData.contentType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="video">Video</option>
            <option value="podcast">Podcast</option>
            <option value="course">Course</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content URL</label>
          <input
            type="url"
            name="contentUrl"
            value={formData.contentUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">BACB Certification Number</label>
          <input
            type="text"
            name="bacbNumber"
            value={formData.bacbNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="AB1000001"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The BACB certification number that will appear on certificates for this course
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ACE Provider Number</label>
          <input
            type="text"
            name="providerNumber"
            value={formData.providerNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="TBD"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The ACE provider number for this course
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total CEUs</label>
          <input
            type="text"
            name="totalCEUs"
            value={formData.totalCEUs}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1.0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ethics CEUs</label>
          <input
            type="text"
            name="ethicsCEUs"
            value={formData.ethicsCEUs}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Supervision CEUs</label>
          <input
            type="text"
            name="supervisionCEUs"
            value={formData.supervisionCEUs}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructor Name</label>
          <input
            type="text"
            name="instructorName"
            value={formData.instructorName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Course Instructor"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Coordinator Name</label>
          <input
            type="text"
            name="coordinatorName"
            value={formData.coordinatorName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ArkABA Coordinator"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Quiz CSV File
          </label>
          <input
            type="file"
            name="quizFile"
            accept=".csv"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
            required
          />
        </div>
        <Button type="submit" className="w-full py-2">
          Create Course
        </Button>
      </form>
    </div>
  );
}
