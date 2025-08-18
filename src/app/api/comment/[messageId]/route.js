// CHAT
// /app/api/comment/[messageId]/route.js
import { connect } from '@/lib/mongodb/mongoose';
import Comment from '@/lib/models/Comment';

export async function GET(req, { params }) {
  await connect();
  const { messageId } = params;

  const comments = await Comment.find({ messageId }).sort({ createdAt: 1 });

  return Response.json(comments);
}
