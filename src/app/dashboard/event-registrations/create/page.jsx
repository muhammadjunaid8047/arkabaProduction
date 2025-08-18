"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  Trash2, 
  AlertCircle,
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

export default function CreateEventRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('eventId');
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    eventId: preselectedEventId || "",
    title: "",
    description: "",
    pricing: {
      student: 10,
      full: 50,
      affiliate: 30,
      nonMember: 100
    },
    registrationDeadline: "",
    maxAttendees: "",
    customFields: [],
    confirmationEmailTemplate: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (preselectedEventId && events.length > 0) {
      const selectedEvent = events.find(e => e._id === preselectedEventId);
      if (selectedEvent) {
        setFormData(prev => ({
          ...prev,
          eventId: preselectedEventId,
          title: `${selectedEvent.title} Registration`,
          description: `Register for ${selectedEvent.title}. ${selectedEvent.description}`
        }));
      }
    }
  }, [preselectedEventId, events]);

  const fetchEvents = async () => {
    try {
      console.log("Fetching events...");
      const response = await fetch('/api/admin/events/list');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Events API response:", result);
      
      if (result.success) {
        // Show all events, we'll handle registration conflicts in the backend
        setEvents(result.events || []);
        console.log("Events loaded:", result.events?.length || 0);
      } else {
        console.error("Events API error:", result.error);
        setError(`Failed to fetch events: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Events fetch error:", error);
      setError(`Failed to fetch events: ${error.message}`);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('pricing.')) {
      const pricingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [pricingField]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          fieldName: "",
          fieldType: "text",
          isRequired: false,
          options: []
        }
      ]
    }));
  };

  const updateCustomField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((customField, i) =>
        i === index ? { ...customField, [field]: value } : customField
      )
    }));
  };

  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const addOption = (fieldIndex) => {
    const newOptions = [...formData.customFields[fieldIndex].options, ""];
    updateCustomField(fieldIndex, 'options', newOptions);
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const newOptions = formData.customFields[fieldIndex].options.map((option, i) =>
      i === optionIndex ? value : option
    );
    updateCustomField(fieldIndex, 'options', newOptions);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const newOptions = formData.customFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    updateCustomField(fieldIndex, 'options', newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form data
    if (!formData.title || !formData.description || !formData.registrationDeadline) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // For standalone registrations, we don't need an eventId
    const submitData = {
      ...formData,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
    };

    // If it's a standalone registration, remove the eventId
    if (formData.eventId === "standalone") {
      delete submitData.eventId;
    }

    try {
      const response = await fetch('/api/admin/event-registrations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/event-registrations');
      } else {
        setError(result.error || "Failed to create event registration");
      }
    } catch (error) {
      setError("Failed to create event registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/event-registrations"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Event Registration</h1>
          <p className="text-gray-600">Set up registration page and pricing for an event or create a standalone registration</p>
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

      {events.length === 0 && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Events Available</h3>
            <p className="text-blue-700 mb-4">
              No events found in the system. You can still create a standalone registration page for workshops, courses, or general registrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/event-management"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Events First
              </Link>
              <button
                onClick={() => setFormData(prev => ({ ...prev, eventId: "standalone" }))}
                className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Standalone Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {error && events.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Events API Error</h3>
            <p className="text-yellow-700 mb-4">
              There was an issue loading events from the system. You can still create standalone registrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setError("");
                  fetchEvents();
                }}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Retry Loading Events
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, eventId: "standalone" }))}
                className="inline-flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Standalone Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {(events.length > 0 || formData.eventId === "standalone") && (
        <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          
          {formData.eventId === "standalone" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Standalone Registration</h3>
                  <p className="text-yellow-700 text-sm">
                    This registration page will not be linked to any specific event. It can be used for general registrations, workshops, or courses.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
                             <select
                 value={formData.eventId}
                 onChange={(e) => handleInputChange('eventId', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
               >
                 <option value="">Select an event (optional)</option>
                 <option value="standalone">Standalone Registration (No Event)</option>
                 {events.length > 0 ? (
                   events.map(event => (
                     <option key={event._id} value={event._id}>
                       {event.title} - {new Date(event.date).toLocaleDateString()}
                     </option>
                   ))
                 ) : (
                   <option value="" disabled>No events available</option>
                 )}
               </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose "Standalone Registration" to create a registration page not linked to any specific event
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Annual Conference Registration"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what attendees can expect..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                placeholder="Leave empty for unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>


          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Tiers
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Members ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pricing.student}
                onChange={(e) => handleInputChange('pricing.student', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Members ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pricing.full}
                onChange={(e) => handleInputChange('pricing.full', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Members ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pricing.affiliate}
                onChange={(e) => handleInputChange('pricing.affiliate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Non-Members ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pricing.nonMember}
                onChange={(e) => handleInputChange('pricing.nonMember', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Custom Fields Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Custom Registration Fields</h2>
            <button
              type="button"
              onClick={addCustomField}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>

          {formData.customFields.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No custom fields added. Click "Add Field" to create additional registration questions.
            </p>
          ) : (
            <div className="space-y-6">
              {formData.customFields.map((field, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Field {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.fieldName}
                        onChange={(e) => updateCustomField(index, 'fieldName', e.target.value)}
                        placeholder="e.g., Dietary Requirements"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Type
                      </label>
                      <select
                        value={field.fieldType}
                        onChange={(e) => updateCustomField(index, 'fieldType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-8">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.isRequired}
                        onChange={(e) => updateCustomField(index, 'isRequired', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="text-sm font-medium text-gray-700">
                        Required
                      </label>
                    </div>
                  </div>

                  {field.fieldType === 'select' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {field.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              placeholder="Option text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(index, optionIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(index)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/event-registrations"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Creating..." : "Create Registration"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
