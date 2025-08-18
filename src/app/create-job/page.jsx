"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  MapPin,
  DollarSign,
  Clock,
  Mail,
  Building,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function CreateJobPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    applicationDeadline: "",
    contactEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      setIsSubmitted(true);
      setForm({
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
        jobType: "Full-time",
        applicationDeadline: "",
        contactEmail: "",
      });
    } catch (error) {
      console.error("Error submitting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Job Posted Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your job posting has been submitted for approval. We'll review it and publish it to our job board within 24-48 hours.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Post Another Job
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/jobs">View Job Board</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Post a Job Opportunity
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Share your job opening with the Arkansas ABA community. Reach qualified behavior analysts and professionals in the field.
            </p>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Job Details
              </CardTitle>
              <p className="text-sm text-gray-600">
                Fill in the details below to post your job opportunity. All fields marked with * are required.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Senior Behavior Analyst"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                {/* Company and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company *
                    </label>
                    <Input
                      type="text"
                      placeholder="Company name"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </label>
                    <Input
                      type="text"
                      placeholder="City, State or Remote"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Job Type and Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Job Type
                    </label>
                    <select
                      value={form.jobType}
                      onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Salary Range
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., $50,000 - $70,000"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Application Deadline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Application Deadline
                  </label>
                  <Input
                    type="date"
                    value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Contact Email/Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Email/Link
                  </label>
                  <Input
                    type="text"
                    placeholder="email@company.com or application link"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Job Description *
                  </label>
                  <Textarea
                    placeholder="Provide a detailed description of the position, responsibilities, requirements, and benefits..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="min-h-[120px] resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Include key responsibilities, qualifications, and what makes this opportunity unique.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Job Posting
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-lg bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">
                      What happens after submission?
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your job posting will be reviewed by our team</li>
                      <li>• Approved posts will be published within 24-48 hours</li>
                      <li>• You'll receive an email confirmation once published</li>
                      <li>• Job seekers can apply directly through our platform</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
