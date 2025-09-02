import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['completed', 'failed', 'pending'], required: true },
  date: { type: Date, default: Date.now },
  paymentIntentId: String,
  invoiceId: String,
});

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  lastName: { type: String, required: false },
  email: { type: String, unique: true, required: true },
  phone: String,
  bcba: String,
  affiliation: String,
  password: { type: String, required: true }, // ⚠️ Should be hashed
  role: { 
    type: String, 
    enum: ['full', 'affiliate', 'studentbt'], 
    default: 'studentbt' 
  },
  billingName: { type: String, required: false },
  billingAddress: { type: String, required: false },
  
  // Internal sharing preferences
  shareInfoInternally: { type: Boolean, default: false },
  memberType: { 
    type: String, 
    enum: ['member', 'supervisor', 'business'], 
    default: 'member' 
  },
  
  // Business-specific fields (only if memberType is 'business')
  businessName: String,
  businessWebsite: String,
  
  // Stripe-related fields
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'paused'], 
    default: 'active' 
  },
  membershipStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'canceling', 'paused'], 
    default: 'active' 
  },
  membershipExpiry: { type: Date },
  paymentHistory: [paymentHistorySchema],
  
  // Authentication fields
  createdAt: { type: Date, default: Date.now },
  resetToken: String,
  resetTokenExpiry: Date,
  
  // Admin access control
  isAdmin: { type: Boolean, default: false },
  
  // Additional fields
  lastLogin: Date,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
});

// Index for better query performance
// memberSchema.index({ email: 1 });
memberSchema.index({ stripeCustomerId: 1 });
memberSchema.index({ membershipStatus: 1 });
memberSchema.index({ membershipExpiry: 1 });


memberSchema.virtual('fullNameComplete').get(function() {
  return `${this.fullName} ${this.lastName}`.trim();
});

// Method to check if membership is active
memberSchema.methods.isMembershipActive = function() {
  return this.membershipStatus === 'active' && 
         (!this.membershipExpiry || this.membershipExpiry > new Date());
};

// Method to get membership days remaining
memberSchema.methods.getMembershipDaysRemaining = function() {
  if (!this.membershipExpiry) return 0;
  const now = new Date();
  const diffTime = this.membershipExpiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);
