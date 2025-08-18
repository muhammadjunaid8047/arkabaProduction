import { connect } from "@/lib/mongodb/mongoose";
import GetInvolved from "@/lib/models/getinvolved.model";

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    await connect();
    const deletedEntry = await GetInvolved.findByIdAndDelete(id);

    if (!deletedEntry) {
      return new Response(JSON.stringify({ error: "Entry not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Entry deleted successfully", deletedEntry }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
