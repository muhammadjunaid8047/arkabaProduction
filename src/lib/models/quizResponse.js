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
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.QuizResponse ||
  mongoose.model("QuizResponse", QuizResponseSchema);
