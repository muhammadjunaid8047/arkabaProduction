import mongoose from "mongoose";

const QuizResponseSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // User ID (optional for anonymous users)
  studentName: { type: String, required: true }, // Student name
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  courseTitle: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  certificateUrl: { type: String },
  certificateUpdatedAt: { type: Date, default: Date.now }, // Track when certificate was last updated
  studentEmail: { type: String }, // User's email for tracking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
QuizResponseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.QuizResponse ||
  mongoose.model("QuizResponse", QuizResponseSchema);
