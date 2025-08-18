import { connect } from '@/lib/mongodb/mongoose';
import { Member } from '@/lib/models/member.model';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function PUT(req, { params }) {
  await connect();
  const data = await req.json();

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  // Handle membershipExpiry field
  if (data.membershipExpiry) {
    const expiryDate = new Date(data.membershipExpiry);
    data.membershipExpiry = expiryDate;
    
    // Update membership status based on expiry date
    const now = new Date();
    if (expiryDate > now) {
      data.membershipStatus = 'active';
    } else {
      data.membershipStatus = 'inactive';
    }
  }

  // Log the sharing preferences being updated
  console.log('Updating member via admin with sharing data:', {
    memberId: params.id,
    shareInfoInternally: data.shareInfoInternally,
    memberType: data.memberType,
    businessName: data.businessName,
    businessWebsite: data.businessWebsite,
  });

  const updated = await Member.findByIdAndUpdate(params.id, data, { new: true });

  const updatedObj = updated.toObject();
  delete updatedObj.password;

  return NextResponse.json({ success: true, member: updatedObj });
}

export async function DELETE(req, { params }) {
  await connect();
  await Member.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
