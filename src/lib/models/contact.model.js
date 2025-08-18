// models/contact.js
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  message: String,
  isArkansasSupervisor: Boolean,
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
