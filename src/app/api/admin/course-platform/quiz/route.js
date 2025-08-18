// /api/course-platform/quiz/route.js
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";

export async function GET(req) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    await connect();
    const course = await Course.findById(id);
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    return NextResponse.json(course.quiz);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
