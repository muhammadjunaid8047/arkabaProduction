import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event";

export async function POST(request) {
  try {
    await connect();
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
    
    const eventData = {
      title,
      description,
      backgroundImage,
      date: new Date(date),
      location,
      isBannerEvent: isBannerEvent || false,
      isActive: isActive !== undefined ? isActive : true,
      registrationEnabled: registrationEnabled || false,
      registrationLink: registrationLink || "",
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      eventStatus: finalEventStatus,
    };

    
    const event = await Event.create(eventData);

    return NextResponse.json({ message: "Event created successfully", event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
} 