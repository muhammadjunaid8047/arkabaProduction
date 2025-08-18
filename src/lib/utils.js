import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube video ID or null if not found
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extracts Vimeo video ID from Vimeo URL
 * @param {string} url - Vimeo URL
 * @returns {string|null} - Vimeo video ID or null if not found
 */
export function extractVimeoVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extracts Dailymotion video ID from Dailymotion URL
 * @param {string} url - Dailymotion URL
 * @returns {string|null} - Dailymotion video ID or null if not found
 */
export function extractDailymotionVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /dailymotion\.com\/video\/([^\/\?]+)/,
    /dailymotion\.com\/embed\/video\/([^\/\?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generates YouTube thumbnail URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality ('default', 'medium', 'high', 'maxres')
 * @returns {string} - YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId, quality = 'maxres') {
  if (!videoId) return null;
  
  const qualities = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg'
  };
  
  const qualitySuffix = qualities[quality] || qualities.maxres;
  return `https://img.youtube.com/vi/${videoId}/${qualitySuffix}`;
}

/**
 * Generates Vimeo thumbnail URL from video ID
 * @param {string} videoId - Vimeo video ID
 * @param {string} size - Thumbnail size ('small', 'medium', 'large')
 * @returns {Promise<string>} - Promise that resolves to Vimeo thumbnail URL
 */
export async function getVimeoThumbnail(videoId, size = 'large') {
  if (!videoId) return null;
  
  try {
    // Vimeo requires an API call to get thumbnail URLs
    const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data[0]) {
      const video = data[0];
      const sizes = {
        small: video.thumbnail_small,
        medium: video.thumbnail_medium,
        large: video.thumbnail_large
      };
      return sizes[size] || video.thumbnail_large;
    }
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error);
  }
  
  return null;
}

/**
 * Generates Dailymotion thumbnail URL from video ID
 * @param {string} videoId - Dailymotion video ID
 * @param {string} size - Thumbnail size ('small', 'medium', 'large')
 * @returns {string} - Dailymotion thumbnail URL
 */
export function getDailymotionThumbnail(videoId, size = 'large') {
  if (!videoId) return null;
  
  const sizes = {
    small: '120x90',
    medium: '480x360',
    large: '720x405'
  };
  
  const sizeSuffix = sizes[size] || sizes.large;
  return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
}

/**
 * Generates thumbnail URL from video URL (supports multiple platforms)
 * @param {string} url - Video URL
 * @param {string} quality - Thumbnail quality/size
 * @returns {Promise<string|null>} - Promise that resolves to thumbnail URL or null
 */
export async function getVideoThumbnailFromUrl(url, quality = 'maxres') {
  if (!url) return null;
  
  // Check for YouTube
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    return getYouTubeThumbnail(youtubeId, quality);
  }
  
  // Check for Vimeo
  const vimeoId = extractVimeoVideoId(url);
  if (vimeoId) {
    return await getVimeoThumbnail(vimeoId, quality === 'maxres' ? 'large' : quality);
  }
  
  // Check for Dailymotion
  const dailymotionId = extractDailymotionVideoId(url);
  if (dailymotionId) {
    return getDailymotionThumbnail(dailymotionId, quality === 'maxres' ? 'large' : quality);
  }
  
  // For direct video files or unsupported platforms, return null
  return null;
}

/**
 * Generates YouTube thumbnail URL from YouTube URL (synchronous version)
 * @param {string} url - YouTube URL
 * @param {string} quality - Thumbnail quality
 * @returns {string|null} - YouTube thumbnail URL or null if not found
 */
export function getYouTubeThumbnailFromUrl(url, quality = 'maxres') {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return getYouTubeThumbnail(videoId, quality);
}

/**
 * Detects video platform from URL
 * @param {string} url - Video URL
 * @returns {string|null} - Platform name ('youtube', 'vimeo', 'dailymotion', 'direct') or null
 */
export function detectVideoPlatform(url) {
  if (!url) return null;
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  if (url.includes('dailymotion.com')) {
    return 'dailymotion';
  }
  
  if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
    return 'direct';
  }
  
  return null;
}
