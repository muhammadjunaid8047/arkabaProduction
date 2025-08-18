import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  backgroundImage: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  isBannerEvent: { type: Boolean, default: false },
  // Registration fields
  registrationEnabled: { type: Boolean, default: false },
  registrationLink: { type: String, default: "" },
  registrationDeadline: { type: Date, default: null },
  // Event status
  eventStatus: { 
    type: String, 
    enum: ['upcoming', 'registration-open', 'registration-closed', 'cancelled', 'completed'],
    default: 'upcoming'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema); 