import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";
import Message from "@/lib/models/Message"
import { Member } from "@/lib/models/member.model";

export async function GET() {
  await connect();

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - 7);

  const [totalJobs, totalMessages, messagesToday, messagesThisWeek, totalMembers, signupsToday, signupsThisWeek] =
    await Promise.all([
      Job.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: startOfDay } }),
      Message.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Member.countDocuments(),
      Member.countDocuments({ createdAt: { $gte: startOfDay } }),
      Member.countDocuments({ createdAt: { $gte: startOfWeek } }),
    ]);

  return Response.json({
    totalJobs,
    totalMessages,
    messagesToday,
    messagesThisWeek,
    totalMembers,
    signupsToday,
    signupsThisWeek,
  });
}
