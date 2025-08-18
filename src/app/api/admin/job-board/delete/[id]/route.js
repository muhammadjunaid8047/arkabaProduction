import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";

export async function DELETE(req, { params }) {
  await connect();
  await Job.findByIdAndDelete(params.id);
  return Response.json({ message: "Job deleted" });
}
