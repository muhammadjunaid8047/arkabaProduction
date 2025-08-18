import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event";

export async function PUT(request, { params }) {
  try {
    await connect();
    const { id } = params;
    const body = await request.json();
    
    const { 
      title, 
      description, 
      backgroundImage, 
      date, 
      location, 
      isBannerEvent, 
      isActive,
      registrationEnabled,
      registrationLink,
      registrationDeadline,
      eventStatus
    } = body;
    
    // Auto-manage event status based on registration deadline
    let finalEventStatus = eventStatus || "upcoming";
    if (registrationEnabled && registrationDeadline) {
      const deadline = new Date(registrationDeadline);
      const now = new Date();
      if (deadline < now) {
        finalEventStatus = "registration-closed";
      } else {
        finalEventStatus = "registration-open";
      }
    }

    
    const updateData = {
      title,
      description,
      backgroundImage,
      date: new Date(date),
      location,
      isBannerEvent,
      isActive,
      registrationEnabled: registrationEnabled || false,
      registrationLink: registrationLink || "",
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      eventStatus: finalEventStatus,
      updatedAt: new Date(),
    };

    
    // Update the event - for existing documents without new fields, we need to force add them
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, strict: false }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
} 