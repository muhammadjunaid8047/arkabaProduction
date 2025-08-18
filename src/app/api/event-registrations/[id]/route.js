import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import EventRegistration from "@/lib/models/eventRegistration";

export async function GET(request, { params }) {
  try {
    await connect();
    
    // Unwrap params for Next.js 15 compatibility
    const unwrappedParams = await params;
    
    const eventRegistration = await EventRegistration.findById(unwrappedParams.id)
      .populate('eventId', 'title date location description backgroundImage');
    
    if (!eventRegistration || !eventRegistration.isActive) {
      return NextResponse.json(
        { error: "Event registration not found or not active" },
        { status: 404 }
      );
    }

    // Check if registration is still open
    const now = new Date();
    if (eventRegistration.registrationDeadline < now) {
      return NextResponse.json(
        { error: "Registration has closed" },
        { status: 410 } // Gone
      );
    }

    // Check if event is full
    if (eventRegistration.maxAttendees && 
        eventRegistration.currentAttendees >= eventRegistration.maxAttendees) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 410 }
      );
    }
    
    return NextResponse.json({
      success: true,
      eventRegistration
    });
    
  } catch (error) {
    console.error("Error fetching event registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch event registration" },
      { status: 500 }
    );
  }
}
