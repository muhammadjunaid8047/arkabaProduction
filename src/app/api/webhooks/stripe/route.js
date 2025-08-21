import Stripe from 'stripe';
import { headers } from 'next/headers';
import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";
import Registration from "@/lib/models/registration";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    await connect();

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.created':
        await handlePaymentIntentCreated(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  // Update member with subscription details if needed
  const member = await Member.findOne({ stripeCustomerId: subscription.customer });
  if (member) {
    member.stripeSubscriptionId = subscription.id;
    member.subscriptionStatus = subscription.status;
    await member.save();
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  const member = await Member.findOne({ stripeCustomerId: subscription.customer });
  if (member) {
    member.subscriptionStatus = subscription.status;
    if (subscription.status === 'active') {
      member.membershipStatus = 'active';
      // Extend membership expiry
      const membershipExpiry = new Date();
      membershipExpiry.setDate(membershipExpiry.getDate() + 365);
      member.membershipExpiry = membershipExpiry;
    }
    await member.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  const member = await Member.findOne({ stripeCustomerId: subscription.customer });
  if (member) {
    member.subscriptionStatus = 'canceled';
    member.membershipStatus = 'inactive';
    await member.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  const member = await Member.findOne({ stripeCustomerId: invoice.customer });
  if (member) {
    // Add payment to history
    member.paymentHistory.push({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'completed',
      date: new Date(),
      invoiceId: invoice.id,
    });
    await member.save();
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  const member = await Member.findOne({ stripeCustomerId: invoice.customer });
  if (member) {
    member.paymentHistory.push({
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'failed',
      date: new Date(),
      invoiceId: invoice.id,
    });
    await member.save();
  }
}

async function handlePaymentIntentCreated(paymentIntent) {
  console.log('Payment intent created:', paymentIntent.id);
  console.log('Payment intent status:', paymentIntent.status);
  console.log('Payment intent amount:', paymentIntent.amount);
  console.log('Payment intent customer:', paymentIntent.customer);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('=== PAYMENT INTENT SUCCEEDED ===');
  console.log('Payment intent ID:', paymentIntent.id);
  console.log('Payment intent status:', paymentIntent.status);
  console.log('Payment intent amount:', paymentIntent.amount);
  console.log('Payment intent customer:', paymentIntent.customer);
  console.log('Payment intent metadata:', JSON.stringify(paymentIntent.metadata, null, 2));
  
  // Check if this is an event registration payment
  if (paymentIntent.metadata && paymentIntent.metadata.type === 'event_registration') {
    console.log('=== HANDLING EVENT REGISTRATION PAYMENT ===');
    
    try {
      // Find the registration by payment intent ID
      console.log('Searching for registration with paymentIntentId:', paymentIntent.id);
      const registration = await Registration.findOne({ 
        paymentIntentId: paymentIntent.id 
      });
      
      if (registration) {
        console.log('✅ Found registration:', {
          id: registration._id,
          email: registration.email,
          currentPaymentStatus: registration.paymentStatus,
          amountPaid: registration.amountPaid
        });
        
        // Update payment status to completed
        registration.paymentStatus = 'completed';
        await registration.save();
        
        console.log('✅ Registration payment status updated to completed');
        console.log('Email will be sent from frontend after download receipt button is generated');
      } else {
        console.error('❌ No registration found for payment intent:', paymentIntent.id);
        // Let's also search by registrationId in metadata if available
        if (paymentIntent.metadata.registrationId) {
          console.log('Trying to find by registrationId from metadata:', paymentIntent.metadata.registrationId);
          const regByMetadata = await Registration.findById(paymentIntent.metadata.registrationId);
          if (regByMetadata) {
            console.log('Found registration by metadata ID, updating paymentIntentId and status');
            regByMetadata.paymentIntentId = paymentIntent.id;
            regByMetadata.paymentStatus = 'completed';
            await regByMetadata.save();
            console.log('✅ Registration updated via metadata lookup');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling event registration payment success:', error);
    }
  } else {
    console.log('Not an event registration payment - skipping');
  }
  // This is handled in the main charge API for member creation
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);
  console.log('Payment intent status:', paymentIntent.status);
  console.log('Payment intent last_payment_error:', paymentIntent.last_payment_error);
  
  // Check if this is an event registration payment
  if (paymentIntent.metadata && paymentIntent.metadata.type === 'event_registration') {
    console.log('Handling event registration payment failure');
    
    try {
      // Find the registration by payment intent ID
      const registration = await Registration.findOne({ 
        paymentIntentId: paymentIntent.id 
      });
      
      if (registration) {
        console.log('Found registration:', registration._id);
        
        // Update payment status to failed
        registration.paymentStatus = 'failed';
        await registration.save();
        
        console.log('Event registration payment status updated to failed');
      } else {
        console.error('No registration found for failed payment intent:', paymentIntent.id);
      }
    } catch (error) {
      console.error('Error handling event registration payment failure:', error);
    }
  }
}

async function handlePaymentIntentCanceled(paymentIntent) {
  console.log('Payment intent canceled:', paymentIntent.id);
  console.log('Payment intent status:', paymentIntent.status);
  console.log('Payment intent cancellation_reason:', paymentIntent.cancellation_reason);
} 