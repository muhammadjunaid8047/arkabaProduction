import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
  eventRegistrationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EventRegistration', 
    required: true 
  },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  
  // User information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member', 
    default: null // null for non-members
  },
  userRole: { 
    type: String, 
    enum: ['student', 'full', 'affiliate', 'nonMember'], 
    required: true 
  },
  membershipRole: { 
    type: String, 
    enum: ['studentbt', 'full', 'affiliate', 'nonMember'], 
    required: false // Optional for backward compatibility
  },
  
  // Registration details
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  
  // Payment information
  amountPaid: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'completed' 
  },
  paymentIntentId: { type: String, default: "" },
  
  // Custom field responses
  customFieldResponses: [{
    fieldName: String,
    response: mongoose.Schema.Types.Mixed
  }],
  
  // Timestamps
  registeredAt: { type: Date, default: Date.now },
  
  // Additional notes (for admin use)
  adminNotes: { type: String, default: "" }
});

export default mongoose.models.Registration || 
  mongoose.model("Registration", RegistrationSchema);
