"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Image as ImageIcon,
  Eye,
  EyeOff
} from "lucide-react";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    backgroundImage: "",
    date: "",
    location: "",
    isBannerEvent: false,
    isActive: true,
    // Registration fields
    registrationEnabled: false,
    registrationLink: "",
    registrationDeadline: "",
    // Event status
    eventStatus: "upcoming"
  });



  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events/list");
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingEvent 
        ? `/api/admin/events/update/${editingEvent._id}`
        : "/api/admin/events/create";
      
      const method = editingEvent ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsModalOpen(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
      } else {
        const errorData = await response.json();
        console.error("Failed to save event:", errorData);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      backgroundImage: event.backgroundImage,
      date: new Date(event.date).toISOString().split('T')[0],
      location: event.location,
      isBannerEvent: event.isBannerEvent,
      isActive: event.isActive,
      // Registration fields
      registrationEnabled: event.registrationEnabled || false,
      registrationLink: event.registrationLink || "",
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : "",
      // Event status
      eventStatus: event.eventStatus || "upcoming"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const response = await fetch(`/api/admin/events/delete/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEvents();
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      backgroundImage: "",
      date: "",
      location: "",
      isBannerEvent: false,
      isActive: true,
      // Registration fields
      registrationEnabled: false,
      registrationLink: "",
      registrationDeadline: "",
      // Event status
      eventStatus: "upcoming"
    });
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    resetForm();
    setIsModalOpen(true);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p className="text-gray-600">Manage upcoming events and banner content</p>
        </div>

        {/* Add Event Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="mb-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Event
        </motion.button>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Event Image */}
              <div className="h-48 relative">
                <img
                  src={event.backgroundImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {event.isBannerEvent && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Banner
                    </span>
                  )}
                  {!event.isActive && (
                    <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Event Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(event.date)}
                </div>

                {event.location && (
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                )}

                {/* Registration Status */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.eventStatus === 'registration-open' ? 'bg-green-100 text-green-800' :
                      event.eventStatus === 'registration-closed' ? 'bg-yellow-100 text-yellow-800' :
                      event.eventStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                      event.eventStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.eventStatus === 'registration-open' ? 'Registration Open' :
                       event.eventStatus === 'registration-closed' ? 'Registration Closed' :
                       event.eventStatus === 'cancelled' ? 'Cancelled' :
                       event.eventStatus === 'completed' ? 'Completed' :
                       'Upcoming'}
                    </span>
                  </div>
                  
                  {event.registrationEnabled && event.registrationDeadline && (
                    <span className="text-gray-500 text-xs">
                      Closes: {new Date(event.registrationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">Create your first event to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                
                {/* Basic Text Editor Toolbar */}
                <div className="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = textarea.value.substring(start, end);
                      const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
                      setFormData({...formData, description: newText});
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 2, end + 2);
                      }, 0);
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold"
                    title="Bold"
                  >
                    B
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = textarea.value.substring(start, end);
                      const newText = textarea.value.substring(0, start) + `# ${selectedText}` + textarea.value.substring(end);
                      setFormData({...formData, description: newText});
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 2, end + 2);
                      }, 0);
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Heading"
                  >
                    H1
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea');
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = textarea.value.substring(start, end);
                      const newText = textarea.value.substring(0, start) + `## ${selectedText}` + textarea.value.substring(end);
                      setFormData({...formData, description: newText});
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 3, end + 3);
                      }, 0);
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Subheading"
                  >
                    H2
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('description-textarea');
                      const start = textarea.selectionStart;
                      const newText = textarea.value.substring(0, start) + '\n\n' + textarea.value.substring(start);
                      setFormData({...formData, description: newText});
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 2, start + 2);
                      }, 0);
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                    title="Line Break"
                  >
                    ↵
                  </button>
                </div>
                
                <textarea
                  id="description-textarea"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Event description... Use the toolbar above for basic formatting:&#10;&#10;**Bold text**&#10;# Main Heading&#10;## Subheading&#10;&#10;Line breaks will be preserved when displayed."
                  className="w-full px-3 py-2 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                />
                
                {/* Preview */}
                {formData.description && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="text-xs text-gray-500 mb-2 font-semibold">Preview:</div>
                    <div className="prose prose-sm max-w-none">
                      {formData.description.split('\n').map((line, index) => {
                        // Handle headings
                        if (line.startsWith('# ')) {
                          return <h1 key={index} className="text-xl font-bold mt-4 mb-2 first:mt-0">{line.substring(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-lg font-semibold mt-3 mb-2 first:mt-0">{line.substring(3)}</h2>;
                        }
                        
                        // Handle bold text
                        if (line.includes('**')) {
                          const parts = line.split(/(\*\*.*?\*\*)/);
                          return (
                            <p key={index} className={line.trim() === '' ? 'h-4' : 'mb-2'}>
                              {parts.map((part, partIndex) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
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
                        return <p key={index} className="mb-2">{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.backgroundImage}
                  onChange={(e) => setFormData({...formData, backgroundImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isBannerEvent}
                    onChange={(e) => setFormData({...formData, isBannerEvent: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show in Home Banner</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              {/* Registration Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Registration Settings</h3>
                
                <div className="space-y-4">
                                     <div className="flex items-center">
                     <input
                       type="checkbox"
                       id="registrationEnabled"
                       checked={formData.registrationEnabled}
                       onChange={(e) => setFormData({...formData, registrationEnabled: e.target.checked})}
                       className="mr-2"
                     />
                     <label htmlFor="registrationEnabled" className="text-sm text-gray-700">
                       Enable Registration
                     </label>
                   </div>

                  {formData.registrationEnabled && (
                    <>
                                             <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Registration Link
                         </label>
                         <input
                           type="text"
                           value={formData.registrationLink}
                           onChange={(e) => setFormData({...formData, registrationLink: e.target.value})}
                           placeholder="https://example.com/register"
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                         />
                         <p className="text-xs text-gray-500 mt-1">
                           Enter the registration URL. URL parameters will be preserved.
                         </p>
                       </div>

                                             <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Registration Deadline
                         </label>
                         <input
                           type="date"
                           value={formData.registrationDeadline}
                           onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                         />
                       </div>
                    </>
                  )}
                </div>
              </div>

              {/* Event Status Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Event Status</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Status
                  </label>
                                     <select
                     value={formData.eventStatus}
                     onChange={(e) => setFormData({...formData, eventStatus: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                   >
                    <option value="upcoming">Upcoming</option>
                    <option value="registration-open">Registration Open</option>
                    <option value="registration-closed">Registration Closed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>

                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 