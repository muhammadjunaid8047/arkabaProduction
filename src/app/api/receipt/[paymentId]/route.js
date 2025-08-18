import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";

export async function GET(req, { params }) {
  const { paymentId } = params;
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

    // Find the specific payment
    const payment = member.paymentHistory.find(p => 
      p.paymentIntentId === paymentId || p.invoiceId === paymentId
    );

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Generate receipt data
    const receipt = {
      receiptNumber: `RCP-${Date.now()}`,
      date: payment.date,
      member: {
        name: `${member.fullName} ${member.lastName}`,
        email: member.email,
        role: member.role,
      },
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentIntentId: payment.paymentIntentId,
        invoiceId: payment.invoiceId,
      },
      organization: {
        name: "ArkABA",
        address: "Arkansas Association for Behavior Analysis",
        website: "https://arkaba.org",
      }
    };

    return Response.json({
      success: true,
      receipt
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return Response.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
} 