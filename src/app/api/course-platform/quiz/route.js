// /api/course-platform/courses/route.js
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";
import csvToJSON from "@/lib/csvToJson";

export async function POST(req) {
  try {
    await connect();
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const videoUrl = formData.get("videoUrl");
    const csvFile = formData.get("quizFile");

    if (!title || !description || !videoUrl || !csvFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const csvText = await csvFile.text();
    const quiz = csvToJSON(csvText);

    const newCourse = await Course.create({
      title,
      description,
      videoUrl,
      quiz,
    });
    return NextResponse.json(newCourse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connect();
    const courses = await Course.find().sort({ createdAt: -1 }); // Sort by newest first
    return NextResponse.json(courses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
