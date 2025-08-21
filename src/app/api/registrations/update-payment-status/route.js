import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";

export async function POST(request) {
  try {
    await connect();
    const { registrationId, paymentIntentId, paymentStatus } = await request.json();
    
    if (!registrationId || !paymentStatus) {
      return NextResponse.json(
        { error: "Registration ID and payment status are required" },
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

    // Update payment status and payment intent ID if provided
    registration.paymentStatus = paymentStatus;
    if (paymentIntentId) {
      registration.paymentIntentId = paymentIntentId;
    }
    
    await registration.save();

    console.log(`Payment status updated for registration ${registrationId}: ${paymentStatus}`);

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully"
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
