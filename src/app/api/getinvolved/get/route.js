import { connect } from "@/lib/mongodb/mongoose";
import GetInvolved from "@/lib/models/getinvolved.model"; // your Mongoose model

export async function GET() {
  await connect();
  const data = await GetInvolved.find().lean();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
