"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { getVideoThumbnailFromUrl, detectVideoPlatform } from "@/lib/utils";

export default function CoursePage() {
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [passed, setPassed] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        console.log(`Fetching course with ID: ${params.id}`);
        const res = await fetch(`/api/course-platform/courses/${params.id}`);
        if (!res.ok) {
          console.error(`Fetch failed with status: ${res.status}`);
          setError(`Failed to fetch course: ${res.status}`);
          return notFound();
        }
        const data = await res.json();
        console.log("Fetched course data:", data);
        if (!data || data.error) {
          console.error("Invalid course data:", data);
          setError(data.error || "No course data returned");
          return notFound();
        }
        setCourse(data);
        setError(null);
        
        // Fetch thumbnail
        if (data.contentUrl) {
          try {
            const thumbnail = await getVideoThumbnailFromUrl(data.contentUrl);
            setThumbnailUrl(thumbnail);
          } catch (error) {
            console.error("Error fetching thumbnail:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError(error.message);
        notFound();
      }
    }
    fetchCourse();
  }, [params.id]);

  const getEmbedUrl = (url, type) => {
    // Handle already embedded URL
    if (url.includes("youtube.com/embed/")) return url;

    // Convert watch?v= style URLs
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Support youtu.be short links
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Handle Vimeo URLs
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Handle other video platforms that support iframe embedding
    if (url.includes("dailymotion.com/")) {
      const videoId = url.split("dailymotion.com/video/")[1]?.split("?")[0];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    return url || "";
  };

  const isVideoUrl = (url) => {
    return url && (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes("dailymotion.com") ||
      url.includes(".mp4") ||
      url.includes(".webm") ||
      url.includes(".ogg")
    );
  };

  const getPlatformInfo = (course) => {
    const platform = detectVideoPlatform(course.contentUrl);
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

  const handleAnswerChange = (questionIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const [studentName, setStudentName] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError("");
    try {
      console.log("Submitting quiz");
      console.log("Course ID:", params.id);
      console.log("Answers:", answers);
      console.log("Student Name:", studentName);
      
      const res = await fetch("/api/course-platform/submit-quiz", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          courseId: params.id,
          answers,
          userId: "anonymous",
          studentName: studentName || "Student Name",
        }),
      });
      
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      
      if (res.ok) {
        setScore(data.score);
        setPassed(data.passed);
        setCertificateUrl(data.certificateUrl);
        setSubmitted(true);
      } else {
        console.error("Quiz submission error:", data.error);
        setSubmissionError(data.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setSubmissionError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  if (!course) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  const platformInfo = getPlatformInfo(course);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-700 mb-6">{course.description}</p>

      {isVideoUrl(course.contentUrl) ? (
        <div className="aspect-video mb-8">
          <iframe
            src={getEmbedUrl(course.contentUrl, course.contentType)}
            title="Course Video"
            className="w-full h-full rounded-md shadow"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>
      ) : course.contentType === "podcast" && !isVideoUrl(course.contentUrl) ? (
        <div className="mb-8">
          <audio controls className="w-full">
            <source src={course.contentUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : thumbnailUrl ? (
        <div className="mb-8">
          <div className="aspect-video bg-gray-900 rounded-md shadow overflow-hidden relative">
            <img
              src={thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-full p-4">
                <Play className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            {/* Platform badge */}
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${platformInfo.color}`}>
                {platformInfo.icon} {platformInfo.name}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Video content available at: {course.contentUrl}
          </p>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700 mb-2">
            <strong>Content URL:</strong> {course.contentUrl}
          </p>
          <p className="text-sm text-gray-500">
            This content type ({course.contentType}) requires external access.
          </p>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Quiz</h2>
      
      {!submitted && (
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (for certificate)
            </label>
            <input
              type="text"
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Removed BACB certification number input field */}
        </div>
      )}
     
     <div className="space-y-6">
       {course.quiz.map((q, index) => (
        <div key={index} className="p-4 border rounded-xl shadow-sm">
          <p className="font-medium mb-2">
            {index + 1}. {q.question}
          </p>
          <ul className="space-y-1">
            {q.options.map((opt, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q-${index}`}
                  value={opt}
                  checked={answers[index] === opt}
                  onChange={() => handleAnswerChange(index, opt)}
                  disabled={submitted}
                  className="h-4 w-4 text-indigo-600"
                />
                <label>{opt}</label>
                {submitted && (
                  <span
                    className={`ml-2 ${
                      opt === q.correctAnswer
                        ? "text-green-500"
                        : answers[index] === opt
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {opt === q.correctAnswer
                      ? "✓ Correct"
                      : answers[index] === opt
                      ? "✗ Incorrect"
                      : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {!submitted ? (
      <div className="mt-6">
        {submissionError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {submissionError}
          </div>
        )}
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== course.quiz.length || isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
              Submitting...
            </>
          ) : (
            "Submit Quiz"
          )}
        </Button>
      </div>
    ) : (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Quiz Results</h3>
        <p className="text-green-700">
          Score: {Math.round((score / course.quiz.length) * 100)}% ({score}/{course.quiz.length} correct)
        </p>
        <p className="text-green-700">
          Status: {passed ? "Passed" : "Failed"} (Minimum 80% required to pass)
        </p>
        {passed && certificateUrl && (
          <div className="mt-4">
            <a
              href={certificateUrl.replace('/api/certificates/', '/api/certificates/pdf/')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Certificate as PDF
            </a>
          </div>
        )}
      </div>
    )}
  </div>
  );
}
