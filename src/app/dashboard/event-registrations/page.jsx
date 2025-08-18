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
  Mail
} from "lucide-react";
import Link from "next/link";

export default function EventRegistrationsManagement() {
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendees, setAttendees] = useState({});
  const [showAttendees, setShowAttendees] = useState({});

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

    try {
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
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/dashboard/event-registrations/create"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Registration
          </Link>
          <Link
            href="/dashboard/event-management"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Manage Events
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
              <div key={event._id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/dashboard/event-registrations/create?eventId=${event._id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Create Registration
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {registration.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        registration.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registration.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{registration.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Event Date</p>
                          <p className="text-gray-600">
                            {new Date(registration.eventId?.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Registration Deadline</p>
                          <p className="text-gray-600">
                            {new Date(registration.registrationDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">Attendees</p>
                          <p className="text-gray-600">
                            {registration.currentAttendees}
                            {registration.maxAttendees && `/${registration.maxAttendees}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
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
                  
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Link
                      href={`/events/${registration.eventId?._id}/register/${registration._id}`}
                      target="_blank"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Eye className="h-4 w-4" />
                      View Page
                    </Link>
                    
                    <button
                      onClick={() => toggleAttendees(registration._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Users className="h-4 w-4" />
                      View Attendees
                    </button>
                    
                    <button
                      onClick={() => sendReminders(registration._id, registration.eventId?.date)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Mail className="h-4 w-4" />
                      Send Reminders
                    </button>
                    
                    <Link
                      href={`/dashboard/event-registrations/edit/${registration._id}`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => deleteRegistration(registration._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
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

                {/* Attendees Section */}
                {showAttendees[registration._id] && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Registered Attendees:</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> All registrations are automatically completed. Payment status shows the final state.
                      </p>
                    </div>
                    {attendees[registration._id] && attendees[registration._id].length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid gap-3">
                          {attendees[registration._id].map((attendee, index) => (
                            <div key={attendee._id || index} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {attendee.firstName} {attendee.lastName}
                                  </span>
                                  <span className="text-sm text-gray-500">{attendee.email}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    attendee.paymentStatus === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {attendee.paymentStatus === 'completed' ? 'Confirmed' : 'Failed'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Role: {attendee.membershipRole ? 
                                    (attendee.membershipRole === 'nonMember' ? 'Non-Member' : `${attendee.membershipRole} Member`) :
                                    (attendee.userRole === 'nonMember' ? 'Non-Member' : `${attendee.userRole} Member`)
                                  } • Amount: ${attendee.amountPaid} • 
                                  Registered: {new Date(attendee.registeredAt).toLocaleDateString()}
                                </div>
                                
                                {/* Download Receipt Button */}
                                <div className="mt-2">
                                  <a
                                    href={`/api/registrations/receipt/${attendee._id}`}
                                    download
                                    className="inline-flex items-center text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                  >
                                    <Receipt className="h-3 w-3 mr-1" />
                                    Download Receipt
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No attendees registered yet.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
