import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";

export async function GET(request, { params }) {
  try {
    await connect();
    
    // Unwrap params for Next.js 15 compatibility
    const unwrappedParams = await params;
    
    const registrations = await Registration.find({
      eventRegistrationId: unwrappedParams.id 
    }).sort({ registeredAt: -1 });
    
    return NextResponse.json({
      success: true,
      attendees: registrations
    });
    
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
