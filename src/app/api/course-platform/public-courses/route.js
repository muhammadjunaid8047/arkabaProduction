import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";

export async function GET() {
  try {
    await connect();
    const currentDate = new Date();
    const courses = await Course.find({
      isPublic: true,
      $or: [
        { expirationDate: { $gte: currentDate } },
        { expirationDate: null },
      ],
    }).sort({ createdAt: -1 }); // Sort by newest first
    return NextResponse.json(courses || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 