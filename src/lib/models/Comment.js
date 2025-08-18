// CHAT

// /lib/models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  text: String,
  fileUrl: String,
  anonymous: { type: Boolean, default: false },
  userName: String,
  fullName: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
