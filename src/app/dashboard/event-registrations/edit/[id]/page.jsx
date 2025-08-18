"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Save, 
  Trash2, 
  AlertCircle,
  ArrowLeft,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function EditEventRegistration() {
  const router = useRouter();
  const params = useParams();
  const registrationId = params.id;
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    eventId: "",
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
    if (registrationId) {
      fetchRegistration();
    }
  }, [registrationId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events/list');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.events || []);
      } else {
        setError(`Failed to fetch events: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError(`Failed to fetch events: ${error.message}`);
    }
  };

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/event-registrations/${registrationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const registration = result.eventRegistration;
        setFormData({
          eventId: registration.eventId?._id || "",
          title: registration.title || "",
          description: registration.description || "",
          pricing: registration.pricing || {
            student: 10,
            full: 50,
            affiliate: 30,
            nonMember: 100
          },
          registrationDeadline: registration.registrationDeadline ? 
            new Date(registration.registrationDeadline).toISOString().split('T')[0] : "",
          maxAttendees: registration.maxAttendees || "",
          customFields: registration.customFields || [],
          confirmationEmailTemplate: registration.confirmationEmailTemplate || ""
        });
      } else {
        setError(`Failed to fetch registration: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError(`Failed to fetch registration: ${error.message}`);
    } finally {
      setLoading(false);
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

  const handleCustomFieldChange = (index, field, value) => {
    const newCustomFields = [...formData.customFields];
    newCustomFields[index] = { ...newCustomFields[index], [field]: value };
    setFormData(prev => ({ ...prev, customFields: newCustomFields }));
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, {
        fieldName: "",
        fieldType: "text",
        isRequired: false,
        options: []
      }]
    }));
  };

  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/event-registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Registration updated successfully!");
        setTimeout(() => {
          router.push('/dashboard/event-registrations');
        }, 1500);
      } else {
        setError(result.error || 'Failed to update registration');
      }
    } catch (error) {
      setError(`Failed to update registration: ${error.message}`);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/event-registrations"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Event Registration</h1>
                <p className="text-gray-600">Modify registration settings and pricing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700">{success}</span>
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border p-6 space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event (Optional)
              </label>
              <select
                value={formData.eventId}
                onChange={(e) => handleInputChange('eventId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Standalone Registration</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Annual Conference Registration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe what this registration is for..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student & BT Member
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.student}
                    onChange={(e) => handleInputChange('pricing.student', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Member
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.full}
                    onChange={(e) => handleInputChange('pricing.full', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affiliate Member
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.affiliate}
                    onChange={(e) => handleInputChange('pricing.affiliate', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Non-Member
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.nonMember}
                    onChange={(e) => handleInputChange('pricing.nonMember', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Registration Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formData.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Custom Fields</h2>
              <button
                type="button"
                onClick={addCustomField}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Field
              </button>
            </div>
            
            {formData.customFields.map((field, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Custom Field {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                    <input
                      type="text"
                      value={field.fieldName}
                      onChange={(e) => handleCustomFieldChange(index, 'fieldName', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., Company Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Field Type</label>
                    <select
                      value={field.fieldType}
                      onChange={(e) => handleCustomFieldChange(index, 'fieldType', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) => handleCustomFieldChange(index, 'isRequired', e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs text-gray-700">Required</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Template */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Email Template</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Email Template
              </label>
              <textarea
                value={formData.confirmationEmailTemplate}
                onChange={(e) => handleInputChange('confirmationEmailTemplate', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Custom email template for confirmation emails. Leave empty for default template."
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{firstName}'}, {'{lastName}'}, {'{email}'}, {'{eventTitle}'}, {'{registrationDate}'}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href="/dashboard/event-registrations"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
