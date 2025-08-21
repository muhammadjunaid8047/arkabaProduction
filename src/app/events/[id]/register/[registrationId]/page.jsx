"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  User,
  Lock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// PaymentForm component that handles Stripe Elements
function PaymentForm({ registration, eventRegistration, onSuccess, onError, loading, setLoading }) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      onError("Stripe not loaded");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment intent
      const response = await fetch('/api/registrations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registration,
          createPaymentIntent: true
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        onError(result.error || "Failed to create registration");
        setLoading(false);
        return;
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmCardPayment(
        result.paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${registration.firstName} ${registration.lastName}`,
              email: registration.email,
            },
          },
        }
      );

      if (stripeError) {
        onError(stripeError.message);
      } else {
        onSuccess(result.registration);
      }
    } catch (error) {
      onError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "Processing..." : `Pay $${registration.amountPaid} & Register`}
      </button>
    </form>
  );
}

export default function EventRegistrationPage({ params }) {
  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eventRegistration, setEventRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successRegistration, setSuccessRegistration] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    customFieldResponses: []
  });
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch event registration data
  useEffect(() => {
    fetchEventRegistration();
  }, [unwrappedParams.registrationId]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (session?.user) {
      setRegistrationData(prev => ({
        ...prev,
        firstName: session.user.name?.split(' ')[0] || "",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
        email: session.user.email || ""
      }));
    }
  }, [session]);

  const fetchEventRegistration = async () => {
    try {
      const response = await fetch(`/api/event-registrations/${unwrappedParams.registrationId}`);
      const result = await response.json();
      
      if (result.success) {
        setEventRegistration(result.eventRegistration);
      } else {
        setError(result.error || "Event registration not found");
      }
    } catch (error) {
      setError("Failed to load event registration");
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = () => {
    if (!session?.user) return "nonMember";
    return session.user.role || "nonMember";
  };

  // Map membership roles to event pricing roles
  const getEventPricingRole = (membershipRole) => {
    const roleMapping = {
      'studentbt': 'student',  // Map studentbt membership to student event pricing
      'full': 'full',
      'affiliate': 'affiliate',
      'nonMember': 'nonMember'
    };
    return roleMapping[membershipRole] || 'nonMember';
  };

  const getCurrentPrice = () => {
    if (!eventRegistration) return 0;
    const membershipRole = getUserRole();
    const eventPricingRole = getEventPricingRole(membershipRole);
    return eventRegistration.pricing[eventPricingRole] || eventRegistration.pricing.nonMember;
  };

  const handleInputChange = (field, value) => {
    // Allow all fields to be editable for all users
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setRegistrationData(prev => ({
      ...prev,
      customFieldResponses: prev.customFieldResponses.map(response => 
        response.fieldName === fieldName 
          ? { ...response, response: value }
          : response
      ).concat(
        prev.customFieldResponses.find(r => r.fieldName === fieldName) 
          ? [] 
          : [{ fieldName, response: value }]
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const userRole = getUserRole();
    const amountPaid = getCurrentPrice();
    
    const registrationPayload = {
      eventRegistrationId: unwrappedParams.registrationId,
      userId: session?.user?.id || null,
      userRole,
      amountPaid,
      ...registrationData
    };

    if (amountPaid > 0) {
      // Show payment form
      setShowPayment(true);
      setSubmitting(false);
    } else {
      // Free registration
      try {
        const response = await fetch('/api/registrations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationPayload)
        });

        const result = await response.json();
        
        if (result.success) {
          setSuccess(true);
          setSuccessRegistration(result.registration);
        } else {
          setError(result.error || "Registration failed");
        }
      } catch (error) {
        setError("Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const onPaymentSuccess = (registration) => {
    setSuccess(true);
    setSuccessRegistration(registration);
    setShowPayment(false);
  };

  const onPaymentError = (errorMessage) => {
    setError(errorMessage);
    setShowPayment(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/events" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-6">
            You have successfully registered for {eventRegistration?.eventId?.title}. 
            {eventRegistration?.requiresApproval && " Your registration is pending approval."}
          </p>
          <div className="space-y-3">
            {/* Download Receipt Button */}
            {successRegistration && (
              <a 
                href={`/api/registrations/receipt/${successRegistration._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
              >
                📄 Download Registration Receipt
              </a>
            )}
            <Link href="/events" className="block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              Back to Events
            </Link>
            {session && (
              <Link href="/members-portal" className="block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                View My Registrations
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const userRole = getUserRole();
  const currentPrice = getCurrentPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Header */}
      <div className="relative h-64 bg-gradient-to-r from-red-600 to-red-800">
        {eventRegistration?.eventId?.backgroundImage && (
          <Image
            src={eventRegistration.eventId.backgroundImage}
            alt={eventRegistration.eventId.title}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Register for {eventRegistration?.eventId?.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(eventRegistration?.eventId?.date).toLocaleDateString()}
              </div>
              {eventRegistration?.eventId?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {eventRegistration.eventId.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Registration closes: {new Date(eventRegistration?.registrationDeadline).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Registration Information</h2>
              
              {/* Login Prompt for Non-Members */}
              {!session && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Get Personalized Pricing</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        Sign in to get member pricing and faster checkout.
                      </p>
                      <Link href="/members-login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {showPayment ? (
                <Elements stripe={stripePromise}>
                                     <PaymentForm
                     registration={{
                       eventRegistrationId: unwrappedParams.registrationId,
                       userId: session?.user?.id || null,
                       userRole,
                       amountPaid: currentPrice,
                       ...registrationData
                     }}
                     eventRegistration={eventRegistration}
                     onSuccess={onPaymentSuccess}
                     onError={onPaymentError}
                     loading={submitting}
                     setLoading={setSubmitting}
                   />
                </Elements>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Information Notice for Signed-in Users */}
                  {session?.user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> You can edit your name and contact information for this registration. 
                          Your account email will be used for confirmation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={registrationData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={registrationData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Custom Fields */}
                  {eventRegistration?.customFields?.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.fieldName} {field.isRequired && "*"}
                      </label>
                      {field.fieldType === 'textarea' ? (
                        <textarea
                          required={field.isRequired}
                          onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                          rows={3}
                        />
                      ) : field.fieldType === 'select' ? (
                        <select
                          required={field.isRequired}
                          onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((option, optIndex) => (
                            <option key={optIndex} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.fieldType}
                          required={field.isRequired}
                          onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      )}
                    </div>
                  ))}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-700">{error}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {submitting ? "Processing..." : 
                     currentPrice > 0 ? `Continue to Payment ($${currentPrice})` : "Register for Free"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Pricing & Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Registration Details</h3>
              
              {/* Current User Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Your Status:</span>
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  {session ? `${userRole} Member` : "Non-Member"} 
                  {session && userRole === 'studentbt' && (
                    <span className="block text-xs text-gray-500 mt-1">
                      (Student & BT pricing applies)
                    </span>
                  )}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-600">${currentPrice}</span>
                </div>
              </div>

              {/* All Pricing Tiers */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Pricing Tiers:</h4>
                {Object.entries(eventRegistration?.pricing || {}).map(([role, price]) => {
                  // Check if this pricing tier applies to the current user
                  const isCurrentUserTier = getEventPricingRole(userRole) === role;
                  
                  return (
                    <div 
                      key={role}
                      className={`flex justify-between p-3 rounded-lg ${
                        isCurrentUserTier ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="capitalize font-medium">
                        {role === 'nonMember' ? 'Non-Member' : 
                         role === 'student' ? 'Student & BT Member' : 
                         `${role} Member`}
                      </span>
                      <span className="font-bold">${price}</span>
                    </div>
                  );
                })}
              </div>

              {/* Event Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Event Information:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {eventRegistration?.maxAttendees 
                        ? `${eventRegistration.currentAttendees}/${eventRegistration.maxAttendees} registered`
                        : `${eventRegistration?.currentAttendees || 0} registered`
                      }
                    </span>
                  </div>
                  {eventRegistration?.requiresApproval && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Requires approval</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


//             {eventRegistration?.requiresApproval && " Your registration is pending approval."}

//           </p>

//           <div className="space-y-3">

//             <Link href="/events" className="block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">

//               Back to Events

//             </Link>

//             {session && (

//               <Link href="/members-portal" className="block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">

//                 View My Registrations

//               </Link>

//             )}

//           </div>

//         </div>

//       </div>

//     );

//   }



//   const userRole = getUserRole();

//   const currentPrice = getCurrentPrice();



//   return (

//     <div className="min-h-screen bg-gray-50">

//       {/* Event Header */}

//       <div className="relative h-64 bg-gradient-to-r from-red-600 to-red-800">

//         {eventRegistration?.eventId?.backgroundImage && (

//           <Image

//             src={eventRegistration.eventId.backgroundImage}

//             alt={eventRegistration.eventId.title}

//             fill

//             className="object-cover opacity-30"

//           />

//         )}

//         <div className="absolute inset-0 bg-black/50" />

//         <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex items-center">

//           <div className="text-white">

//             <h1 className="text-3xl md:text-4xl font-bold mb-4">

//               Register for {eventRegistration?.eventId?.title}

//             </h1>

//             <div className="flex flex-wrap gap-6 text-sm">

//               <div className="flex items-center gap-2">

//                 <Calendar className="h-4 w-4" />

//                 {new Date(eventRegistration?.eventId?.date).toLocaleDateString()}

//               </div>

//               {eventRegistration?.eventId?.location && (

//                 <div className="flex items-center gap-2">

//                   <MapPin className="h-4 w-4" />

//                   {eventRegistration.eventId.location}

//                 </div>

//               )}

//               <div className="flex items-center gap-2">

//                 <Clock className="h-4 w-4" />

//                 Registration closes: {new Date(eventRegistration?.registrationDeadline).toLocaleDateString()}

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>



//       <div className="max-w-4xl mx-auto px-4 py-8">

//         <div className="grid lg:grid-cols-3 gap-8">

//           {/* Registration Form */}

//           <div className="lg:col-span-2">

//             <div className="bg-white rounded-lg shadow-lg p-6">

//               <h2 className="text-2xl font-bold mb-6">Registration Information</h2>

              

//               {/* Login Prompt for Non-Members */}

//               {!session && (

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">

//                   <div className="flex items-start gap-3">

//                     <Lock className="h-5 w-5 text-blue-600 mt-0.5" />

//                     <div>

//                       <h3 className="font-semibold text-blue-900">Get Personalized Pricing</h3>

//                       <p className="text-blue-700 text-sm mb-3">

//                         Sign in to get member pricing and faster checkout.

//                       </p>

//                       <Link href="/members-login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">

//                         Sign In

//                       </Link>

//                     </div>

//                   </div>

//                 </div>

//               )}



//               {showPayment ? (

//                 <Elements stripe={stripePromise}>

//                                      <PaymentForm

//                      registration={{

//                        eventRegistrationId: unwrappedParams.registrationId,

//                        userId: session?.user?.id || null,

//                        userRole,

//                        amountPaid: currentPrice,

//                        ...registrationData

//                      }}

//                      eventRegistration={eventRegistration}

//                      onSuccess={onPaymentSuccess}

//                      onError={onPaymentError}

//                      loading={submitting}

//                      setLoading={setSubmitting}

//                    />

//                 </Elements>

//               ) : (

//                 <form onSubmit={handleSubmit} className="space-y-6">

//                   {/* Information Notice for Signed-in Users */}

//                   {session?.user && (

//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

//                       <div className="flex items-center gap-2">

//                         <User className="h-4 w-4 text-blue-600" />

//                         <p className="text-sm text-blue-700">

//                           <strong>Note:</strong> You can edit your name and contact information for this registration. 

//                           Your account email will be used for confirmation.

//                         </p>

//                       </div>

//                     </div>

//                   )}



//                   {/* Personal Information */}

//                   <div className="grid md:grid-cols-2 gap-4">

//                     <div>

//                       <label className="block text-sm font-medium text-gray-700 mb-2">

//                         First Name *

//                       </label>

//                       <input

//                         type="text"

//                         required

//                         value={registrationData.firstName}

//                         onChange={(e) => handleInputChange('firstName', e.target.value)}

//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                       />

//                     </div>

//                     <div>

//                       <label className="block text-sm font-medium text-gray-700 mb-2">

//                         Last Name *

//                       </label>

//                       <input

//                         type="text"

//                         required

//                         value={registrationData.lastName}

//                         onChange={(e) => handleInputChange('lastName', e.target.value)}

//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                       />

//                     </div>

//                   </div>



//                   <div>

//                     <label className="block text-sm font-medium text-gray-700 mb-2">

//                       Email Address *

//                     </label>

//                     <input

//                       type="email"

//                       required

//                       value={registrationData.email}

//                       onChange={(e) => handleInputChange('email', e.target.value)}

//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                     />

//                   </div>



//                   <div>

//                     <label className="block text-sm font-medium text-gray-700 mb-2">

//                       Phone Number

//                     </label>

//                     <input

//                       type="tel"

//                       value={registrationData.phone}

//                       onChange={(e) => handleInputChange('phone', e.target.value)}

//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                     />

//                   </div>



//                   {/* Custom Fields */}

//                   {eventRegistration?.customFields?.map((field, index) => (

//                     <div key={index}>

//                       <label className="block text-sm font-medium text-gray-700 mb-2">

//                         {field.fieldName} {field.isRequired && "*"}

//                       </label>

//                       {field.fieldType === 'textarea' ? (

//                         <textarea

//                           required={field.isRequired}

//                           onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}

//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                           rows={3}

//                         />

//                       ) : field.fieldType === 'select' ? (

//                         <select

//                           required={field.isRequired}

//                           onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}

//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                         >

//                           <option value="">Select an option</option>

//                           {field.options?.map((option, optIndex) => (

//                             <option key={optIndex} value={option}>{option}</option>

//                           ))}

//                         </select>

//                       ) : (

//                         <input

//                           type={field.fieldType}

//                           required={field.isRequired}

//                           onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}

//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"

//                         />

//                       )}

//                     </div>

//                   ))}



//                   {error && (

//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">

//                       <div className="flex items-center gap-2">

//                         <AlertCircle className="h-5 w-5 text-red-600" />

//                         <span className="text-red-700">{error}</span>

//                       </div>

//                     </div>

//                   )}



//                   <button

//                     type="submit"

//                     disabled={submitting}

//                     className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"

//                   >

//                     {submitting ? "Processing..." : 

//                      currentPrice > 0 ? `Continue to Payment ($${currentPrice})` : "Register for Free"}

//                   </button>

//                 </form>

//               )}

//             </div>

//           </div>



//           {/* Pricing & Info Sidebar */}

//           <div className="lg:col-span-1">

//             <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">

//               <h3 className="text-xl font-bold mb-4">Registration Details</h3>

              

//               {/* Current User Status */}

//               <div className="bg-gray-50 rounded-lg p-4 mb-6">

//                 <div className="flex items-center gap-2 mb-2">

//                   <User className="h-4 w-4" />

//                   <span className="font-medium">Your Status:</span>

//                 </div>

//                 <p className="text-sm text-gray-600 capitalize">

//                   {session ? `${userRole} Member` : "Non-Member"} 

//                   {session && userRole === 'studentbt' && (

//                     <span className="block text-xs text-gray-500 mt-1">

//                       (Student & BT pricing applies)

//                     </span>

//                   )}

//                 </p>

//                 <div className="mt-2 flex items-center gap-2">

//                   <DollarSign className="h-4 w-4 text-green-600" />

//                   <span className="font-bold text-green-600">${currentPrice}</span>

//                 </div>

//               </div>



//               {/* All Pricing Tiers */}

//               <div className="space-y-3">

//                 <h4 className="font-semibold text-gray-700">Pricing Tiers:</h4>

//                 {Object.entries(eventRegistration?.pricing || {}).map(([role, price]) => {

//                   // Check if this pricing tier applies to the current user

//                   const isCurrentUserTier = getEventPricingRole(userRole) === role;

                  

//                   return (

//                     <div 

//                       key={role}

//                       className={`flex justify-between p-3 rounded-lg ${

//                         isCurrentUserTier ? 'bg-red-50 border border-red-200' : 'bg-gray-50'

//                       }`}

//                     >

//                       <span className="capitalize font-medium">

//                         {role === 'nonMember' ? 'Non-Member' : 

//                          role === 'student' ? 'Student & BT Member' : 

//                          `${role} Member`}

//                       </span>

//                       <span className="font-bold">${price}</span>

//                     </div>

//                   );

//                 })}

//               </div>



//               {/* Event Info */}

//               <div className="mt-6 pt-6 border-t border-gray-200">

//                 <h4 className="font-semibold text-gray-700 mb-3">Event Information:</h4>

//                 <div className="space-y-2 text-sm text-gray-600">

//                   <div className="flex items-center gap-2">

//                     <Users className="h-4 w-4" />

//                     <span>

//                       {eventRegistration?.maxAttendees 

//                         ? `${eventRegistration.currentAttendees}/${eventRegistration.maxAttendees} registered`

//                         : `${eventRegistration?.currentAttendees || 0} registered`

//                       }

//                     </span>

//                   </div>

//                   {eventRegistration?.requiresApproval && (

//                     <div className="flex items-center gap-2">

//                       <AlertCircle className="h-4 w-4" />

//                       <span>Requires approval</span>

//                     </div>

//                   )}

//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>

//   );

// }


