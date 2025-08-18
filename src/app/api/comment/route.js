// CHAT

// /app/api/comment/route.js
import { connect } from '@/lib/mongodb/mongoose';
import Comment from '@/lib/models/Comment';
import { pusher } from '@/lib/models/pusher';

export async function POST(req) {
  await connect();
  
const { messageId, text, fileUrl, anonymous, userName, fullName, email } = await req.json();

const comment = await Comment.create({
  messageId,
  text,
  fileUrl,
  anonymous,
  userName,
  fullName,
  email,
});


  const safeComment = {
  ...comment.toObject(),
  user: anonymous ? 'Anonymous' : userName,
};


  await pusher.trigger('chat-channel', 'new-comment', safeComment);

  return Response.json({ success: true, comment: safeComment });
}
