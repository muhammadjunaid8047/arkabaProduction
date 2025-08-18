"use client";

export const dynamic = 'force-dynamic';

import { Briefcase, MapPin, Clock, DollarSign, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs with client-side rendering
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs", { cache: "no-store" });
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Matching Your Style */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Career Opportunities</h1>
          <p className="text-xl sm:text-2xl text-red-100 max-w-3xl mx-auto">
            Join our team and make a difference in behavioral health
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter/Search Bar (optional) */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No current openings</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
                      <Briefcase className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                      <p className="mt-1 text-sm text-gray-600">{job.company}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-700 line-clamp-3">{job.description}</p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span>{job.type || 'Full-time'}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <a
                      href={`/contact`} // Or your apply route
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Apply Now
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}