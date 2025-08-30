import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import EventRegistration from "@/lib/models/eventRegistration";
import Event from "@/lib/models/event";

export async function GET(request, { params }) {
  try {
    await connect();

    const { id } = params; // ✅ use params directly

    const eventRegistration = await EventRegistration.findById(id)
      .populate("eventId", "title date location");

    if (!eventRegistration) {
      return NextResponse.json(
        { error: "Event registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      eventRegistration,
    });
  } catch (error) {
    console.error("Error fetching event registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch event registration" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connect();

    const { id } = params; // ✅ use params directly

    const body = await request.json();

    const {
      title,
      description,
      pricing,
      registrationDeadline,
      maxAttendees,
      requiresApproval,
      customFields,
      confirmationEmailTemplate,
      isActive,
    } = body;

    const eventRegistration = await EventRegistration.findByIdAndUpdate(
      id,
      {
        title,
        description,
        pricing,
        registrationDeadline: new Date(registrationDeadline),
        maxAttendees,
        requiresApproval,
        customFields,
        confirmationEmailTemplate,
        isActive,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!eventRegistration) {
      return NextResponse.json(
        { error: "Event registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      eventRegistration
    });
    
  } catch (error) {
    console.error("Error updating event registration:", error);
    return NextResponse.json(
      { error: "Failed to update event registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connect();

    const { id } = params; // ✅ fixed

    const eventRegistration = await EventRegistration.findById(id);
    if (!eventRegistration) {
      return NextResponse.json(
        { error: "Event registration not found" },
        { status: 404 }
      );
    }

    // Disable registration on the related event
    await Event.findByIdAndUpdate(eventRegistration.eventId, {
      registrationEnabled: false,
      registrationLink: "",
    });

    await EventRegistration.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Event registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event registration:", error);
    return NextResponse.json(
      { error: "Failed to delete event registration" },
      { status: 500 }
    );
  }
}
