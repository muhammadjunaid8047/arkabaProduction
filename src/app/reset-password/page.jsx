"use client";

// export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Key,
  RefreshCw
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  // Password strength validation
  useEffect(() => {
    if (password) {
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };
      
      const score = Object.values(checks).filter(Boolean).length;
      let feedback = "";
      
      if (score === 0) feedback = "Very Weak";
      else if (score === 1) feedback = "Weak";
      else if (score === 2) feedback = "Fair";
      else if (score === 3) feedback = "Good";
      else if (score === 4) feedback = "Strong";
      else feedback = "Very Strong";
      
      setPasswordStrength({
        score,
        feedback,
        checks
      });
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setMessage("Invalid reset token. Please request a new password reset.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    if (passwordStrength.score < 4) {
      setMessage("Password must be at least 'Strong' (meet 4 out of 5 requirements).");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
      
    const data = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        setMessage(data.message || "Password updated successfully!");
      } else {
        setMessage(data.error || "Failed to update password. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = (score) => {
    if (score <= 1) return "text-red-600";
    if (score === 2) return "text-orange-600";
    if (score === 3) return "text-yellow-600";
    if (score === 4) return "text-blue-600";
    return "text-green-600";
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4"
            >
              <CheckCircle className="h-8 w-8" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Password Updated!
            </h1>
            
            <p className="text-gray-600">
              Your password has been successfully reset.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-xl p-8 border border-gray-200"
          >
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-semibold text-green-800">Success</span>
                </div>
                <p className="text-sm text-green-700">{message}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/members-login")}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center justify-center"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Login
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full mb-4"
          >
            <Lock className="h-8 w-8" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-xl p-8 border border-gray-200"
        >
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 p-4 border rounded-lg ${
                message.includes("Success") || message.includes("successfully")
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center">
                {message.includes("Success") || message.includes("successfully") ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <p className={`text-sm font-medium ${
                  message.includes("Success") || message.includes("successfully")
                    ? "text-green-700"
                    : "text-red-700"
                }`}>
                  {message}
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Shield className="mr-2 h-4 w-4 text-gray-500" />
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
        <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  {/* Strength Bar */}
                  <div className="flex items-center mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${getStrengthTextColor(passwordStrength.score)}`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>

                  {/* Requirements List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    <div className={`flex items-center ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordStrength.checks.length ? 'text-green-500' : 'text-gray-400'}`} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordStrength.checks.uppercase ? 'text-green-500' : 'text-gray-400'}`} />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordStrength.checks.lowercase ? 'text-green-500' : 'text-gray-400'}`} />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordStrength.checks.number ? 'text-green-500' : 'text-gray-400'}`} />
                      One number
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${passwordStrength.checks.special ? 'text-green-500' : 'text-gray-400'}`} />
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Shield className="mr-2 h-4 w-4 text-gray-500" />
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
          required
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
        />
        <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center text-xs">
                  {password === confirmPassword ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
          type="submit"
              disabled={isLoading || !token || passwordStrength.score < 4 || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                  Updating Password...
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Update Password
                </div>
              )}
            </motion.button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Remember your password?
              </p>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/members-login"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to Login
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-gray-500">
            Secure password reset powered by NextAuth.js
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
