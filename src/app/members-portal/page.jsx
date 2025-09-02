"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, LogOut, Home, BookOpen, Users, Settings, Award, Calendar, Clock } from "lucide-react";

export default function MembersPage({ children }) {
  const { data: session, status } = useSession();
  const [quizResponses, setQuizResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizResponses() {
      if (session) {
        try {
          setLoading(true);
          const res = await fetch("/api/course-platform/members-quiz-response");
          if (res.ok) {
            const data = await res.json();
            const passedQuizzes = data
              .filter(response => response.passed && response.certificateUrl)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setQuizResponses(passedQuizzes);
          } else {
            console.error("Failed to fetch quiz responses:", res.status);
          }
        } catch (error) {
          console.error("Error fetching quiz responses:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchQuizResponses();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-red-600" />
          <p className="text-base sm:text-lg text-muted-foreground">
            Loading user session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-2 text-sm sm:text-base text-muted-foreground">
              You need to be logged in to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => signIn("credentials", { callbackUrl: "/members-portal" })}
              className="w-full py-3 text-base sm:text-lg min-h-[48px]"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          Members Portal
        </h1>
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">
              Welcome, {session.user.name}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Explore the CEU Library and your earned certificates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                <h3 className="text-lg sm:text-xl font-semibold">Your Earned Certificates</h3>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-colors text-sm min-h-[44px]"
                aria-label="Refresh certificates"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs sm:text-sm text-blue-700">
                <strong>Note:</strong> Certificates are automatically updated with the latest course information whenever you retake a quiz. 
                Each certificate includes a unique ID and completion date.
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-4 sm:py-8">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-red-600 mr-2" />
                <span className="text-sm sm:text-base">Loading your certificates...</span>
              </div>
            ) : quizResponses.length === 0 ? (
              <div className="text-center py-4 sm:py-8">
                <Award className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-4">
                  You haven't earned any certificates yet.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Complete courses and pass quizzes to earn your certificates.
                </p>
                <Link
                  href="/members-portal/course-platform/courses"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors min-h-[48px]"
                >
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Browse CEU Library
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {quizResponses.map((response, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0"> {/* min-w-0 ensures flex shrinkage */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                          <h4
                            className="text-base sm:text-lg font-semibold text-gray-900 max-w-[80%] sm:max-w-[70%] flex-wrap"
                            title={response.courseTitle} // Tooltip for full title
                          >
                            {response.courseTitle}
                          </h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0">
                            Passed
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span
                              className="flex-wrap max-w-[150px] sm:max-w-[200px]"
                              title={response.studentName} 
                            >
                              {response.studentName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>Score: {response.score}/{response.total}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-green-600">
                              {response.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                        <a
                          href={response.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors text-sm min-h-[44px]"
                          aria-label={`View certificate for ${response.courseTitle}`}
                        >
                          <Award className="h-4 w-4" aria-hidden="true" />
                          View Certificate
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}