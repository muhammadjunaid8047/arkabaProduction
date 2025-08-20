"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Receipt,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function EventRegistrationsManagement() {
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendees, setAttendees] = useState({});
  const [showAttendees, setShowAttendees] = useState({});
  const [loadingAttendees, setLoadingAttendees] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regResponse, eventsResponse] = await Promise.all([
        fetch('/api/admin/event-registrations/list'),
        fetch('/api/admin/events/list')
      ]);

      const regResult = await regResponse.json();
      const eventsResult = await eventsResponse.json();

      if (regResult.success) {
        setEventRegistrations(regResult.eventRegistrations);
      }
      if (eventsResult.success) {
        setEvents(eventsResult.events);
      }
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistration = async (id) => {
    if (!confirm("Are you sure you want to delete this event registration? This will disable registration for the event.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/event-registrations/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        fetchData(); // Refresh data
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to delete registration");
    }
  };

  const getEventWithoutRegistration = () => {
    return events.filter(event => 
      !eventRegistrations.some(reg => reg.eventId?._id === event._id)
    );
  };

  const toggleAttendees = async (registrationId) => {
    if (showAttendees[registrationId]) {
      setShowAttendees(prev => ({ ...prev, [registrationId]: false }));
      return;
    }

    // If attendees are already loaded, just show them
    if (attendees[registrationId]) {
      setShowAttendees(prev => ({ ...prev, [registrationId]: true }));
      return;
    }

    try {
      setLoadingAttendees(prev => ({ ...prev, [registrationId]: true }));
      
      const response = await fetch(`/api/admin/event-registrations/${registrationId}/attendees`);
      const result = await response.json();
      
      if (result.success) {
        setAttendees(prev => ({ ...prev, [registrationId]: result.attendees }));
        setShowAttendees(prev => ({ ...prev, [registrationId]: true }));
      } else {
        setError(result.error || "Failed to fetch attendees");
      }
    } catch (error) {
      setError("Failed to fetch attendees");
    } finally {
      setLoadingAttendees(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const sendReminders = async (registrationId, eventDate) => {
    if (!confirm("Send reminder emails to all confirmed attendees for this event?")) {
      return;
    }

    try {
      const response = await fetch('/api/admin/event-registrations/send-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventRegistrationId: registrationId,
          eventDate: eventDate
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Reminder emails sent successfully!\n${result.message}`);
      } else {
        setError(result.error || "Failed to send reminder emails");
      }
    } catch (error) {
      setError("Failed to send reminder emails");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
          <p className="text-gray-600">Manage event registration pages and pricing</p>
        </div>
        
        <div className="flex flex-row gap-2 px-4 sm:px-0 sm:w-auto">
          <Link
            href="/dashboard/event-registrations/create"
            className="bg-red-600 text-white px-[25px] py-3 sm:py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-center min-h-[44px] flex-1 sm:flex-none sm:w-auto"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span>Create Registration</span>
          </Link>
          <Link
            href="/dashboard/event-management"
            className="bg-gray-600 text-white px-[25px] py-3 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-center min-h-[44px] flex-1 sm:flex-none sm:w-auto"
          >
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Events without registration notice */}
      {getEventWithoutRegistration().length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Events without registration:</h3>
          <div className="grid gap-2">
            {getEventWithoutRegistration().map(event => (
              <div key={event._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded border">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 break-words">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/dashboard/event-registrations/create?eventId=${event._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto sm:min-w-[160px]"
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span>Create Registration</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Registrations Grid */}
      {eventRegistrations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Event Registrations</h3>
          <p className="text-gray-500 mb-6">Create your first event registration to get started.</p>
          {getEventWithoutRegistration().length > 0 && (
            <Link
              href="/dashboard/event-registrations/create"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Registration
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {eventRegistrations.map((registration) => (
            <motion.div
              key={registration._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {registration.title}
                      </h3>
                      <span className={`self-start px-2 py-1 rounded-full text-xs font-medium ${
                        registration.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registration.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{registration.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Event Date</p>
                          <p className="text-gray-600">
                            {new Date(registration.eventId?.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Registration Deadline</p>
                          <p className="text-gray-600">
                            {new Date(registration.registrationDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Attendees</p>
                          <p className="text-gray-600">
                            {registration.currentAttendees}
                            {registration.maxAttendees && `/${registration.maxAttendees}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Pricing Range</p>
                          <p className="text-gray-600">
                            ${Math.min(...Object.values(registration.pricing))} - 
                            ${Math.max(...Object.values(registration.pricing))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - mobile optimized */}
                  <div className="w-full lg:w-auto lg:min-w-[200px]">
                    {/* Primary actions - mobile grid layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-2">
                      <Link
                        href={`/events/${registration.eventId?._id}/register/${registration._id}`}
                        target="_blank"
                        className="bg-blue-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center text-sm lg:text-base min-h-[44px]"
                      >
                        <Eye className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline lg:inline">View Page</span>
                        <span className="sm:hidden lg:hidden">View</span>
                      </Link>
                      
                      <button
                        onClick={() => toggleAttendees(registration._id)}
                        disabled={loadingAttendees[registration._id]}
                        className={`${
                          showAttendees[registration._id] 
                            ? 'bg-green-700 hover:bg-green-800' 
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 flex items-center gap-2 justify-center text-sm lg:text-base min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loadingAttendees[registration._id] ? (
                          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                        ) : showAttendees[registration._id] ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <Users className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="hidden sm:inline lg:inline">
                          {loadingAttendees[registration._id] 
                            ? 'Loading...'
                            : showAttendees[registration._id] 
                              ? 'Hide Attendees' 
                              : 'View Attendees'
                          }
                        </span>
                        <span className="sm:hidden lg:hidden">
                          {loadingAttendees[registration._id] 
                            ? 'Loading'
                            : showAttendees[registration._id] 
                              ? 'Hide' 
                              : 'Attendees'
                          }
                        </span>
                        {!loadingAttendees[registration._id] && !showAttendees[registration._id] && (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 ml-1" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => sendReminders(registration._id, registration.eventId?.date)}
                        className="bg-yellow-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 justify-center text-sm lg:text-base min-h-[44px]"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline lg:inline">Send Reminders</span>
                        <span className="sm:hidden lg:hidden">Remind</span>
                      </button>
                      
                      <Link
                        href={`/dashboard/event-registrations/edit/${registration._id}`}
                        className="bg-gray-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 justify-center text-sm lg:text-base min-h-[44px]"
                      >
                        <Edit className="h-4 w-4 flex-shrink-0" />
                        <span>Edit</span>
                      </Link>
                    </div>
                    
                    {/* Destructive action - separate row on mobile */}
                    <div className="mt-2">
                      <button
                        onClick={() => deleteRegistration(registration._id)}
                        className="w-full bg-red-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center text-sm lg:text-base min-h-[44px]"
                      >
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Pricing Details */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">Pricing Tiers:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(registration.pricing).map(([role, price]) => (
                      <div key={role} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium capitalize">
                          {role === 'nonMember' ? 'Non-Member' : `${role} Member`}
                        </p>
                        <p className="text-lg font-bold text-red-600">${price}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Registration Status Indicators */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {new Date(registration.registrationDeadline) < new Date() && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      <XCircle className="h-3 w-3" />
                      Registration Closed
                    </span>
                  )}
                  {registration.maxAttendees && registration.currentAttendees >= registration.maxAttendees && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      <Users className="h-3 w-3" />
                      Full
                    </span>
                  )}
                </div>

                {/* Attendees Section with Animation */}
                {showAttendees[registration._id] && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-6 pt-6 border-t border-gray-200 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <h4 className="font-semibold text-gray-700">Registered Attendees:</h4>
                      {attendees[registration._id] && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {attendees[registration._id].length} attendee{attendees[registration._id].length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"
                    >
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> All registrations are automatically completed. Payment status shows the final state.
                      </p>
                    </motion.div>
                    
                    {attendees[registration._id] && attendees[registration._id].length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="grid gap-3">
                          {attendees[registration._id].map((attendee, index) => (
                            <motion.div 
                              key={attendee._id || index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: 0.1 * index }}
                              className="bg-white p-4 rounded border hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex flex-col gap-3">
                                {/* Name and status row */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-900 break-words">
                                      {attendee.firstName} {attendee.lastName}
                                    </span>
                                    <p className="text-sm text-gray-500 break-all mt-1 sm:mt-0 sm:ml-3 sm:inline">
                                      {attendee.email}
                                    </p>
                                  </div>
                                  <span className={`self-start px-2 py-1 rounded-full text-xs font-medium ${
                                    attendee.paymentStatus === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {attendee.paymentStatus === 'completed' ? 'Confirmed' : 'Failed'}
                                  </span>
                                </div>
                                
                                {/* Details row */}
                                <div className="text-sm text-gray-600">
                                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <span>
                                      <span className="font-medium">Role:</span> {attendee.membershipRole ? 
                                        (attendee.membershipRole === 'nonMember' ? 'Non-Member' : `${attendee.membershipRole} Member`) :
                                        (attendee.userRole === 'nonMember' ? 'Non-Member' : `${attendee.userRole} Member`)
                                      }
                                    </span>
                                    <span>
                                      <span className="font-medium">Amount:</span> ${attendee.amountPaid}
                                    </span>
                                    <span>
                                      <span className="font-medium">Registered:</span> {new Date(attendee.registeredAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Download Receipt Button */}
                                <div className="pt-2 border-t border-gray-100">
                                  <a
                                    href={`/api/registrations/receipt/${attendee._id}`}
                                    download
                                    className="inline-flex items-center text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors min-h-[36px]"
                                  >
                                    <Receipt className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>Download Receipt</span>
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                          No attendees registered yet.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
