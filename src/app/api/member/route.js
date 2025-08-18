import { connect } from '@/lib/mongodb/mongoose';
import { Member } from '@/lib/models/member.model';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET(req) {
  await connect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const status = searchParams.get('status'); // 'active', 'expired', or undefined for all
  const skip = (page - 1) * limit;

  let query = {};
  
  if (status === 'expired') {
    query.$or = [
      { membershipExpiry: { $lt: new Date() } },
      { membershipStatus: 'inactive' }
    ];
  } else if (status === 'active') {
    query.$and = [
      { membershipStatus: 'active' },
      { 
        $or: [
          { membershipExpiry: { $gt: new Date() } },
          { membershipExpiry: { $exists: false } }
        ]
      }
    ];
  }

  console.log('Fetching members with query:', JSON.stringify(query), 'for status:', status);

  const members = await Member.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .select('-password');    // Hide password

  const total = await Member.countDocuments(query);

  console.log(`Found ${total} total members, returning ${members.length} members for status: ${status}`);

  return NextResponse.json({
    members,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req) {
  await connect();
  const data = await req.json();

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  // Handle membershipExpiry field and ensure proper status
  if (data.membershipExpiry) {
    const expiryDate = new Date(data.membershipExpiry);
    data.membershipExpiry = expiryDate;
    
    // Set membership status based on expiry date
    const now = new Date();
    if (expiryDate > now) {
      data.membershipStatus = 'active';
    } else {
      data.membershipStatus = 'inactive';
    }
  } else {
    // If no expiry date is provided, set as active by default
    // This ensures manually created members appear in active list
    data.membershipStatus = 'active';
  }

  // Log the member data being saved
  console.log('Creating member via admin with data:', {
    email: data.email,
    membershipStatus: data.membershipStatus,
    membershipExpiry: data.membershipExpiry,
    shareInfoInternally: data.shareInfoInternally,
    memberType: data.memberType,
    businessName: data.businessName,
    businessWebsite: data.businessWebsite,
  });

  const newMember = new Member(data);
  await newMember.save();

  console.log('Member saved successfully with status:', {
    id: newMember._id,
    email: newMember.email,
    membershipStatus: newMember.membershipStatus,
    membershipExpiry: newMember.membershipExpiry,
  });

  const memberObj = newMember.toObject();
  delete memberObj.password;

  return NextResponse.json({ success: true, member: memberObj });
}
