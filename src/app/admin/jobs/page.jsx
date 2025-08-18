"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("approval");
  const [jobs, setJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
  });

  const fetchJobs = async () => {
    const res = await fetch("/api/admin/job-board/jobs"); // <- FIXED
    const data = await res.json();
    setJobs(data.filter((job) => !job.approved)); // For approval tab
    setApprovedJobs(data.filter((job) => job.approved)); // For approved tab
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
    await fetch("/api/admin/job-board/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newJob),
    });
    setNewJob({ title: "", description: "", company: "", location: "" });
    setTab("approved"); // Switch to approved tab to see the job
    fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tab Menu */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("approval")}
          className={tab === "approval" ? "font-bold underline" : ""}
        >
          Jobs for Approval
        </button>
        <button
          onClick={() => setTab("approved")}
          className={tab === "approved" ? "font-bold underline" : ""}
        >
          Approved Jobs
        </button>
        <button
          onClick={() => setTab("create")}
          className={tab === "create" ? "font-bold underline" : ""}
        >
          Create Job
        </button>
      </div>

      {/* Jobs for Approval */}
      {tab === "approval" && (
        <div>
          {jobs.length === 0 ? (
            <p>No pending jobs.</p>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="border p-4 mb-4 rounded">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p>{job.description}</p>
                <p className="text-sm text-gray-500">
                  {job.company} - {job.location}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => approveJob(job._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved Jobs with CRUD */}
      {tab === "approved" && (
        <div>
          {approvedJobs.length === 0 ? (
            <p>No approved jobs.</p>
          ) : (
            approvedJobs.map((job) => (
              <div key={job._id} className="border p-4 mb-4 rounded">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p>{job.description}</p>
                <p className="text-sm text-gray-500">
                  {job.company} - {job.location}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  {/* Add Edit feature later */}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Job Form */}
      {tab === "create" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createJob();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Title"
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={newJob.description}
            onChange={(e) =>
              setNewJob({ ...newJob, description: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Company"
            value={newJob.company}
            onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={newJob.location}
            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Job
          </button>
        </form>
      )}
    </div>
  );
}
