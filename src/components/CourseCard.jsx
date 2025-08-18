"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseCard({ course }) {
  const router = useRouter();

  return (
    <div
      className="border rounded p-4 shadow hover:shadow-lg transition cursor-pointer"
      onClick={() => router.push(`/courses/${course._id}`)}
    >
      <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
      <p className="text-gray-600">{course.description}</p>
      <Link href={`/course-platform/${course._id}`}>Learn More</Link>
    </div>
  );
}
