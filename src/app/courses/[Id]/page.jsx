"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/course-platform/courses/${courseId}`);
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (!course) {
    return <p className="text-center mt-10 text-gray-500">Loading course...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        {course.title}
      </h1>
      <p className="text-gray-700 mb-6">{course.description}</p>

      {course.videoUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Course Video</h2>
          <video controls className="w-full rounded">
            <source src={course.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {course.quiz && course.quiz.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Quiz</h2>
          <ul className="space-y-4">
            {course.quiz.map((q, index) => (
              <li key={index} className="border p-4 rounded">
                <p className="font-medium">
                  {index + 1}. {q.question}
                </p>
                <ul className="ml-4 mt-2 list-disc text-sm text-gray-600">
                  {q.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
