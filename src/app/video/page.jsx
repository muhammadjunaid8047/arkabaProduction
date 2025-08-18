"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  User, 
  Calendar,
  Eye,
  BookOpen
} from "lucide-react";
import { getVideoThumbnailFromUrl, detectVideoPlatform } from "@/lib/utils";

export default function PublicVideoPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    fetchPublicVideos();
  }, []);

  const fetchPublicVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/course-platform/public-courses");
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await res.json();
      setVideos(data);
      
      // Fetch thumbnails for all videos
      await fetchThumbnails(data);
    } catch (err) {
      setError("Failed to load videos");
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThumbnails = async (videoList) => {
    const thumbnailPromises = videoList.map(async (video) => {
      if (video.contentUrl) {
        try {
          const thumbnailUrl = await getVideoThumbnailFromUrl(video.contentUrl);
          return { id: video._id, thumbnailUrl };
        } catch (error) {
          console.error(`Error fetching thumbnail for video ${video._id}:`, error);
          return { id: video._id, thumbnailUrl: null };
        }
      }
      return { id: video._id, thumbnailUrl: null };
    });

    const thumbnailResults = await Promise.all(thumbnailPromises);
    const thumbnailMap = {};
    thumbnailResults.forEach(({ id, thumbnailUrl }) => {
      thumbnailMap[id] = thumbnailUrl;
    });
    setThumbnails(thumbnailMap);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getThumbnailUrl = (video) => {
    return thumbnails[video._id] || null;
  };

  const getPlatformIcon = (video) => {
    const platform = detectVideoPlatform(video.contentUrl);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPublicVideos}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Educational Videos
            </h1>
            <p className="text-xl sm:text-2xl text-red-100 max-w-3xl mx-auto">
              Access free educational content from ArkABA
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No videos available</h3>
            <p className="mt-2 text-gray-600">Check back later for new educational content.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => {
              const thumbnailUrl = getThumbnailUrl(video);
              const platformIcon = getPlatformIcon(video);
              
              return (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={video.title}
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
                          <Play className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Free
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {platformIcon}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{video.instructorName}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{video.totalCEUs} CEUs</span>
                      </div>
                      
                      <a
                        href={`/video/${video._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Watch
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 