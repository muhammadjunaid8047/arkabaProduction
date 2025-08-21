"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  ClipboardList,
  Check,
  Trash2,
  Briefcase,
  MapPin,
  FileText,
  DollarSign,
  Clock,
  Mail,
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

export default function AdminDashboard() {
  const [tab, setTab] = useState("approval");
  const [jobs, setJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [newJob, setNewJob] = useState({
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

  const fetchJobs = async () => {
    const res = await fetch("/api/admin/job-board/jobs");
    const data = await res.json();
    setJobs(data.filter((job) => !job.approved));
    setApprovedJobs(data.filter((job) => job.approved));
  };

  const approveJob = async (id) => {
    await fetch(`/api/admin/job-board/approve/${id}`, { method: "PATCH" });
    fetchJobs();
  };

  const deleteJob = async (id) => {
    await fetch(`/api/admin/job-board/delete/${id}`, { method: "DELETE" });
    fetchJobs();
  };

  const createJob = async () => {
    setIsSubmitting(true);
    try {
      const requiredFields = {
        title: newJob.title,
        description: newJob.description,
        company: newJob.company,
        location: newJob.location,
        salary: newJob.salary,
        jobType: newJob.jobType,
        applicationDeadline: newJob.applicationDeadline,
        contactEmail: newJob.contactEmail,
      };

      // Check if all required fields are non-empty
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        alert(`Please fill in all fields: ${missingFields.join(", ")}`);
        return;
      }

      await fetch("/api/admin/job-board/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newJob,
          approved: true, // Automatically approve jobs created by admin
        }),
      });
      setNewJob({
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
        jobType: "Full-time",
        applicationDeadline: "",
        contactEmail: "",
      });
      setTab("approved");
      fetchJobs();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Job Board Administration
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-100 max-w-3xl mx-auto">
            Manage and approve job postings for the ArkABA community
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-red-600 hover:text-red-800">
                Home
              </a>
            </li>
            <li>
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-500">Admin Dashboard</li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border border-gray-200">
          <nav className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <button
              onClick={() => setTab("approval")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "approval"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              Pending Approval
              {jobs.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("approved")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "approved"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              Approved Jobs
            </button>
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "create"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Create New
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* Jobs for Approval */}
          {tab === "approval" && (
            <div className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <div className="p-4 sm:p-8 text-center text-gray-500">
                  <XCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No pending jobs</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    All job postings have been approved.
                  </p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {job.title}
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-3">
                          {job.description}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                          <span className="font-medium">{job.company}</span> •{" "}
                          {job.location}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Salary: {job.salary || "Not specified"}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Type: {job.jobType}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Deadline:{" "}
                          {job.applicationDeadline
                            ? new Date(
                                job.applicationDeadline
                              ).toLocaleDateString()
                            : "Not specified"}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Contact: {job.contactEmail || "Not specified"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-wrap gap-2">
                        <button
                          onClick={() => approveJob(job._id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => deleteJob(job._id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Approved Jobs */}
          {tab === "approved" && (
            <div className="divide-y divide-gray-200">
              {approvedJobs.length === 0 ? (
                <div className="p-4 sm:p-8 text-center text-gray-500">
                  <ClipboardList className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No approved jobs</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Get started by approving or creating new job postings.
                  </p>
                </div>
              ) : (
                approvedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {job.title}
                          </h2>
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-3">
                          {job.description}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                          <span className="font-medium">{job.company}</span> •{" "}
                          {job.location}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Salary: {job.salary || "Not specified"}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Type: {job.jobType}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Deadline:{" "}
                          {job.applicationDeadline
                            ? new Date(
                                job.applicationDeadline
                              ).toLocaleDateString()
                            : "Not specified"}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Contact: {job.contactEmail || "Not specified"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <button
                          onClick={() => deleteJob(job._id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create Job Form */}
          {tab === "create" && (
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                Post a New Job
              </h2>

              <div
                onSubmit={(e) => {
                  e.preventDefault();
                  createJob();
                }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Job Title Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="title"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Job Title *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="title"
                      placeholder="Senior Behavior Analyst"
                      value={newJob.title}
                      onChange={(e) =>
                        setNewJob({ ...newJob, title: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-1">
                  <RichTextEditor
                    label="Description"
                    value={newJob.description}
                    onChange={(value) => setNewJob({ ...newJob, description: value })}
                    placeholder="Detailed job description, responsibilities, and requirements..."
                    required={true}
                    rows={6}
                    id="job-description-editor"
                  />
                </div>

                {/* Company and Location Fields */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {/* Company Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="company"
                      className="block text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Company *
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="company"
                        placeholder="Company name"
                        value={newJob.company}
                        onChange={(e) =>
                          setNewJob({ ...newJob, company: e.target.value })
                        }
                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Location Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="location"
                      className="block text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Location *
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="location"
                        placeholder="City, State or Remote"
                        value={newJob.location}
                        onChange={(e) =>
                          setNewJob({ ...newJob, location: e.target.value })
                        }
                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="salary"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Salary *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="salary"
                      placeholder="$50,000 - $70,000"
                      value={newJob.salary}
                      onChange={(e) =>
                        setNewJob({ ...newJob, salary: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Job Type Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="jobType"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Job Type *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="jobType"
                      value={newJob.jobType}
                      onChange={(e) =>
                        setNewJob({ ...newJob, jobType: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm appearance-none"
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Application Deadline Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="applicationDeadline"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Application Deadline *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="applicationDeadline"
                      value={newJob.applicationDeadline}
                      onChange={(e) =>
                        setNewJob({
                          ...newJob,
                          applicationDeadline: e.target.value,
                        })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Contact Email/Link Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="contactEmail"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Contact Email/Link *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="contactEmail"
                      placeholder="email@example.com or application link"
                      value={newJob.contactEmail}
                      onChange={(e) =>
                        setNewJob({ ...newJob, contactEmail: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={createJob}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="-ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                        Post Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
