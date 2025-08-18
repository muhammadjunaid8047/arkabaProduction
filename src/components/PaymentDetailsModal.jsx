"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock, FileText } from "lucide-react";

export default function PaymentDetailsModal({ payment, isOpen, onClose, memberInfo }) {
  const [downloading, setDownloading] = useState(false);
  
  if (!isOpen || !payment) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAmount = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);
      
      // For now, we'll just show a success message
      // In a real implementation, you'd generate a PDF and download it
      alert('Receipt downloaded successfully! (This is a placeholder - actual PDF generation would be implemented here)');
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <div className="flex items-center">
                {getStatusIcon(payment.status)}
                <span className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Amount</span>
              <span className="text-lg font-bold text-gray-900">
                {formatAmount(payment.amount, payment.currency)}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Date</span>
              <div className="flex items-center text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(payment.date)}
              </div>
            </div>

            {/* Currency */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Currency</span>
              <span className="text-gray-900">{payment.currency?.toUpperCase() || 'USD'}</span>
            </div>

            {/* Payment Intent ID */}
            {payment.paymentIntentId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Payment Intent</span>
                <span className="text-sm text-gray-900 font-mono">
                  {payment.paymentIntentId.slice(-12)}
                </span>
              </div>
            )}

            {/* Invoice ID */}
            {payment.invoiceId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Invoice</span>
                <span className="text-sm text-gray-900 font-mono">
                  {payment.invoiceId.slice(-12)}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h3>
              
              {/* Payment Method */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm text-gray-900">Credit Card</span>
              </div>

              {/* Transaction Type */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Transaction Type</span>
                <span className="text-sm text-gray-900">
                  {payment.invoiceId ? 'Subscription' : 'One-time Payment'}
                </span>
              </div>

                           {/* Processing Time */}
             <div className="flex items-center justify-between">
               <span className="text-sm text-gray-600">Processing</span>
               <span className="text-sm text-gray-900">Instant</span>
             </div>

             {/* Membership Expiry */}
             {memberInfo && memberInfo.membershipExpiry && (
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">Membership Expires</span>
                 <span className="text-sm text-gray-900">{formatExpiryDate(memberInfo.membershipExpiry)}</span>
               </div>
             )}
           </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <FileText className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
              {downloading ? 'Downloading...' : 'Download Receipt'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 