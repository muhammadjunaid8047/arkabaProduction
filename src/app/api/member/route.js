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
  try {
    await connect();
    const data = await req.json();

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Check if email already exists
    const existingMember = await Member.findOne({ email: data.email.toLowerCase() });
    if (existingMember) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
        message: 'A member with this email address already exists. Please use a different email or check if the member is already in the system.'
      }, { status: 409 });
    }

    // Validate password strength
    if (data.password && data.password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Validate role if provided
    if (data.role && !['full', 'affiliate', 'studentbt'].includes(data.role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role',
        message: 'Please select a valid role from the dropdown'
      }, { status: 400 });
    }

    // Validate member type if sharing is enabled
    if (data.shareInfoInternally && data.memberType && !['member', 'supervisor', 'business'].includes(data.memberType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid member type',
        message: 'Please select a valid member type'
      }, { status: 400 });
    }

    // Validate business fields if member type is business
    if (data.shareInfoInternally && data.memberType === 'business' && !data.businessName) {
      return NextResponse.json({
        success: false,
        error: 'Business name required',
        message: 'Business name is required when member type is set to Business'
      }, { status: 400 });
    }

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

    // Normalize email to lowercase
    data.email = data.email.toLowerCase();

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

    return NextResponse.json({ 
      success: true, 
      member: memberObj,
      message: 'Member created successfully!'
    });

  } catch (error) {
    console.error('Error creating member:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: 'Please check the following fields:',
        details: validationErrors
      }, { status: 400 });
    }

    // Handle duplicate key errors (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        success: false,
        error: 'Duplicate field',
        message: `A member with this ${field} already exists. Please use a different ${field}.`
      }, { status: 409 });
    }

    // Handle other errors
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred while creating the member. Please try again.'
    }, { status: 500 });
  }
}
