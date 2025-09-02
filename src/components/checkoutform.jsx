"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export default function CheckoutForm({ form, setMsg, isFormValid, validateForm }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Use the passed isFormValid prop if available, otherwise fall back to basic validation
  const formIsValid = isFormValid !== undefined ? isFormValid : (
    form.fullName &&
    form.lastName &&
    form.email &&
    form.password &&
    form.billingName &&
    form.billingAddress
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || !stripe || !elements) return;

    // Run validation if validateForm function is provided
    if (validateForm && !validateForm()) {
      setMsg("Please fix the form errors before proceeding.");
      return;
    }

    if (!formIsValid) {
      setMsg("Please fill out all required fields.");
      return;
    }

    setSubmitted(true);
    setLoading(true);
    setMsg("");

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-status`,
          payment_method_data: {
            billing_details: {
              name: form.billingName,
              email: form.email,
              address: {
                line1: form.billingAddress,
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

      // If payment succeeded without redirect, register the member
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const registrationRes = await fetch("/api/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            paymentIntentId: result.paymentIntent.id,
          }),
        });

        const registrationData = await registrationRes.json();

        if (registrationRes.ok) {
          window.location.href = "/payment-status?status=success";
        } else {
          const encodedError = encodeURIComponent(registrationData.error || "Registration failed.");
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
        Payment Information
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

      {!formIsValid && (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
          ⚠️ Please fill all required fields: First Name, Last Name, Email, Password, Billing Name, and Billing Address.
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Membership Type:</span>
            <span className="font-medium capitalize">{form.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">
              {form.role === 'full' ? '$50' : form.role === 'affiliate' ? '$25' : '$10'}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">
              {form.role === 'full' ? '$50' : form.role === 'affiliate' ? '$25' : '$10'}
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"

        disabled={loading || !stripe || !elements || !formIsValid}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
          loading || !stripe || !elements || !formIsValid

            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          "Pay & Register"
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. You will receive a confirmation email once the payment is processed.
      </p>
    </form>
  );
}
