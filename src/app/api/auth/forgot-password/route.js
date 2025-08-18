import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email } = await req.json();

  await connect();
  const user = await Member.findOne({ email });
  if (!user) {
    // Always respond same way to prevent email enumeration
    return Response.json({ message: "Check your inbox for reset link." });
  }

  // Generate token and expiry
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  user.resetToken = token;
  user.resetTokenExpiry = expires;
  await user.save();

  const resetUrl = `http://https://emergitechdev.in//reset-password?token=${token}`;

  // Setup mail transport
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP config for better control
    auth: {
      user: process.env.EMAIL_USER,      // e.g., yourgmail@gmail.com
      pass: process.env.EMAIL_PASS,      // App password if using Gmail
    },
  });

  // Send the email
  try {
    await transporter.sendMail({
      from: `"Membership Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Link",
      html: `
        <p>Hello ${user.fullName || "User"},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return Response.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("Email error:", err);
    return Response.json({ error: "Failed to send email." }, { status: 500 });
  }
}
