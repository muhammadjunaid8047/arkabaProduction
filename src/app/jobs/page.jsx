"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || job.jobType === filterType;
    const matchesLocation =
      !filterLocation ||
      job.location.toLowerCase().includes(filterLocation.toLowerCase());

    return matchesSearch && matchesType && matchesLocation;
  });

  // Smart contact handling
  const handleContact = (contactEmail) => {
    if (!contactEmail) return;

    const isEmail = contactEmail.includes("@") && contactEmail.includes(".");

    if (isEmail) {
      window.open(`mailto:${contactEmail}?subject=Job Application`, "_blank");
    } else {
      window.open(contactEmail, "_blank");
    }
  };

  // Check if contact is available
  const isContactAvailable = (contactEmail) => {
    return contactEmail && contactEmail.trim() !== "";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if job is expired
  const isJobExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
              Job Opportunities
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-red-100 max-w-2xl mx-auto">
              Discover exciting career opportunities in the Arkansas ABA community
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm mb-4 sm:mb-6 overflow-hidden">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Job Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full h-9 sm:h-10 px-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                >
                  <option value="all">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <Input
                  placeholder="Filter by location..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilterType("all");
              setFilterLocation("");
            }}
            className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
          >
            Clear Filters
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-10 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                Loading jobs...
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Please wait while we fetch the latest job opportunities.
              </p>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-10 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                No jobs found
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 w-full flex flex-col overflow-hidden">
                  <CardHeader className="pb-2 sm:pb-3 md:pb-4 flex-shrink-0">
                    <div className="w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate flex-1">
                          {job.title}
                        </h3>
                        {job.approved && (
                          <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm flex-shrink-0 px-1.5 sm:px-2 py-0.5">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Approved
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{job.salary || "Salary not specified"}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{job.jobType}</span>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <div className="mb-1 sm:mb-2">
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      {/* Action Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {job.applicationDeadline
                                ? formatDate(job.applicationDeadline)
                                : "No deadline"}
                            </span>
                            {isJobExpired(job.applicationDeadline) && (
                              <Badge variant="destructive" className="text-xs px-1 py-0 flex-shrink-0">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {isContactAvailable(job.contactEmail) && (
                            <Button
                              size="sm"
                              onClick={() => handleContact(job.contactEmail)}
                              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 min-h-[36px]"
                            >
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Quick Apply
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px]"
                          >
                            {expandedJob === job._id ? (
                              <>
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                View Details
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {expandedJob === job._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0 border-t border-gray-100">
                          <div className="space-y-3 sm:space-y-4">
                            {/* Full Description */}
                            <div>
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">
                                Full Description
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words max-h-96 overflow-y-auto">
                                {job.description}
                              </p>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-gray-600 block">
                                    Deadline: {formatDate(job.applicationDeadline)}
                                  </span>
                                  {isJobExpired(job.applicationDeadline) && (
                                    <Badge variant="destructive" className="text-xs mt-1">
                                      Expired
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-gray-600 block">Contact:</span>
                                  <span className="text-gray-600 break-all line-clamp-2">
                                    {job.contactEmail || "Not provided"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
                              {isContactAvailable(job.contactEmail) ? (
                                <Button
                                  onClick={() => handleContact(job.contactEmail)}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-xs sm:text-sm py-1.5 sm:py-2 min-h-[36px]"
                                >
                                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  {job.contactEmail.includes("@") ? "Send Email" : "Apply Now"}
                                </Button>
                              ) : (
                                <Button
                                  disabled
                                  variant="outline"
                                  className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2 min-h-[36px]"
                                >
                                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  Contact Not Available
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                onClick={() => setExpandedJob(null)}
                                className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2 min-h-[36px]"
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}