import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
  location: String,
  salary: String, // e.g., "$50,000 - $70,000"
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    default: "Full-time",
  },
  applicationDeadline: Date,
  contactEmail: String,
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
