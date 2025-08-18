import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import EventRegistration from "@/lib/models/eventRegistration";
import Event from "@/lib/models/event";

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    
    const { 
      eventId,
      title,
      description,
      pricing,
      registrationDeadline,
      maxAttendees,
      customFields,
      confirmationEmailTemplate
    } = body;

    // Handle standalone registrations (no event linked)
    if (!eventId) {
      // Create standalone registration without event link
      const eventRegistration = new EventRegistration({
        title,
        description,
        pricing: {
          student: pricing.student || 10,
          full: pricing.full || 50,
          affiliate: pricing.affiliate || 30,
          nonMember: pricing.nonMember || 100
        },
        registrationDeadline: new Date(registrationDeadline),
        maxAttendees: maxAttendees || null,
        customFields: customFields || [],
        confirmationEmailTemplate: confirmationEmailTemplate || ""
      });

      await eventRegistration.save();

      return NextResponse.json({
        success: true,
        eventRegistration,
        message: "Standalone registration created successfully"
      });
    }

    // Validate that the event exists for linked registrations
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Create the event registration
    const eventRegistration = new EventRegistration({
      eventId,
      title,
      description,
      pricing: {
        student: pricing.student || 10,
        full: pricing.full || 50,
        affiliate: pricing.affiliate || 30,
        nonMember: pricing.nonMember || 100
      },
      registrationDeadline: new Date(registrationDeadline),
      maxAttendees: maxAttendees || null,
      customFields: customFields || [],
      confirmationEmailTemplate: confirmationEmailTemplate || ""
    });

    await eventRegistration.save();

    // Update the event to enable registration and link to this registration
    await Event.findByIdAndUpdate(eventId, {
      registrationEnabled: true,
      registrationLink: `/events/${eventId}/register/${eventRegistration._id}`
    });

    return NextResponse.json({
      success: true,
      eventRegistration
    });

  } catch (error) {
    console.error("Error creating event registration:", error);
    return NextResponse.json(
      { error: "Failed to create event registration" },
      { status: 500 }
    );
  }
}
