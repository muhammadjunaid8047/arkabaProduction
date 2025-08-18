"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { getVideoThumbnailFromUrl, detectVideoPlatform } from "@/lib/utils";

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState([]);
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/course-platform/courses");
        const data = await res.json();
        setCourses(data);
        
        // Fetch thumbnails for all courses
        await fetchThumbnails(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
    if (status === "authenticated") {
      fetchCourses();
    }
  }, [status]);

  const fetchThumbnails = async (courseList) => {
    const thumbnailPromises = courseList.map(async (course) => {
      if (course.contentUrl) {
        try {
          const thumbnailUrl = await getVideoThumbnailFromUrl(course.contentUrl);
          return { id: course._id, thumbnailUrl };
        } catch (error) {
          console.error(`Error fetching thumbnail for course ${course._id}:`, error);
          return { id: course._id, thumbnailUrl: null };
        }
      }
      return { id: course._id, thumbnailUrl: null };
    });

    const thumbnailResults = await Promise.all(thumbnailPromises);
    const thumbnailMap = {};
    thumbnailResults.forEach(({ id, thumbnailUrl }) => {
      thumbnailMap[id] = thumbnailUrl;
    });
    setThumbnails(thumbnailMap);
  };

  const getThumbnailUrl = (course) => {
    return thumbnails[course._id] || null;
  };

  const getPlatformIcon = (course) => {
    const platform = detectVideoPlatform(course.contentUrl);
    switch (platform) {
      case 'youtube':
        return '🎥 YouTube';
      case 'vimeo':
        return '🎬 Vimeo';
      case 'dailymotion':
        return '📺 Dailymotion';
      case 'direct':
        return '🎞️ Video File';
      default:
        return '🎥 Video';
    }
  };

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              You need to be logged in to view the CEU Library.
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

  if (courses.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-500">No courses available.</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-indigo-700 mb-10 text-center">
        CEU Library
      </h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const thumbnailUrl = getThumbnailUrl(course);
          const platformIcon = getPlatformIcon(course);
          
          return (
            <Link
              key={course._id}
              href={`/members-portal/course-platform/courses/${course._id}`}
              className="block bg-white border rounded-lg shadow hover:shadow-md hover:bg-indigo-50 transition overflow-hidden"
            >
              {/* Course Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to play icon if thumbnail fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${thumbnailUrl ? 'hidden' : 'flex'}`}>
                  <Play className="h-12 w-12 text-gray-400" />
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <Play className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                {/* Platform badge */}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {platformIcon}
                  </span>
                </div>
              </div>
              
              {/* Course Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {course.title} ({course.contentType})
                </h2>
                <p className="text-gray-600">
                  {course.description.slice(0, 100)}...
                </p>
                {course.expirationDate && (
                  <p className="text-sm text-gray-500 mt-2">
                    Expires: {new Date(course.expirationDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
