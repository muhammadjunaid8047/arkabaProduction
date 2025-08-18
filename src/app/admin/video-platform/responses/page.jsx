"use client";
import { useEffect, useState } from "react";

export default function QuizResponsesPage() {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    async function fetchResponses() {
      const res = await fetch("/api/course-platform/responses");
      const data = await res.json();
      setResponses(data);
    }
    fetchResponses();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Quiz Responses</h2>
      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Student Name</th>
              <th className="border p-2">Course Title</th>
              <th className="border p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((res, idx) => (
              <tr key={idx}>
                <td className="border p-2">{res.studentName}</td>
                <td className="border p-2">{res.courseTitle}</td>
                <td className="border p-2">{res.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
