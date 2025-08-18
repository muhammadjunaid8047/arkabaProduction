import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";

export async function GET(request, { params }) {
  try {
    await connect();
    
    // Unwrap params for Next.js 15 compatibility
    const unwrappedParams = await params;
    
    const registration = await Registration.findById(unwrappedParams.id)
      .populate({
        path: 'eventRegistrationId',
        populate: {
          path: 'eventId',
          select: 'title date location'
        }
      });
    
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registration
    });
    
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}
