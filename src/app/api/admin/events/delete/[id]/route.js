import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event";

export async function DELETE(request, { params }) {
  try {
    await connect();
    // Unwrap params for Next.js 15 compatibility
    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
} 