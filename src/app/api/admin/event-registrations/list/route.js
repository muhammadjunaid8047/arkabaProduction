import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import EventRegistration from "@/lib/models/eventRegistration";
import Registration from "@/lib/models/registration";

export async function GET(request) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    let query = {};
    if (eventId) {
      query.eventId = eventId;
    }
    
    const eventRegistrations = await EventRegistration.find(query)
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 });

    // Calculate current attendee count for each registration
    const registrationsWithAttendeeCount = await Promise.all(
      eventRegistrations.map(async (registration) => {
        const attendeeCount = await Registration.countDocuments({
          eventRegistrationId: registration._id,
          paymentStatus: 'completed'
        });
        
        return {
          ...registration.toObject(),
          currentAttendees: attendeeCount
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      eventRegistrations: registrationsWithAttendeeCount
    });
    
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch event registrations" },
      { status: 500 }
    );
  }
}
