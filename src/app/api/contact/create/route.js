// src/app/api/contact/route.js

import { connect } from "@/lib/mongodb/mongoose";
import Contact from "@/lib/models/contact.model";
import { sendContactFormEmails } from "@/lib/services/emailService";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message, isArkansasSupervisor } = body;

    if (!firstName || !lastName || !email || !message) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    await connect();

    // Save contact form submission to database
    await Contact.create({
      firstName,
      lastName,
      email,
      message,
      isArkansasSupervisor: Boolean(isArkansasSupervisor),
    });

    // Send emails to user and admin
    const emailResult = await sendContactFormEmails({
      firstName,
      lastName,
      email,
      message,
      isArkansasSupervisor: Boolean(isArkansasSupervisor),
    });

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult);
      // Still return success for form submission even if email fails
      return new Response(
        JSON.stringify({ 
          message: "Form submitted successfully, but there was an issue sending confirmation emails" 
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Form submitted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
