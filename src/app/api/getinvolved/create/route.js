import { connect } from "@/lib/mongodb/mongoose";
import GetInvolved from "@/lib/models/getinvolved.model";
import { sendGetInvolvedFormEmails } from "@/lib/services/emailService";

export async function POST(req) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, joinCommittee, planEvents, offerCEU, supportAdvocacy, otherInterest } = data;

    await connect();

    // Save get involved form submission to database
    const newEntry = await GetInvolved.create(data);

    // Send emails to user and admin
    const emailResult = await sendGetInvolvedFormEmails({
      firstName,
      lastName,
      email,
      joinCommittee,
      planEvents,
      offerCEU,
      supportAdvocacy,
      otherInterest,
    });

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult);
      // Still return success for form submission even if email fails
      return new Response(
        JSON.stringify({ 
          message: "Form submitted successfully, but there was an issue sending confirmation emails",
          newEntry 
        }),
        { status: 201 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Form submitted successfully", newEntry }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

