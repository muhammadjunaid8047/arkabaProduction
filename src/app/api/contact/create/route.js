// src/app/api/contact/route.js

import { connect } from "@/lib/mongodb/mongoose";
import Contact from "@/lib/models/contact.model";

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

    await Contact.create({
      firstName,
      lastName,
      email,
      message,
      isArkansasSupervisor: Boolean(isArkansasSupervisor),
    });

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
