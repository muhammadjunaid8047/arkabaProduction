"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  User, 
  Calendar,
  ArrowLeft,
  BookOpen,
  FileText
} from "lucide-react";
import { getVideoThumbnailFromUrl, detectVideoPlatform } from "@/lib/utils";

export default function VideoDetailPage() {
  const params = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/course-platform/public-courses/${params.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch video");
      }
      const data = await res.json();
      
      // Check if video is public
      if (!data.isPublic) {
        setError("This video is not available for public viewing");
        return;
      }
      
      setVideo(data);
      
      // Fetch thumbnail
      if (data.contentUrl) {
        try {
          const thumbnail = await getVideoThumbnailFromUrl(data.contentUrl);
          setThumbnailUrl(thumbnail);
        } catch (error) {
          console.error("Error fetching thumbnail:", error);
        }
      }
    } catch (err) {
      setError("Failed to load video");
      console.error("Error fetching video:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlatformInfo = (video) => {
    const platform = detectVideoPlatform(video.contentUrl);
    switch (platform) {
      case 'youtube':
        return { name: 'YouTube', icon: '🎥', color: 'bg-red-100 text-red-800' };
      case 'vimeo':
        return { name: 'Vimeo', icon: '🎬', color: 'bg-blue-100 text-blue-800' };
      case 'dailymotion':
        return { name: 'Dailymotion', icon: '📺', color: 'bg-purple-100 text-purple-800' };
      case 'direct':
        return { name: 'Video File', icon: '🎞️', color: 'bg-green-100 text-green-800' };
      default:
        return { name: 'Video', icon: '🎥', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Video Not Available</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/video"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </a>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Video Not Found</h2>
          <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
          <a
            href="/video"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </a>
        </div>
      </div>
    );
  }

  const platformInfo = getPlatformInfo(video);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/video"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Video Player */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
              {video.contentUrl ? (
                <iframe
                  src={video.contentUrl}
                  title={video.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : thumbnailUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-4">
                      <Play className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Play className="h-16 w-16 mx-auto mb-4" />
                  <p>Video content not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {video.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {video.description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Free
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${platformInfo.color}`}>
                  {platformInfo.icon} {platformInfo.name}
                </span>
              </div>
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">Instructor:</span>
                <span className="ml-2">{video.instructorName}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-medium">Published:</span>
                <span className="ml-2">{formatDate(video.createdAt)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-medium">CEUs:</span>
                <span className="ml-2">{video.totalCEUs}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="h-5 w-5 mr-2" />
                <span className="font-medium">Type:</span>
                <span className="ml-2 capitalize">{video.contentType}</span>
              </div>
            </div>

            {/* Additional Information */}
            {video.ethicsCEUs && video.ethicsCEUs !== "0.0" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">CEU Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total CEUs:</span>
                    <span className="font-medium">{video.totalCEUs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Ethics CEUs:</span>
                    <span className="font-medium">{video.ethicsCEUs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Supervision CEUs:</span>
                    <span className="font-medium">{video.supervisionCEUs}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Note for Public Viewing */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Public Access Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This video is available for public viewing. For CEU credits and additional features, 
                      please consider becoming an ArkABA member.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 