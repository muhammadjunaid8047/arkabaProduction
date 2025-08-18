import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";

export async function PATCH(req, { params }) {
  try {
    await connect();
    const { courseId } = params;
    const { isPublic } = await req.json();

    const course = await Course.findByIdAndUpdate(
      courseId,
      { isPublic },
      { new: true }
    );

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("Error updating course public status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 