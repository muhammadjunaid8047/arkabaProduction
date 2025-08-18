import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";

// GET: fetch all approved jobs
export async function GET(request) {
  await connect();
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  
  let jobsQuery = Job.find({ approved: true }).sort({ createdAt: -1 });
  
  if (limit) {
    jobsQuery = jobsQuery.limit(parseInt(limit));
  }
  
  const jobs = await jobsQuery;
  return Response.json(jobs);
}

// POST: create a new job (unapproved)
export async function POST(req) {
  const body = await req.json();
  await connect();
  const job = await Job.create({ ...body, approved: false });
  return Response.json(job);
}
