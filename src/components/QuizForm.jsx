"use client";

import { useState } from "react";

export default function QuizForm({ quiz, courseId }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [name, setName] = useState("");

  const handleChange = (question, answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/course-platform/submit-quiz", {
      method: "POST",
      body: JSON.stringify({
        name,
        courseId,
        answers,
      }),
    });
    const data = await res.json();
    setScore(data.score);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold text-green-600">Quiz Submitted!</h2>
        <p className="text-lg mt-2">Your Score: {score}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 font-semibold">Your Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {quiz.map((item, index) => (
        <div key={index} className="border p-4 rounded shadow-sm">
          <p className="font-medium">{item.question}</p>
          {item.options.map((opt, i) => (
            <label key={i} className="block mt-1">
              <input
                type="radio"
                name={item.question}
                value={opt}
                onChange={() => handleChange(item.question, opt)}
                required
              />{" "}
              {opt}
            </label>
          ))}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Quiz
      </button>
    </form>
  );
}
