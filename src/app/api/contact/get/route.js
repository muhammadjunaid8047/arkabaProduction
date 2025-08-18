import { connect } from "@/lib/mongodb/mongoose";
import Contact from "@/lib/models/contact.model"; // your Mongoose model

export async function GET() {
  await connect();
  const data = await Contact.find().lean();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
