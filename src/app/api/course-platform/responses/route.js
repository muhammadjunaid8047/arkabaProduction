import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import QuizResponse from "@/lib/models/quizResponse";

export async function GET(req) {
  try {
    await connect();
    // Fetch all quiz responses sorted by creation date (newest first)
    const responses = await QuizResponse.find({})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .populate('courseId', 'title description');

    // Transform the data to include all relevant details
    const formattedResponses = responses.map(response => ({
      _id: response._id,
      studentName: response.studentName || 'Unknown',
      courseTitle: response.courseTitle,
      courseDescription: response.courseId?.description || '',
      score: response.score,
      total: response.total,
      passed: response.passed,
      certificateUrl: response.certificateUrl,
      createdAt: response.createdAt,
      percentage: response.total > 0 ? Math.round((response.score / response.total) * 100) : 0
    }));

    return NextResponse.json(formattedResponses || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz responses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
