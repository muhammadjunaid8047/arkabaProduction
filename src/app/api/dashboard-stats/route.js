import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";
import Message from "@/lib/models/Message"
import { Member } from "@/lib/models/member.model";
import Event from "@/lib/models/event";
import Registration from "@/lib/models/registration";

export async function GET() {
  await connect();

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - 7);
  const startOfLastWeek = new Date();
  startOfLastWeek.setDate(now.getDate() - 14);

  // Get current week data
  const [
    totalJobs, 
    totalMessages, 
    messagesToday, 
    messagesThisWeek, 
    totalMembers, 
    signupsToday, 
    signupsThisWeek,
    // Previous week data for trend calculation
    messagesLastWeek,
    signupsLastWeek,
    // Recent activities
    recentMembers,
    recentJobs,
    recentMessages,
    recentEvents
  ] = await Promise.all([
    Job.countDocuments(),
    Message.countDocuments(),
    Message.countDocuments({ createdAt: { $gte: startOfDay } }),
    Message.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Member.countDocuments(),
    Member.countDocuments({ createdAt: { $gte: startOfDay } }),
    Member.countDocuments({ createdAt: { $gte: startOfWeek } }),
    // Previous week counts for trend calculation
    Message.countDocuments({ 
      createdAt: { 
        $gte: startOfLastWeek, 
        $lt: startOfWeek 
      } 
    }),
    Member.countDocuments({ 
      createdAt: { 
        $gte: startOfLastWeek, 
        $lt: startOfWeek 
      } 
    }),
    // Recent activities for the activity feed
    Member.find().sort({ createdAt: -1 }).limit(2).select('firstName lastName createdAt'),
    Job.find().sort({ createdAt: -1 }).limit(2).select('title createdAt'),
    Message.find().sort({ createdAt: -1 }).limit(2).select('content createdAt'),
    Event.find().sort({ createdAt: -1 }).limit(2).select('title createdAt')
  ]);

  // Calculate trend percentages
  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const jobsTrend = calculateTrend(totalJobs, totalJobs); // For jobs, compare against a baseline
  const messagesTodayTrend = calculateTrend(messagesToday, Math.floor(messagesLastWeek / 7));
  const messagesWeekTrend = calculateTrend(messagesThisWeek, messagesLastWeek);
  const signupsWeekTrend = calculateTrend(signupsThisWeek, signupsLastWeek);

  // Format recent activities
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const activities = [];
  
  // Add recent member activities
  recentMembers.forEach(member => {
    activities.push({
      action: `${member.firstName} ${member.lastName} joined as a member`,
      time: formatTimeAgo(member.createdAt),
      type: 'member',
      createdAt: member.createdAt
    });
  });

  // Add recent job activities  
  recentJobs.forEach(job => {
    activities.push({
      action: `Job posting "${job.title}" was published`,
      time: formatTimeAgo(job.createdAt),
      type: 'job',
      createdAt: job.createdAt
    });
  });

  // Add recent message activities
  recentMessages.forEach(message => {
    const preview = message.content ? message.content.substring(0, 30) + '...' : 'New message';
    activities.push({
      action: `New message: "${preview}"`,
      time: formatTimeAgo(message.createdAt),
      type: 'message',
      createdAt: message.createdAt
    });
  });

  // Add recent event activities
  recentEvents.forEach(event => {
    activities.push({
      action: `Event "${event.title}" was scheduled`,
      time: formatTimeAgo(event.createdAt),
      type: 'event',
      createdAt: event.createdAt
    });
  });

  // Sort activities by time and take top 4
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentActivities = activities.slice(0, 4);

  return Response.json({
    totalJobs,
    totalMessages,
    messagesToday,
    messagesThisWeek,
    totalMembers,
    signupsToday,
    signupsThisWeek,
    // Trend data
    trends: {
      jobs: jobsTrend,
      messagesToday: messagesTodayTrend,
      messagesWeek: messagesWeekTrend,
      signupsWeek: signupsWeekTrend
    },
    // Recent activities
    recentActivities
  });
}
