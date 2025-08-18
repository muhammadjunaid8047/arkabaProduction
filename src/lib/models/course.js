import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  contentUrl: { type: String, required: true },
  contentType: {
    type: String,
    enum: ["video", "podcast", "course"],
    required: true,
  },
  expirationDate: { type: Date },
  quiz: [QuizSchema], // Add quiz field
  csvFileUrl: { type: String }, // Add CSV file URL field
  totalCEUs: { type: String, default: "1.0" },
  ethicsCEUs: { type: String, default: "0.0" },
  supervisionCEUs: { type: String, default: "0.0" },
  instructorName: { type: String, default: "Course Instructor" },
  coordinatorName: { type: String, default: "ArkABA Coordinator" },
  bacbNumber: { type: String, required: true, default: "AB1000001" },
  providerNumber: { type: String, default: "TBD" },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
