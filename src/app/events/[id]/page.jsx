"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import Image from "next/image";

export default function EventDetailPage() {
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }
      
      const data = await response.json();
      console.log("Event data received:", data.event);
      setEvent(data.event);
    } catch (error) {
      console.error("Error fetching event:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/events')}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/events')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
            >
              <Calendar className="h-8 w-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 text-lg text-red-100">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {formatDate(event.date)}
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {event.location}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Event Image */}
                <div className="h-64 sm:h-80 relative">
                  <Image
                    src={event.backgroundImage || "/images/event-2.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/images/event-2.jpg";
                    }}
                  />
                  {event.isBannerEvent && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured Event
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>
                  
                     <div className="prose prose-lg max-w-none">
                     {event.description.split('\n').map((line, index) => {
                       // Handle headings
                       if (line.startsWith('# ')) {
                         return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 first:mt-0 text-gray-900">{line.substring(2)}</h1>;
                       }
                       if (line.startsWith('## ')) {
                         return <h2 key={index} className="text-xl font-semibold mt-5 mb-3 first:mt-0 text-gray-800">{line.substring(3)}</h2>;
                       }
                       
                       // Handle bold text
                       if (line.includes('**')) {
                         const parts = line.split(/(\*\*.*?\*\*)/);
                         return (
                           <p key={index} className={line.trim() === '' ? 'h-4' : 'text-gray-700 leading-relaxed mb-4'}>
                             {parts.map((part, partIndex) => {
                               if (part.startsWith('**') && part.endsWith('**')) {
                                 return <strong key={partIndex} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                               }
                               return part;
                             })}
                           </p>
                         );
                       }
                       
                       // Handle empty lines
                       if (line.trim() === '') {
                         return <div key={index} className="h-4"></div>;
                       }
                       
                       // Regular text
                       return <p key={index} className="text-gray-700 leading-relaxed mb-4">{line}</p>;
                     })}
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                {/* Event Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-3 text-red-600" />
                      <p className="font-medium">{formatDate(event.date)}</p>
                    </div>

                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-3 text-red-600" />
                        <p>{event.location}</p>
                      </div>
                    )}

                    
                  </div>
                </div>

                {/* Registration Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
                  
                                     {/* Registration Status */}
                   <div className="mb-4">
                     {event.eventStatus === 'cancelled' && (
                       <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                         <p className="text-red-800 text-sm font-medium">Event Cancelled</p>
                       </div>
                     )}
                     
                     {event.eventStatus === 'completed' && (
                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                         <p className="text-gray-800 text-sm font-medium">Event Completed</p>
                       </div>
                     )}
                   </div>

                                     {/* Registration Button */}
                   {event.registrationEnabled && event.eventStatus === 'registration-open' ? (
                     <div className="space-y-3">
                       {event.registrationLink ? (
                         <a
                           href={event.registrationLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                         >
                           Register Now
                           <ExternalLink className="ml-2 h-4 w-4" />
                         </a>
                       ) : (
                         <button
                           disabled
                           className="w-full px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                         >
                           Registration Link Not Set
                         </button>
                       )}
                       
                       {/* Registration Info */}
                       {event.registrationDeadline && (
                         <div className="text-sm text-gray-600">
                           <p>Registration closes: {formatDate(event.registrationDeadline)}</p>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="text-center py-4">
                       <p className="text-gray-600 mb-3">
                         {event.eventStatus === 'cancelled' ? 'Event has been cancelled' :
                          event.eventStatus === 'completed' ? 'Event has been completed' :
                          event.eventStatus === 'registration-closed' ? 'Registration is closed' :
                          'Registration is not available'}
                       </p>
                       <button
                         disabled
                         className="w-full px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                       >
                         {event.eventStatus === 'cancelled' ? 'Event Cancelled' :
                          event.eventStatus === 'completed' ? 'Event Completed' :
                          event.eventStatus === 'registration-closed' ? 'Registration Closed' :
                          'Registration Unavailable'}
                       </button>
                     </div>
                   )}
                </div>

                {/* Contact Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                  <p className="text-gray-600 mb-4">
                    Have questions about this event? Contact our team for assistance.
                  </p>
                  <a
                    href="/contact"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
