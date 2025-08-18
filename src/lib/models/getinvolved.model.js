import mongoose from "mongoose";

const GetInvolvedSchema = new mongoose.Schema(
{
firstName: { type: String, required: true },
lastName: { type: String, required: true },
email: { type: String, required: true },
joinCommittee: { type: Boolean, default: false },
planEvents: { type: Boolean, default: false },
offerCEU: { type: Boolean, default: false },
supportAdvocacy: { type: Boolean, default: false },
otherInterest: { type: String, default: "" },
},
{ timestamps: true }
);

export default mongoose.models.GetInvolved ||
mongoose.model("GetInvolved", GetInvolvedSchema);

