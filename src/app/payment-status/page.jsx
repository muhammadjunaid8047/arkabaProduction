"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Home, 
  ArrowRight,
  AlertCircle,
  Shield,
  Star,
  Heart
} from "lucide-react";

export const dynamic = "force-dynamic";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const successFeatures = [
  {
    icon: <Shield className="h-5 w-5" />,
    text: "Secure payment processed"
  },
  {
    icon: <Star className="h-5 w-5" />,
    text: "Welcome to ArkABA community"
  },
  {
    icon: <Heart className="h-5 w-5" />,
    text: "Access to member benefits"
  }
];

const renewalFeatures = [
  {
    icon: <Shield className="h-5 w-5" />,
    text: "Secure payment processed"
  },
  {
    icon: <Star className="h-5 w-5" />,
    text: "Membership renewed successfully"
  },
  {
    icon: <Heart className="h-5 w-5" />,
    text: "Continued access to benefits"
  }
];

function PaymentStatusContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const reason = params.get("reason");
  const renewal = params.get("renewal");

  const isSuccess = status === "success";
  const isProcessing = status === "processing";
  const isRenewal = renewal === "true";

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${
      isSuccess 
        ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" 
        : isProcessing
        ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        : "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50"
    }`}>
      <div className="max-w-lg w-full">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`relative overflow-hidden rounded-2xl shadow-2xl border ${
            isSuccess 
              ? "bg-white border-green-200 shadow-green-200/50" 
              : isProcessing
              ? "bg-white border-blue-200 shadow-blue-200/50"
              : "bg-white border-red-200 shadow-red-200/50"
          }`}
        >
          {/* Background Pattern */}
          <div className={`absolute inset-0 opacity-5 ${
            isSuccess ? "bg-green-600" : isProcessing ? "bg-blue-600" : "bg-red-600"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-current"></div>
          </div>

          <div className="relative p-8 sm:p-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                isSuccess 
                  ? "bg-green-100 text-green-600" 
                  : isProcessing
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="h-10 w-10" />
              ) : isProcessing ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              ) : (
                <XCircle className="h-10 w-10" />
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`text-3xl sm:text-4xl font-bold mb-4 ${
                isSuccess ? "text-green-700" : isProcessing ? "text-blue-700" : "text-red-700"
              }`}
            >

              {isSuccess 
                ? (isRenewal ? "Renewal Successful! 🎉" : "Payment Successful! 🎉") 
                : isProcessing 
                ? "Processing Payment..." 
                : "Payment Failed"}

            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-700 text-lg mb-6 leading-relaxed"
            >
              {isSuccess
                ? (isRenewal 
                    ? "Your ArkABA membership has been successfully renewed! You now have continued access to all member benefits."
                    : "Thank you for joining ArkABA! Your membership has been activated and you now have access to all member benefits.")
                : isProcessing
                ? "Your payment is being processed. This may take a few moments. Please do not refresh this page or close your browser."
                : "We encountered an issue processing your payment. Please try again or contact our support team for assistance."}
            </motion.p>

            {/* Success Features */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  What's Next?
                </h3>
                <div className="space-y-3">
                  {(isRenewal ? renewalFeatures : successFeatures).map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="flex items-center text-green-700"
                    >
                      <div className="text-green-500 mr-3">
                        {feature.icon}
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error Details */}
            {!isSuccess && reason && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      Error Details
                    </h3>
                    <p className="text-sm text-red-700">
                      {decodeURIComponent(reason)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/"
                className={`flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  isSuccess
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                    : "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl"
                }`}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </motion.a>

              {isSuccess && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/members-login"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-all"
                >
                  Member Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              )}

              {!isSuccess && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/membership"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all"
                >
                  Try Again
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            {isSuccess 
              ? "Welcome to the ArkABA community! 🎉"
              : "Need help? Contact us at support@arkaba.org"
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
