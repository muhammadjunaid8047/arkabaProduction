import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";
import bcrypt from 'bcrypt';
import { 
  getPriceId, 
  createStripeCustomer, 
  createPaymentIntent,
  retrievePaymentIntent,
  calculateMembershipExpiry,
  handleStripeError,
  PRICE_DISPLAY
} from "@/lib/stripe-utils";

export async function POST(req) {
  const body = await req.json();
  const { role, selectedRole: renewalRole, email, onlyIntent, paymentIntentId, isRenewal } = body;
  const selectedRole = (renewalRole || role || 'studentbt').toLowerCase();
  const priceId = getPriceId(selectedRole);

  console.log('Charge API called with:', { 
    role: body.role, 
    selectedRole: body.selectedRole, 
    renewalRole, 
    finalSelectedRole: selectedRole, 
    priceId, 
    onlyIntent, 
    paymentIntentId, 
    isRenewal 
  });

  if (!priceId) {
    console.error('Invalid role or missing price ID:', { selectedRole, availableRoles: ['full', 'affiliate', 'studentbt'] });
    return Response.json({ error: 'Invalid role or missing price ID.' }, { status: 400 });
  }

  try {
    await connect();

    // If this is a payment intent creation request
    if (onlyIntent) {
      console.log('Creating payment intent for role:', selectedRole);
      
      // Step 1: Create customer
      const customerResult = await createStripeCustomer({
        email,
        fullName: body.fullName,
        lastName: body.lastName,
        phone: body.phone,
        bcba: body.bcba,
        affiliation: body.affiliation,
        billingAddress: body.billingAddress,
        role: selectedRole,
      });

      if (!customerResult.success) {
        console.error('Failed to create customer:', customerResult.error);
        return Response.json({ error: customerResult.error }, { status: 500 });
      }

      console.log('Customer created successfully:', customerResult.customer.id);

      // Step 2: Create payment intent with the correct amount
      const amount = selectedRole === 'full' ? 5000 : selectedRole === 'affiliate' ? 2500 : 1000; // in cents
      console.log('Creating payment intent with role:', selectedRole, 'amount:', amount, 'amount in dollars:', amount / 100);
      const paymentIntentResult = await createPaymentIntent(customerResult.customer.id, amount);

      if (!paymentIntentResult.success) {
        console.error('Failed to create payment intent:', paymentIntentResult.error);
        return Response.json({ error: paymentIntentResult.error }, { status: 500 });
      }

      const { paymentIntent } = paymentIntentResult;
      console.log('Payment intent created:', paymentIntent.id);
      console.log('Payment intent status:', paymentIntent.status);

      if (!paymentIntent?.client_secret) {
        console.error('No client secret in payment intent:', paymentIntent);
        return Response.json({ error: "Could not generate payment client secret." }, { status: 500 });
      }

      console.log('Payment intent created successfully with client secret');

      return Response.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customerResult.customer.id,
      });
    }

    // If this is a member registration after successful payment
    if (paymentIntentId) {
      console.log('Processing member registration for payment intent:', paymentIntentId);
      
      // Verify payment intent
      const paymentIntentResult = await retrievePaymentIntent(paymentIntentId);
      
      if (!paymentIntentResult.success) {
        console.error('Failed to retrieve payment intent:', paymentIntentResult.error);
        return Response.json({ error: paymentIntentResult.error }, { status: 500 });
      }

      const paymentIntent = paymentIntentResult.paymentIntent;
      
      if (paymentIntent.status !== 'succeeded') {
        console.error('Payment not succeeded:', paymentIntent.status);
        return Response.json({ error: 'Payment not completed successfully.' }, { status: 400 });
      }

      // Check if member already exists
      const existingMember = await Member.findOne({ email: body.email });
      
      if (isRenewal) {
        // Handle membership renewal
        if (!existingMember) {
          console.error('Member not found for renewal:', body.email);
          return Response.json({ error: 'Member not found for renewal.' }, { status: 404 });
        }

        // Calculate new membership expiry
        const membershipExpiry = calculateMembershipExpiry(selectedRole);

        // Update existing member
        existingMember.membershipStatus = 'active';
        existingMember.membershipExpiry = membershipExpiry;
        existingMember.stripeCustomerId = paymentIntent.customer;
        
        // Add new payment to history
        existingMember.paymentHistory.push({
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          status: 'completed',
          date: new Date(),
          paymentIntentId: paymentIntentId,
        });

        await existingMember.save();
        console.log('Member renewed successfully:', existingMember._id);

        return Response.json({ 
          success: true, 
          message: 'Membership renewed successfully',
          memberId: existingMember._id,
        });
      } else {
        // Handle new member registration
        if (existingMember) {
          console.error('Member already exists:', body.email);
          return Response.json({ error: 'Member with this email already exists.' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Calculate membership expiry
        const membershipExpiry = calculateMembershipExpiry(selectedRole);

        // Log the data being saved for debugging
        console.log('Creating member with data:', {
          fullName: body.fullName,
          lastName: body.lastName,
          email: body.email,
          shareInfoInternally: body.shareInfoInternally,
          memberType: body.memberType,
          businessName: body.businessName,
          businessWebsite: body.businessWebsite,
        });

        // Create member
        const member = new Member({
          fullName: body.fullName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          bcba: body.bcba,
          affiliation: body.affiliation,
          password: hashedPassword,
          role: selectedRole,
          membershipStatus: 'active',
          membershipExpiry,
          stripeCustomerId: paymentIntent.customer,
          billingName: body.billingName,
          billingAddress: body.billingAddress,
          // Add internal sharing preferences
          shareInfoInternally: body.shareInfoInternally || false,
          memberType: body.memberType || 'member',
          businessName: body.businessName || '',
          businessWebsite: body.businessWebsite || '',
          paymentHistory: [{
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency,
            status: 'completed',
            date: new Date(),
            paymentIntentId: paymentIntentId,
          }],
        });

        await member.save();
        console.log('Member registered successfully:', member._id);
        console.log('Member saved with sharing preferences:', {
          shareInfoInternally: member.shareInfoInternally,
          memberType: member.memberType,
          businessName: member.businessName,
          businessWebsite: member.businessWebsite,
        });

        return Response.json({ 
          success: true, 
          message: 'Member registered successfully',
          memberId: member._id,
        });
      }
    }

    return Response.json({ error: 'Invalid request parameters.' }, { status: 400 });

  } catch (err) {
    console.error("Stripe Subscription Error:", err);
    const errorResult = handleStripeError(err);
    return Response.json({ error: errorResult.error }, { status: 500 });
  }
}
