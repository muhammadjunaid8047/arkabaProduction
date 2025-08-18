import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";

export async function GET(req, { params }) {
  try {
    await connect();
    console.log(`Fetching course with ID: ${params.courseId}`);
    const course = await Course.findById(params.courseId);
    if (!course) {
      console.warn(`Course not found: ${params.courseId}`);
      const allCourses = await Course.find({}, { _id: 1, title: 1 });
      console.log(
        "Available course IDs:",
        allCourses.map((c) => c._id.toString())
      );
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const currentDate = new Date();
    if (course.expirationDate && course.expirationDate < currentDate) {
      console.log(
        `Course expired: ${params.courseId}, expirationDate: ${course.expirationDate}`
      );
      return NextResponse.json(
        { error: "Course has expired" },
        { status: 410 }
      );
    }
    console.log(`Course found: ${params.courseId}`, {
      title: course.title,
      quizLength: course.quiz.length,
    });
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connect();
    console.log(`Deleting course with ID: ${params.courseId}`);
    
    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    await Course.findByIdAndDelete(params.courseId);
    console.log(`Course deleted successfully: ${params.courseId}`);
    
    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
