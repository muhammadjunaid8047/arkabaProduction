"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Users, 
  Building, 
  Award, 
  Mail, 
  Phone, 
  Globe, 
  Search,
  Filter,
  User,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DirectoryPage() {
  const { data: session, status } = useSession();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("students");

  useEffect(() => {
    if (session) {
      fetchDirectoryMembers();
    }
  }, [session]);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, tab, members]);

  const fetchDirectoryMembers = async () => {
    try {
      const response = await fetch("/api/member/directory");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      } else {
        console.error("Failed to fetch directory members");
      }
    } catch (error) {
      console.error("Error fetching directory members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members.filter(member => 
      member.shareInfoInternally === true
    );

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.affiliation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab/member type
    if (tab === "students") {
      filtered = filtered.filter(member => member.memberType === "member" || member.memberType === "student");
    } else if (tab === "business") {
      filtered = filtered.filter(member => member.memberType === "business");
    } else if (tab === "other") {
      filtered = filtered.filter(member => member.memberType === "supervisor" || (member.memberType !== "member" && member.memberType !== "student" && member.memberType !== "business"));
    }

    setFilteredMembers(filtered);
  };

  const getMemberTypeIcon = (type) => {
    switch (type) {
      case "business":
        return <Building className="h-5 w-5" />;
      case "supervisor":
        return <Award className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getMemberTypeColor = (type) => {
    switch (type) {
      case "business":
        return "bg-blue-100 text-blue-800";
      case "supervisor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getMemberTypeLabel = (type) => {
    switch (type) {
      case "business":
        return "Business";
      case "supervisor":
        return "Supervisor";
      default:
        return "Member";
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          <p className="text-lg text-muted-foreground">Loading directory...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need to be logged in to view the member directory.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Member Directory
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-100 max-w-3xl mx-auto">
          Connect with other ArkABA members who have opted to share their information
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
            <li>
              <a href="/members-portal" className="text-red-600 hover:text-red-800">
                Members Portal
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
            <li className="text-gray-500">Directory</li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border border-gray-200">
          <nav className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <button
              onClick={() => setTab("students")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "students"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Students
            </button>
            <button
              onClick={() => setTab("business")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "business"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building className="h-4 w-4 sm:h-5 sm:w-5" />
              Business
            </button>
            <button
              onClick={() => setTab("other")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "other"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              Supervisors
            </button>
          </nav>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by name, email, business, or affiliation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
            {/* Results Count */}
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredMembers.length} members
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
            <div className="p-4 sm:p-8 text-center text-gray-500">
              <Users className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No members found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search criteria"
                  : "No members have opted to share their information in this category yet"
            }
          </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getMemberTypeIcon(member.memberType)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {member.fullName} {member.lastName}
                        </CardTitle>
                        <Badge className={`mt-1 ${getMemberTypeColor(member.memberType)}`}>
                          {getMemberTypeLabel(member.memberType)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    
                    {member.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}

                    {member.affiliation && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{member.affiliation}</span>
                      </div>
                    )}
                  </div>

                  {/* Business Information */}
                  {member.memberType === "business" && (
                    <div className="pt-3 border-t border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-2">Business Details</h4>
                      <div className="space-y-2">
                        {member.businessName && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">{member.businessName}</span>
                          </div>
                        )}
                        
                        {member.businessWebsite && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Globe className="h-4 w-4" />
                            <a 
                              href={member.businessWebsite} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* BCBA Information */}
                  {member.bcba && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Award className="h-4 w-4" />
                        <span>BCBA: {member.bcba}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
              </div>
            </div>
      )}
        </div>
      </div>
    </div>
  );
}
