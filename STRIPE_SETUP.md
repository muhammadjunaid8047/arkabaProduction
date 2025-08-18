# Stripe Integration Setup Guide

This guide will help you set up the complete Stripe integration for the ArkABA membership system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. MongoDB database set up

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_email_password_here

# Other Configuration
NODE_ENV=development
```

## Stripe Dashboard Setup

### 1. Get Your API Keys

1. Log in to your Stripe Dashboard
2. Go to Developers > API keys
3. Copy your Publishable key and Secret key
4. Update your `.env.local` file with these keys

### 2. Create Products and Prices

1. Go to Products in your Stripe Dashboard
2. Create three products for different membership types:

#### Full Membership
- Name: "Full Membership"
- Price: $50.00 USD
- Billing: One-time
- Price ID: Copy this ID and update `PRICE_MAP.full` in `/src/app/api/charge/route.js`

#### Affiliate Membership
- Name: "Affiliate Membership"
- Price: $25.00 USD
- Billing: One-time
- Price ID: Copy this ID and update `PRICE_MAP.affiliate` in `/src/app/api/charge/route.js`

#### studentbt Membership
- Name: "studentbt Membership"
- Price: $10.00 USD
- Billing: One-time
- Price ID: Copy this ID and update `PRICE_MAP.studentbt` in `/src/app/api/charge/route.js`

### 3. Set Up Webhooks

1. Go to Developers > Webhooks in your Stripe Dashboard
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode vs Live Mode

- Use test keys for development
- Switch to live keys for production
- Test with Stripe's test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

## Database Schema Updates

The Member model should include these Stripe-related fields:

```javascript
{
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionStatus: String,
  membershipStatus: String,
  membershipExpiry: Date,
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: String,
    date: Date,
    paymentIntentId: String,
    invoiceId: String
  }]
}
```

## API Endpoints

### Payment Processing
- `POST /api/charge` - Create payment intent and register members

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe events

### Subscription Management
- `GET /api/subscriptions` - Get subscription details
- `PATCH /api/subscriptions` - Update subscription (cancel, reactivate, pause, resume)

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/membership`
3. Fill out the membership form
4. Use a test card number for payment
5. Verify the payment flow works end-to-end

## Production Deployment

1. Update environment variables with live Stripe keys
2. Set up production webhook endpoint
3. Update `NEXTAUTH_URL` to your production domain
4. Ensure SSL is enabled for webhook security

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint is accessible

2. **Payment intent creation failed**
   - Verify Stripe API keys are correct
   - Check that price IDs exist in your Stripe account

3. **Member registration fails**
   - Ensure MongoDB connection is working
   - Check that all required fields are provided

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

1. Never expose your Stripe secret key in client-side code
2. Always verify webhook signatures
3. Use HTTPS in production
4. Implement proper error handling
5. Log payment events for audit trails

## Support

For Stripe-specific issues, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application-specific issues, check the application logs and ensure all environment variables are properly configured. 