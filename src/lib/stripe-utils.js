import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price mapping for different membership types
export const PRICE_MAP = {
  full: 'price_1RsQXX0eeiT2Psyw5vQTjHR1',
  affiliate: 'price_1RsQZS0eeiT2PsywoLyilpnP',
  studentbt: 'price_1RsOev0eeiT2PsyweLYrApMz',
};

// Membership duration in days
export const MEMBERSHIP_DURATION = {
  full: 365,
  affiliate: 365,
  studentbt: 365,
};

// Price display mapping
export const PRICE_DISPLAY = {
  full: '$50',
  affiliate: '$25',
  studentbt: '$10',
};

/**
 * Format amount from cents to dollars
 */
export function formatAmount(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Get price ID for membership type
 */
export function getPriceId(membershipType) {
  return PRICE_MAP[membershipType.toLowerCase()];
}

/**
 * Get display price for membership type
 */
export function getDisplayPrice(membershipType) {
  return PRICE_DISPLAY[membershipType.toLowerCase()] || '$0';
}

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(customerData) {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.fullName || '',
      address: {
        line1: customerData.billingAddress || '',
      },
      metadata: {
        role: customerData.role,
        fullName: customerData.fullName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        bcba: customerData.bcba,
        affiliation: customerData.affiliation,
      },
    });
    return { success: true, customer };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a simple payment intent for one-time payments
 */
export async function createPaymentIntent(customerId, amount, currency = 'usd') {
  try {
    console.log('Creating payment intent with customerId:', customerId, 'amount:', amount);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerId: customerId,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);
    console.log('Payment intent status:', paymentIntent.status);
    console.log('Payment intent client secret exists:', !!paymentIntent.client_secret);

    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    console.error('Error details:', {
      type: error.type,
      code: error.code,
      param: error.param,
      message: error.message
    });
    return { success: false, error: error.message };
  }
}

/**
 * Create a subscription with payment intent
 */
export async function createSubscription(customerId, priceId) {
  try {
    console.log('Creating subscription with customerId:', customerId, 'priceId:', priceId);
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        customerEmail: customerId,
      },
    });

    console.log('Subscription created:', subscription.id);
    console.log('Latest invoice:', subscription.latest_invoice?.id);
    console.log('Payment intent:', subscription.latest_invoice?.payment_intent?.id);

    const paymentIntent = subscription?.latest_invoice?.payment_intent;
    
    if (!paymentIntent) {
      console.error('No payment intent found in subscription');
      return { success: false, error: 'No payment intent created with subscription' };
    }

    return { success: true, subscription, paymentIntent };
  } catch (error) {
    console.error('Error creating subscription:', error);
    console.error('Error details:', {
      type: error.type,
      code: error.code,
      param: error.param,
      message: error.message
    });
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve payment intent
 */
export async function retrievePaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(subscriptionId, updates) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);
    return { success: true, subscription };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return { success: true, subscription };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return { success: true, subscription };
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get upcoming invoice
 */
export async function getUpcomingInvoice(customerId, subscriptionId) {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subscriptionId,
    });
    return { success: true, invoice };
  } catch (error) {
    console.error('Error retrieving upcoming invoice:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle Stripe errors
 */
export function handleStripeError(error) {
  let message = 'An unexpected error occurred';
  
  if (error.type === 'StripeCardError') {
    message = error.message;
  } else if (error.type === 'StripeRateLimitError') {
    message = 'Too many requests made to the API too quickly';
  } else if (error.type === 'StripeInvalidRequestError') {
    message = 'Invalid parameters were supplied to Stripe\'s API';
  } else if (error.type === 'StripeAPIError') {
    message = 'An error occurred internally with Stripe\'s API';
  } else if (error.type === 'StripeConnectionError') {
    message = 'Some kind of error occurred during the HTTPS communication';
  } else if (error.type === 'StripeAuthenticationError') {
    message = 'You probably used an incorrect API key';
  } else if (error.type === 'StripePermissionError') {
    message = 'You don\'t have permission to access this resource';
  } else if (error.type === 'StripeValidationError') {
    message = 'The request parameters were invalid';
  }

  return {
    success: false,
    error: message,
    type: error.type,
  };
}

/**
 * Validate webhook signature
 */
export function constructWebhookEvent(payload, signature, secret) {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Calculate membership expiry date
 */
export function calculateMembershipExpiry(membershipType, startDate = new Date()) {
  const days = MEMBERSHIP_DURATION[membershipType.toLowerCase()] || 365;
  const expiry = new Date(startDate);
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Check if membership is expired
 */
export function isMembershipExpired(expiryDate) {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
}

/**
 * Get membership days remaining
 */
export function getMembershipDaysRemaining(expiryDate) {
  if (!expiryDate) return 0;
  const now = new Date();
  const diffTime = new Date(expiryDate) - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
} 