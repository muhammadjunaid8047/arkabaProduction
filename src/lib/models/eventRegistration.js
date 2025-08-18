import mongoose from "mongoose";

const EventRegistrationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: false // Optional for standalone registrations
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  
  // Pricing for different user types
  pricing: {
    student: { type: Number, required: true },
    full: { type: Number, required: true },
    affiliate: { type: Number, required: true },
    nonMember: { type: Number, required: true }
  },
  
  // Registration settings
  registrationDeadline: { type: Date, required: true },
  maxAttendees: { type: Number, default: null }, // null = unlimited
  currentAttendees: { type: Number, default: 0 },
  
  // Custom fields
  customFields: [{
    fieldName: String,
    fieldType: { type: String, enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox'] },
    isRequired: Boolean,
    options: [String] // For select fields
  }],
  
  // Email settings
  confirmationEmailTemplate: { type: String, default: "" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
EventRegistrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.EventRegistration || 
  mongoose.model("EventRegistration", EventRegistrationSchema);
