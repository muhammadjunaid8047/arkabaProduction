"use client";

import { useState } from "react";
import SuccessModal from "@/components/SuccessModal";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      message: form.message.value,
      isArkansasSupervisor: form.isArkansasSupervisor.checked,
    };

    const res = await fetch("/api/contact/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    
    if (res.ok) {
      setSuccessMessage(result.message);
      setIsSuccessModalOpen(true);
      form.reset();
    } else {
      alert(result.message); // Keep alert for errors
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* HERO SECTION */}
      <div className="bg-red-600 text-white flex items-center justify-center px-6 py-16 sm:py-20">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">Contact Us</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto">
            We'd love to hear from you! Fill out the form below and we'll respond ASAP.
          </p>
        </div>
      </div>

      {/* HEADER with breadcrumbs */}
      <div className="max-w-4xl mx-auto -mt-12 relative z-10 bg-white shadow-xl rounded-3xl p-8 sm:p-10">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📬 Contact Form</h2>
          <p className="text-gray-600 mt-2">
            Have questions, comments, or feedback? Reach out to us using the form below.
          </p>
        </div>

        <nav className="mt-4 text-sm text-gray-500">
          <ol className="flex space-x-2">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li>/</li>
            <li className="text-gray-700 font-medium">Contact</li>
          </ol>
        </nav>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                name="firstName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                name="lastName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              rows={5}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                name="isArkansasSupervisor"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="text-gray-700">
                Are you providing supervision in Arkansas?
              </label>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Message Sent Successfully!"
        message={successMessage || "Thank you for contacting us. We'll get back to you as soon as possible."}
      />
    </div>
  );
}