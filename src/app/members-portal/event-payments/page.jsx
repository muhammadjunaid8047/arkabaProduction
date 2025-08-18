"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  Receipt,
  User,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function EventPaymentsPage() {
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchEventPayments();
    }
  }, [session]);

  const fetchEventPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members/event-payments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setPayments(result.payments);
      } else {
        setError(result.error || "Failed to fetch payments");
      }
    } catch (error) {
      setError("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your event payment history.</p>
          <Link href="/members-login" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
                          <h1 className="text-3xl font-bold text-gray-900">Event Payment History</h1>
            <p className="text-gray-600 mt-2">View all your event registrations and payments</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> All registrations are automatically confirmed upon payment. No approval needed.
              </p>
            </div>
            </div>
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Event Payments Found</h3>
            <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
            <Link href="/events" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {payments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {payment.eventRegistration?.title || 'Event Registration'}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {payment.firstName} {payment.lastName}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {new Date(payment.registeredAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                ${payment.amountPaid}
                              </span>
                            </div>
                          </div>
                          
                          {payment.eventRegistration?.eventId && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {payment.eventRegistration.eventId.title} • 
                                {new Date(payment.eventRegistration.eventId.date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                                             <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(payment.paymentStatus)}`}>
                         <div className="flex items-center gap-2">
                           {getPaymentStatusIcon(payment.paymentStatus)}
                           {payment.paymentStatus === 'completed' ? 'Confirmed' : 'Failed'}
                         </div>
                       </span>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Role</div>
                        <div className="font-medium text-gray-900 capitalize">
                          {payment.membershipRole ? 
                            (payment.membershipRole === 'nonMember' ? 'Non-Member' : `${payment.membershipRole} Member`) :
                            (payment.userRole === 'nonMember' ? 'Non-Member' : `${payment.userRole} Member`)
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                                     {/* Payment Details */}
                   <div className="mt-6 pt-6 border-t border-gray-200">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="text-gray-500">Payment ID:</span>
                         <span className="ml-2 font-mono text-gray-900">
                           {payment.paymentIntentId || 'N/A'}
                         </span>
                       </div>
                       
                       <div>
                         <span className="text-gray-500">Registration ID:</span>
                         <span className="ml-2 font-mono text-gray-900">
                           {payment._id}
                         </span>
                       </div>
                     </div>
                     
                     {/* Download Receipt Button */}
                     <div className="mt-4 pt-4 border-t border-gray-200">
                       <div className="flex justify-center">
                         <a
                           href={`/api/registrations/receipt/${payment._id}`}
                           download
                           className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                         >
                           <Receipt className="h-4 w-4 mr-2" />
                           Download Receipt
                         </a>
                       </div>
                     </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
