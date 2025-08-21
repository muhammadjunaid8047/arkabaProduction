"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Download, 
  Mail,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const registrationId = searchParams.get('id');

  useEffect(() => {
    if (registrationId) {
      fetchRegistrationDetails();
    }
  }, [registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}`);
      const result = await response.json();
      
      if (result.success) {
        setRegistration(result.registration);
      } else {
        setError(result.error || "Failed to fetch registration details");
      }
    } catch (error) {
      setError("Failed to load registration details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load your registration details.</p>
          <Link href="/events" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventTitle = registration.eventRegistrationId?.title || 'Event Registration';
  const eventDate = registration.eventRegistrationId?.eventId?.date ? 
    new Date(registration.eventRegistrationId.eventId.date).toLocaleDateString() : 'TBD';
  const eventLocation = registration.eventRegistrationId?.eventId?.location || 'TBD';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
            <p className="text-lg text-gray-600">Thank you for registering. Your confirmation details are below.</p>
            
            {/* Quick Receipt Notice */}
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <div className="flex items-center gap-2 text-yellow-800">
                <Download className="h-5 w-5" />
                <span className="font-semibold">Don't forget to download your receipt below!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-8">
            {/* Event Details */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{eventTitle}</h2>
              <div className="flex items-center justify-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{eventLocation}</span>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration ID:</span>
                    <span className="font-mono text-gray-900">{registration._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Date:</span>
                    <span className="text-gray-900">
                      {new Date(registration.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900">
                      {registration.firstName} {registration.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{registration.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="text-gray-900 capitalize">
                      {registration.membershipRole ? 
                        (registration.membershipRole === 'nonMember' ? 'Non-Member' : `${registration.membershipRole} Member`) :
                        (registration.userRole === 'nonMember' ? 'Non-Member' : `${registration.userRole} Member`)
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-2xl font-bold text-red-600">${registration.amountPaid}</span>
              </div>
              {registration.paymentIntentId && (
                <div className="mt-2 text-sm text-gray-500">
                  Payment ID: {registration.paymentIntentId}
                </div>
              )}
              
              {/* Quick Receipt Download */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Receipt:</span>
                  <a
                    href={`/api/registrations/receipt/${registration._id}`}
                    download
                    className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            </div>

            {/* Receipt Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Download Your Receipt</h3>
                <p className="text-gray-600">Keep this receipt for your records and event entry</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/api/registrations/receipt/${registration._id}`}
                  download
                  className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Download className="h-6 w-6 mr-3" />
                  Download Receipt (PDF)
                </a>
                
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Mail className="h-6 w-6 mr-3" />
                  Print This Page
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Save the receipt to your device or print it for easy access during the event
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Please save this confirmation for your records</li>
                {registration.amountPaid === 0 && <li>• You will receive an email confirmation shortly</li>}
                <li>• Bring this receipt or confirmation to the event</li>
                <li>• For questions, contact us at support@arkaba.org</li>
              </ul>
            </div>
            
            {/* Email Confirmation Notice - Only show for free registrations */}
            {registration.amountPaid === 0 && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Email Confirmation Sent</h4>
                <p className="text-sm text-green-800">
                  A detailed confirmation email has been sent to <strong>{registration.email}</strong> with all your registration details 
                  and important event information.
                </p>
              </div>
            )}
            
            {/* No Email Notice for Paid Registrations */}
            {registration.amountPaid > 0 && (
              <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-3">📄 Receipt Available</h4>
                <p className="text-sm text-yellow-800">
                  Your registration is confirmed! Download your receipt above for your records. 
                  No email confirmation will be sent - your receipt serves as your confirmation.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 text-center">
              <Link 
                href="/events" 
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
