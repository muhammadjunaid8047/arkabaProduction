import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";

export async function GET(req, { params }) {
  try {
    await connect();
    console.log(`Fetching public course with ID: ${params.id}`);
    const course = await Course.findById(params.id);
    
    if (!course) {
      console.warn(`Course not found: ${params.id}`);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    // Check if course is public
    if (!course.isPublic) {
      console.log(`Course is not public: ${params.id}`);
      return NextResponse.json(
        { error: "This course is not available for public viewing" },
        { status: 403 }
      );
    }
    
    const currentDate = new Date();
    if (course.expirationDate && course.expirationDate < currentDate) {
      console.log(
        `Course expired: ${params.id}, expirationDate: ${course.expirationDate}`
      );
      return NextResponse.json(
        { error: "Course has expired" },
        { status: 410 }
      );
    }
    
    console.log(`Public course found: ${params.id}`, {
      title: course.title,
      isPublic: course.isPublic,
    });
    
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("Error fetching public course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 