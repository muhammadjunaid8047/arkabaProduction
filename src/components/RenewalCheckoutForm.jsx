"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export default function RenewalCheckoutForm({ 
  clientSecret, 
  paymentIntentId, 
  customerId, 
  memberInfo, 
  isRenewal = true 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getMembershipPrice = (role) => {
    switch (role) {
      case 'full':
        return 50;
      case 'affiliate':
        return 25;
      case 'studentbt':
        return 10;
      default:
        return 50;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || !stripe || !elements) return;

    setSubmitted(true);
    setLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-status`,
          payment_method_data: {
            billing_details: {
              name: memberInfo.billingName || `${memberInfo.fullName} ${memberInfo.lastName}`,
              email: memberInfo.email,
              address: {
                line1: memberInfo.billingAddress || '',
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (result.error) {
        const encodedError = encodeURIComponent(result.error.message || "Payment failed.");
        window.location.href = `/payment-status?status=failure&reason=${encodedError}`;
        return;
      }

      // If payment succeeded without redirect, process the renewal
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const renewalRes = await fetch("/api/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: memberInfo.email,
            fullName: memberInfo.fullName,
            lastName: memberInfo.lastName,
            phone: memberInfo.phone,
            bcba: memberInfo.bcba,
            affiliation: memberInfo.affiliation,
            billingName: memberInfo.billingName,
            billingAddress: memberInfo.billingAddress,
            selectedRole: memberInfo.role,
            paymentIntentId: result.paymentIntent.id,
            isRenewal: true,
          }),
        });

        const renewalData = await renewalRes.json();

        if (renewalRes.ok) {
          window.location.href = "/payment-status?status=success&renewal=true";
        } else {
          const encodedError = encodeURIComponent(renewalData.error || "Renewal failed.");
          window.location.href = `/payment-status?status=failure&reason=${encodedError}`;
        }
      } else {
        // Payment is still processing, redirect to status page
        window.location.href = "/payment-status?status=processing";
      }
    } catch (error) {
      console.error("Payment error:", error);
      const encodedError = encodeURIComponent("An unexpected error occurred during payment.");
      window.location.href = `/payment-status?status=failure&reason=${encodedError}`;
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto p-6 rounded-2xl bg-white space-y-6 shadow-[0_0_20px_rgba(255,0,0,0.3)]"
    >
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Complete Renewal Payment
      </h2>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
        <PaymentElement
          options={{
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Renewal Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Member:</span>
            <span className="font-medium">{memberInfo.fullName} {memberInfo.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span>Membership Type:</span>
            <span className="font-medium capitalize">{memberInfo.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Renewal Amount:</span>
            <span className="font-medium">${getMembershipPrice(memberInfo.role)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">${getMembershipPrice(memberInfo.role)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
          loading || !stripe || !elements
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Renewal...
          </div>
        ) : (
          `Complete Renewal - $${getMembershipPrice(memberInfo.role)}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. Your membership will be renewed immediately upon successful payment.
      </p>
    </form>
  );
} 