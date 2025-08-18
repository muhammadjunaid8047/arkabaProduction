import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'Email parameter is required' }, { status: 400 });
  }

  try {
    await connect();

    const member = await Member.findOne({ email: email });
    
    if (!member) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }

    // Return the payment history array
    return Response.json({
      success: true,
      paymentHistory: member.paymentHistory || [],
      member: {
        id: member._id,
        fullName: member.fullName,
        lastName: member.lastName,
        email: member.email,
        role: member.role,
        membershipStatus: member.membershipStatus,
        membershipExpiry: member.membershipExpiry,
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    return Response.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
} 