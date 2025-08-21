"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import PaymentDetailsModal from "@/components/PaymentDetailsModal";

export default function PaymentHistoryPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isExpiredRedirect = searchParams.get('expired') === 'true';
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, failed, pending
  const [sortBy, setSortBy] = useState('date'); // date, amount, status
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchPaymentHistory();
    }
  }, [session, status]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/member/payment-history?email=${session.user.email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      
      const data = await response.json();
      setPaymentHistory(data.paymentHistory || []);
      setMemberInfo(data.member || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const filteredPayments = paymentHistory
    .filter(payment => {
      if (filter === 'all') return true;
      return payment.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'amount':
          return b.amount - a.amount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const failedPayments = filteredPayments.filter(p => p.status === 'failed').length;

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (dateString) => {
    if (!dateString) return null;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <p className="text-gray-600 mb-4">Please log in to view your payment history.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
                             <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                 {memberInfo && (
                   <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                     getDaysUntilExpiry(memberInfo.membershipExpiry) < 0
                       ? 'bg-red-100 text-red-800 border-2 border-red-300'
                       : memberInfo.membershipStatus === 'active' 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-red-100 text-red-800'
                   }`}>
                     {getDaysUntilExpiry(memberInfo.membershipExpiry) < 0 
                       ? 'EXPIRED' 
                       : memberInfo.membershipStatus.charAt(0).toUpperCase() + memberInfo.membershipStatus.slice(1)} Member
                   </span>
                 )}
               </div>
              <p className="text-gray-600">View all your payment transactions and receipts</p>
            </div>
            {/* <button
              onClick={fetchPaymentHistory}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button> */}
          </div>
        </motion.div>

        {/* Expired Membership Redirect Alert */}
        {isExpiredRedirect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  🚫 Access Restricted - Membership Expired
                </h3>
                <p className="text-red-700 mb-4">
                  Your ArkABA membership has expired and you've been redirected here from a members-only area. 
                  To continue accessing member benefits, features, and resources, please renew your membership below.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/membership-renewal"
                    className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🔄 Renew Membership Now
                  </a>
                  <a
                    href="/members-portal"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-600 border border-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ← Back to Member Portal
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Membership Information */}
        {memberInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`rounded-lg shadow p-6 mb-8 ${
              getDaysUntilExpiry(memberInfo.membershipExpiry) < 0 
                ? 'bg-red-50 border-2 border-red-200' 
                : 'bg-white'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Membership Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {memberInfo.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      memberInfo.membershipStatus === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {memberInfo.membershipStatus.charAt(0).toUpperCase() + memberInfo.membershipStatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatExpiryDate(memberInfo.membershipExpiry)}
                    </p>
                  </div>
                </div>
              </div>
                             <div className="flex items-center">
                 {(() => {
                   const daysUntilExpiry = getDaysUntilExpiry(memberInfo.membershipExpiry);
                   if (daysUntilExpiry !== null) {
                     if (daysUntilExpiry < 0) {
                       return (
                         <div className="text-center">
                           <p className="text-2xl font-bold text-red-600">{Math.abs(daysUntilExpiry)}</p>
                           <p className="text-sm text-red-600">Days Expired</p>
                         </div>
                       );
                     } else if (daysUntilExpiry === 0) {
                       return (
                         <div className="text-center">
                           <p className="text-2xl font-bold text-orange-600">0</p>
                           <p className="text-sm text-orange-600">Expires Today</p>
                         </div>
                       );
                     } else if (daysUntilExpiry <= 30) {
                       return (
                         <div className="text-center">
                           <p className="text-2xl font-bold text-orange-600">{daysUntilExpiry}</p>
                           <p className="text-sm text-orange-600">Days Left</p>
                         </div>
                       );
                     } else {
                       return (
                         <div className="text-center">
                           <p className="text-2xl font-bold text-green-600">{daysUntilExpiry}</p>
                           <p className="text-sm text-green-600">Days Left</p>
                         </div>
                       );
                     }
                   }
                   return null;
                 })()}
               </div>
             </div>
             
             {/* Renewal Banner for Expired Members */}
             {getDaysUntilExpiry(memberInfo.membershipExpiry) < 0 && (
               <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                   <div className="mb-4 md:mb-0">
                     <h3 className="text-lg font-semibold text-red-800 mb-2">
                       ⚠️ Your membership has expired
                     </h3>
                     <p className="text-red-700">
                       Your ArkABA membership expired on {formatExpiryDate(memberInfo.membershipExpiry)}. 
                       Renew now to continue accessing member benefits and resources.
                     </p>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <a
                       href="/membership-renewal"
                       className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                     >
                       Renew Membership
                     </a>
                     <button
                       onClick={() => {
                         // Show membership benefits modal or redirect to benefits page
                         alert('Membership benefits include:\n• Access to exclusive resources\n• Event discounts\n• Professional networking\n• Continuing education credits\n• Job board access');
                       }}
                       className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-600 border border-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                     >
                       View Benefits
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Warning Banner for Members Close to Expiry */}
             {(() => {
               const daysUntilExpiry = getDaysUntilExpiry(memberInfo.membershipExpiry);
               return daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30 ? (
                 <div className="mt-6 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                   <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                     <div className="mb-4 md:mb-0">
                       <h3 className="text-lg font-semibold text-orange-800 mb-2">
                         ⏰ Your membership expires soon
                       </h3>
                       <p className="text-orange-700">
                         Your ArkABA membership expires on {formatExpiryDate(memberInfo.membershipExpiry)} 
                         ({daysUntilExpiry} days remaining). Renew early to avoid any interruption in your benefits.
                       </p>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                                               <a
                          href="/membership-renewal"
                          className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Renew Early
                        </a>
                       <button
                         onClick={() => {
                           // Show membership benefits modal or redirect to benefits page
                           alert('Membership benefits include:\n• Access to exclusive resources\n• Event discounts\n• Professional networking\n• Continuing education credits\n• Job board access');
                         }}
                         className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 border border-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                       >
                         View Benefits
                       </button>
                     </div>
                   </div>
                 </div>
               ) : null;
             })()}
           </motion.div>
         )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{completedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{failedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              </div>
            </div>
          </div>

          {/* Membership Status Card */}
          {memberInfo && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membership Expires</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatExpiryDate(memberInfo.membershipExpiry)}
                  </p>
                  {(() => {
                    const daysUntilExpiry = getDaysUntilExpiry(memberInfo.membershipExpiry);
                    if (daysUntilExpiry !== null) {
                      if (daysUntilExpiry < 0) {
                        return <p className="text-sm text-red-600">Expired {Math.abs(daysUntilExpiry)} days ago</p>;
                      } else if (daysUntilExpiry === 0) {
                        return <p className="text-sm text-orange-600">Expires today</p>;
                      } else if (daysUntilExpiry <= 30) {
                        return <p className="text-sm text-orange-600">{daysUntilExpiry} days remaining</p>;
                      } else {
                        return <p className="text-sm text-green-600">{daysUntilExpiry} days remaining</p>;
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Payments</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                // Export functionality could be added here
                alert('Export functionality coming soon!');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Payment History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchPaymentHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't made any payments yet." 
                  : `No ${filter} payments found.`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.paymentIntentId || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.paymentIntentId ? `PI_${payment.paymentIntentId.slice(-8)}` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.invoiceId ? `INV_${payment.invoiceId.slice(-8)}` : 'Direct Payment'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(payment.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        memberInfo={memberInfo}
      />
    </div>
  );
} 