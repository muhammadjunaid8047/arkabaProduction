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
    let videoUrl = formData.get("videoUrl");
    const csvFile = formData.get("quizFile");

    if (!title || !description || !videoUrl || !csvFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate and transform videoUrl
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/)?([a-zA-Z0-9_-]{11})(\?.*)?$/;
    const match = videoUrl.match(youtubeRegex);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }
    const videoId = match[5];
    videoUrl = `https://www.youtube.com/embed/${videoId}`;

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
