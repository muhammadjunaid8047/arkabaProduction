"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentType, setContentType] = useState("video");
  const [expirationDate, setExpirationDate] = useState("");
  const [quizFile, setQuizFile] = useState(null);
  const [parsedQuiz, setParsedQuiz] = useState([]);
  const [quizResponses, setQuizResponses] = useState([]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    setQuizFile(file);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const quizData = results.data.map((row) => ({
          question: row.question,
          options: [row.option1, row.option2, row.option3, row.option4].filter(
            Boolean
          ),
          correctAnswer: row.correctAnswer,
        }));
        setParsedQuiz(quizData);
      },
    });
  };

  const handleCreateCourse = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("contentUrl", contentUrl);
      formData.append("contentType", contentType);
      formData.append("expirationDate", expirationDate);
      formData.append("quizFile", quizFile);

      await axios.post("/api/course-platform/courses", formData);
      alert("Content created successfully!");
      setTitle("");
      setDescription("");
      setContentUrl("");
      setContentType("video");
      setExpirationDate("");
      setQuizFile(null);
      setParsedQuiz([]);
    } catch (err) {
      console.error(err);
      alert("Failed to create content.");
    }
  };

  const loadQuizResponses = async () => {
    try {
      const res = await axios.get("/api/course-platform/responses");
      setQuizResponses(res.data);
    } catch (err) {
      console.error("Failed to fetch responses:", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "admin") {
      loadQuizResponses();
    }
  }, [status, session]);

  if (status !== "authenticated" || session?.user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Only admins can access this page.
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Panel</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="course">Course</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Content URL
              </label>
              <input
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Quiz CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                required
              />
            </div>
            <Button onClick={handleCreateCourse}>Create Content</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Quiz Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {quizResponses.length === 0 ? (
            <p>No responses yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Member ID</th>
                  <th className="p-2 text-left">Course</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Passed</th>
                  <th className="p-2 text-left">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {quizResponses.map((res, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{res.userId}</td>
                    <td className="p-2">{res.courseTitle}</td>
                    <td className="p-2">
                      {res.score} / {res.total}
                    </td>
                    <td className="p-2">{res.passed ? "Yes" : "No"}</td>
                    <td className="p-2">
                      {res.certificateUrl ? (
                        <a
                          href={res.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
