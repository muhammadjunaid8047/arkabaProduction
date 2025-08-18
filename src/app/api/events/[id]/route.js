import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event.js";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: "Event ID is required" }),
        { status: 400 }
      );
    }

    await connect();

    const event = await Event.findById(id);
    
    if (!event) {
      return new Response(
        JSON.stringify({ message: "Event not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ event }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
