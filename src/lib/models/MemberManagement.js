import mongoose from 'mongoose';

const MemberManagementSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, { timestamps: true });

export default mongoose.models.MemberManagement || mongoose.model('MemberManagement', MemberManagementSchema);
