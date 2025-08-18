//CHAT
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: String,
  fileUrl: String,
  fileSize: Number,
  fileName: String,
  fileType: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  anonymous: { type: Boolean, default: false },
  userName: String,
  fullName: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
