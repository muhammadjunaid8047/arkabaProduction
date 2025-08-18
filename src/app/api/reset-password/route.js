import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await connect();

    const user = await Member.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
