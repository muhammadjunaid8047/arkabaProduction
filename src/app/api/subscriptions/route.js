import Stripe from 'stripe';
import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');
  const memberId = searchParams.get('memberId');

  if (!customerId && !memberId) {
    return Response.json({ error: 'Customer ID or Member ID is required' }, { status: 400 });
  }

  try {
    await connect();

    let member;
    if (memberId) {
      member = await Member.findById(memberId);
      if (!member) {
        return Response.json({ error: 'Member not found' }, { status: 404 });
      }
    } else {
      member = await Member.findOne({ stripeCustomerId: customerId });
      if (!member) {
        return Response.json({ error: 'Member not found' }, { status: 404 });
      }
    }

    if (!member.stripeSubscriptionId) {
      return Response.json({ error: 'No subscription found for this member' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.retrieve(member.stripeSubscriptionId);
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: member.stripeCustomerId,
      subscription: member.stripeSubscriptionId,
    });

    return Response.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
        })),
      },
      upcomingInvoice: {
        amountDue: upcomingInvoice.amount_due / 100,
        currency: upcomingInvoice.currency,
        nextPaymentAttempt: upcomingInvoice.next_payment_attempt,
      },
      member: {
        id: member._id,
        email: member.email,
        fullName: member.fullName,
        membershipStatus: member.membershipStatus,
        membershipExpiry: member.membershipExpiry,
      },
    });
  } catch (error) {
    console.error('Subscription retrieval error:', error);
    return Response.json({ error: 'Failed to retrieve subscription' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const body = await req.json();
  const { action, memberId, subscriptionId } = body;

  if (!action || !memberId) {
    return Response.json({ error: 'Action and member ID are required' }, { status: 400 });
  }

  try {
    await connect();

    const member = await Member.findById(memberId);
    if (!member) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }

    const subId = subscriptionId || member.stripeSubscriptionId;
    if (!subId) {
      return Response.json({ error: 'No subscription found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'cancel':
        result = await stripe.subscriptions.update(subId, {
          cancel_at_period_end: true,
        });
        member.subscriptionStatus = 'canceled';
        member.membershipStatus = 'canceling';
        break;

      case 'reactivate':
        result = await stripe.subscriptions.update(subId, {
          cancel_at_period_end: false,
        });
        member.subscriptionStatus = 'active';
        member.membershipStatus = 'active';
        break;

      case 'pause':
        result = await stripe.subscriptions.update(subId, {
          pause_collection: {
            behavior: 'void',
          },
        });
        member.subscriptionStatus = 'paused';
        member.membershipStatus = 'paused';
        break;

      case 'resume':
        result = await stripe.subscriptions.update(subId, {
          pause_collection: null,
        });
        member.subscriptionStatus = 'active';
        member.membershipStatus = 'active';
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    await member.save();

    return Response.json({
      success: true,
      message: `Subscription ${action}ed successfully`,
      subscription: {
        id: result.id,
        status: result.status,
        cancelAtPeriodEnd: result.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return Response.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
} 