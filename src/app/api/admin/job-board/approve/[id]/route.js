import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";

export async function PATCH(req, { params }) {
  await connect();
  const job = await Job.findByIdAndUpdate(
    params.id,
    { approved: true },
    { new: true }
  );
  return Response.json(job);
}
