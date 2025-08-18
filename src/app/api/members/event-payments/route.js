import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connect();
    
    // Fetch all registrations for the current user
    const registrations = await Registration.find({ 
      userId: session.user.id 
    })
    .populate({
      path: 'eventRegistrationId',
      populate: {
        path: 'eventId',
        select: 'title date location'
      }
    })
    .sort({ registeredAt: -1 });
    
    return NextResponse.json({
      success: true,
      payments: registrations
    });
    
  } catch (error) {
    console.error("Error fetching event payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event payments" },
      { status: 500 }
    );
  }
}
