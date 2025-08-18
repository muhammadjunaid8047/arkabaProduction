// CHAT

import { connect } from '@/lib/mongodb/mongoose';
import Message from '@/lib/models/Message';
import { pusher } from '@/lib/models/pusher';

// GET: Paginated fetch of parent messages + comments
export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Fetch parent messages
    const msgs = await Message.find({ parentId: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ parentId: null });

    // Fetch child comments
    const messageIds = msgs.map((m) => m._id);
    const comments = await Message.find({
      parentId: { $in: messageIds },
    }).sort({ createdAt: 1 });

    const commentMap = comments.reduce((acc, comment) => {
      const parentId = comment.parentId.toString();
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push({
        ...comment.toObject(),
        user: comment.anonymous ? 'Anonymous' : comment.userName,
      });
      return acc;
    }, {});

    const result = msgs.reverse().map((m) => ({
      ...m.toObject(),
      comments: commentMap[m._id.toString()] || [],
      user: m.anonymous ? 'Anonymous' : m.userName,
    }));

    const totalPages = Math.ceil(totalMessages / limit);
    const hasMore = skip + msgs.length < totalMessages;

    return Response.json({
      success: true,
      messages: result,
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages,
        hasMore,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST: Add new message
export async function POST(req) {
  try {
    await connect();

    const { text, fileUrl, fileSize, fileName, fileType, anonymous, userName, fullName, email } = await req.json();

    const message = await Message.create({
      text,
      fileUrl,
      fileSize,
      fileName,
      fileType,
      anonymous: !!anonymous,
      userName,
      fullName,
      email,
      parentId: null,
      createdAt: new Date(),
    });

    const safe = {
      ...message.toObject(),
      user: anonymous ? 'Anonymous' : userName,
      comments: [],
    };

    await pusher.trigger('chat-channel', 'new-message', safe);

    return Response.json({ success: true, message: safe });
  } catch (error) {
    console.error('Error creating message:', error);
    return Response.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
