# Webhook Setup Guide

## Stripe Dashboard Webhook Configuration

### 1. Go to Stripe Dashboard
1. Log in to your Stripe Dashboard
2. Navigate to **Developers** > **Webhooks**

### 2. Create Webhook Endpoint
1. Click **"Add endpoint"**
2. Set the endpoint URL to: `https://yourdomain.com/api/webhook`
3. Select the following events:

#### Required Events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.created`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

### 3. Copy Webhook Secret
1. After creating the webhook, click on it to view details
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`

### 4. Test Webhook
1. In the webhook details page, click **"Send test webhook"**
2. Select `payment_intent.created` event
3. Click **"Send test webhook"**
4. Check your application logs to see if the webhook is received

## Environment Variables

Make sure your `.env.local` file includes:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Testing Webhooks Locally

If you're testing locally, you can use Stripe CLI:

1. Install Stripe CLI
2. Run: `stripe listen --forward-to localhost:3000/api/webhook`
3. This will give you a webhook secret to use locally

## Troubleshooting

### Webhook Not Receiving Events
- Check that the webhook URL is correct
- Verify the webhook is active in Stripe Dashboard
- Check your server logs for errors

### Signature Verification Failed
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Make sure you're using the right webhook secret for your environment

### 404 Errors
- The webhook endpoint is now available at both `/api/webhook` and `/api/webhooks/stripe`
- Make sure your Stripe webhook URL points to the correct endpoint 