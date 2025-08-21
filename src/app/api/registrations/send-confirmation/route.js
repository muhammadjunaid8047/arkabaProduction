import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";
import { sendEventRegistrationConfirmation } from "@/lib/services/emailService";

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { registrationId } = body;
    
    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Find the registration
    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Send confirmation email
    const emailResult = await sendEventRegistrationConfirmation(registration);
    
    if (emailResult.success) {
      console.log('Event registration confirmation email sent successfully to:', registration.email);
      return NextResponse.json({
        success: true,
        message: "Confirmation email sent successfully"
      });
    } else {
      console.error('Failed to send event registration confirmation email:', emailResult.error);
      return NextResponse.json(
        { error: `Failed to send confirmation email: ${emailResult.error}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
