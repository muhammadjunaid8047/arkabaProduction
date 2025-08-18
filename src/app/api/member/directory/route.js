import { connect } from '@/lib/mongodb/mongoose';
import { Member } from '@/lib/models/member.model';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connect();

    // Get search parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const type = searchParams.get('type'); // 'member', 'supervisor', 'business', or undefined for all
    const search = searchParams.get('search'); // Search term
    const skip = (page - 1) * limit;

    // Build query for members who opted to share internally
    let query = { shareInfoInternally: true };

    // Filter by member type if specified
    if (type && type !== 'all') {
      query.memberType = type;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { affiliation: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch members with pagination
    const members = await Member.find(query)
      .select('-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry -stripeCustomerId -stripeSubscriptionId -paymentHistory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Member.countDocuments(query);

    return NextResponse.json({
      success: true,
      members,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('Error fetching directory members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch directory members' },
      { status: 500 }
    );
  }
}

