// /app/api/admin/job-board/jobs/route.js
import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";

export async function GET() {
  try {
    await connect();
    const jobs = await Job.find().sort({ createdAt: -1 }); // All jobs
    return new Response(JSON.stringify(jobs), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to fetch jobs", { status: 500 });
  }
}
