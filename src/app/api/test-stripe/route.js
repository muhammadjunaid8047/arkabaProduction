import Stripe from 'stripe';
import { getPriceId, PRICE_MAP } from "@/lib/stripe-utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    console.log('Testing Stripe configuration...');
    console.log('Environment variables check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('- STRIPE_SECRET_KEY starts with sk_test:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'));
    
    // Test Stripe connection
    const account = await stripe.accounts.retrieve();
    console.log('Stripe account:', account.id);
    
    // Test price IDs
    const priceResults = {};
    for (const [role, priceId] of Object.entries(PRICE_MAP)) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        priceResults[role] = {
          exists: true,
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
          active: price.active
        };
        console.log(`Price ${role}:`, priceResults[role]);
      } catch (error) {
        priceResults[role] = {
          exists: false,
          error: error.message
        };
        console.error(`Price ${role} error:`, error.message);
      }
    }
    
    return Response.json({
      success: true,
      account: {
        id: account.id,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      },
      prices: priceResults,
      environment: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
      }
    });
    
  } catch (error) {
    console.error('Stripe test failed:', error);
    return Response.json({
      success: false,
      error: error.message,
      type: error.type
    }, { status: 500 });
  }
} 