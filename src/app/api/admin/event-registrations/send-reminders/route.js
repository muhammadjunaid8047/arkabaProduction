import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";
import { sendEventRegistrationReminder } from "@/lib/services/emailService";

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { eventRegistrationId, eventDate } = body;

    if (!eventRegistrationId || !eventDate) {
      return NextResponse.json(
        { error: "Event registration ID and event date are required" },
        { status: 400 }
      );
    }

    // Find all registrations for this event
    const registrations = await Registration.find({
      eventRegistrationId,
      paymentStatus: 'completed'
    }).populate({
      path: 'eventRegistrationId',
      populate: {
        path: 'eventId',
        select: 'title date location'
      }
    });

    if (registrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No confirmed registrations found for this event",
        remindersSent: 0
      });
    }

    // Send reminder emails
    const emailResults = [];
    let successCount = 0;
    let failureCount = 0;

    for (const registration of registrations) {
      try {
        const result = await sendEventRegistrationReminder(registration);
        if (result.success) {
          successCount++;
          emailResults.push({
            registrationId: registration._id,
            email: registration.email,
            status: 'sent'
          });
        } else {
          failureCount++;
          emailResults.push({
            registrationId: registration._id,
            email: registration.email,
            status: 'failed',
            error: result.error
          });
        }
      } catch (error) {
        failureCount++;
        emailResults.push({
          registrationId: registration._id,
          email: registration.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminder emails sent: ${successCount} successful, ${failureCount} failed`,
      totalRegistrations: registrations.length,
      remindersSent: successCount,
      remindersFailed: failureCount,
      results: emailResults
    });

  } catch (error) {
    console.error("Error sending reminder emails:", error);
    return NextResponse.json(
      { error: "Failed to send reminder emails" },
      { status: 500 }
    );
  }
}
