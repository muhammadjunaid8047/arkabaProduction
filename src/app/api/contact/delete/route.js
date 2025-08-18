import { connect } from "@/lib/mongodb/mongoose";
import Contact from "@/lib/models/contact.model";

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: "Contact ID is required" }),
        { status: 400 }
      );
    }

    await connect();

    const deletedContact = await Contact.findByIdAndDelete(id);
    
    if (!deletedContact) {
      return new Response(
        JSON.stringify({ message: "Contact not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Contact deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact deletion error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
