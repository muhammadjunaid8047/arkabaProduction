"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  User, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import RenewalCheckoutForm from "@/components/RenewalCheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function MembershipRenewalContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchMemberInfo();
    }
  }, [session, status]);

  const fetchMemberInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/member/payment-history?email=${session.user.email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch member information');
      }
      
      const data = await response.json();
      console.log('Member info fetched:', data.member);
      setMemberInfo(data.member || null);
      
      // Check if member is actually expired
      if (data.member && data.member.membershipExpiry) {
        const expiryDate = new Date(data.member.membershipExpiry);
        const today = new Date();
        if (expiryDate > today) {
          // Member is not expired, redirect to payment history
          router.push('/members-portal/payment-history');
          return;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewal = async () => {
    if (!memberInfo) return;

    try {
      setLoading(true);
      
      console.log('Renewal request - member role:', memberInfo.role, 'member info:', memberInfo);
      
      // Create payment intent for renewal
      const response = await fetch('/api/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onlyIntent: true,
          email: memberInfo.email,
          fullName: memberInfo.fullName,
          lastName: memberInfo.lastName,
          phone: memberInfo.phone,
          bcba: memberInfo.bcba,
          affiliation: memberInfo.affiliation,
          billingName: memberInfo.billingName,
          billingAddress: memberInfo.billingAddress,
          selectedRole: memberInfo.role,
          isRenewal: true, // Flag to indicate this is a renewal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setCustomerId(data.customerId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysExpired = (dateString) => {
    if (!dateString) return 0;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - expiryDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to renew your membership.</p>
          <a 
            href="/members-login" 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMemberInfo}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find your member information.</p>
          <a 
            href="/membership" 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Join as New Member
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/members-portal/payment-history')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Payment History
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Renewal</h1>
            <p className="text-gray-600">Renew your ArkABA membership to continue accessing member benefits</p>
          </div>
        </motion.div>

        {/* Expired Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-100 border border-red-300 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Membership Expired</h2>
          </div>
          <p className="text-red-700 mb-4">
            Your membership expired on <strong>{formatExpiryDate(memberInfo.membershipExpiry)}</strong> 
            ({getDaysExpired(memberInfo.membershipExpiry)} days ago). 
            Renew now to restore access to all member benefits.
          </p>
        </motion.div>

        {/* Member Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            Your Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {memberInfo.fullName} {memberInfo.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Membership Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{memberInfo.role}</p>
            </div>
            {memberInfo.bcba && (
              <div>
                <p className="text-sm font-medium text-gray-600">BCBA Number</p>
                <p className="text-lg font-semibold text-gray-900">{memberInfo.bcba}</p>
              </div>
            )}
            {memberInfo.affiliation && (
              <div>
                <p className="text-sm font-medium text-gray-600">Affiliation</p>
                <p className="text-lg font-semibold text-gray-900">{memberInfo.affiliation}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Renewal Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            Renewal Details
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {memberInfo.role} Membership
                </p>
                <p className="text-sm text-gray-600">Annual membership renewal</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${getMembershipPrice(memberInfo.role)}
                </p>
                <p className="text-sm text-gray-600">USD</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Membership Duration:</span>
                <span className="font-medium text-gray-900">1 Year</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Previous Expiry:</span>
                <span className="font-medium text-gray-900">{formatExpiryDate(memberInfo.membershipExpiry)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Section */}
        {!clientSecret ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={handleRenewal}
              disabled={loading}
              className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-3" />
                  Renew Membership - ${getMembershipPrice(memberInfo.role)}
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 mt-4">
              Secure payment processed by Stripe
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Complete Payment
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {memberInfo.role} Membership Renewal
                  </p>
                  <p className="text-sm text-gray-600">Annual membership</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${getMembershipPrice(memberInfo.role)}
                  </p>
                  <p className="text-sm text-gray-600">USD</p>
                </div>
              </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <RenewalCheckoutForm 
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                customerId={customerId}
                memberInfo={memberInfo}
                isRenewal={true}
              />
            </Elements>
          </motion.div>
        )}

        {/* Benefits Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Member Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>• Access to exclusive resources and materials</div>
            <div>• Discounted rates on events and conferences</div>
            <div>• Professional networking opportunities</div>
            <div>• Continuing education credits</div>
            <div>• Job board access</div>
            <div>• Member-only content and updates</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function MembershipRenewalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <MembershipRenewalContent />
    </Suspense>
  );
} 