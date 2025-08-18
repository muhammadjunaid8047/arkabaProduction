"use client";



import { useState, useEffect } from "react";

import {

  CheckCircle2,

  XCircle,

  PlusCircle,

  ClipboardList,

  FileText,

  Video,

  Calendar,

  Upload,

  Trash2,

  BookOpen,

} from "lucide-react";



export default function CourseAdminDashboard() {

  const [tab, setTab] = useState("create");

  const [formData, setFormData] = useState({

    title: "",

    description: "",

    contentUrl: "",

    contentType: "video",

    expirationDate: "",

    quizFile: null,

    totalCEUs: "1.0",

    ethicsCEUs: "0.0",

    supervisionCEUs: "0.0",

    instructorName: "Course Instructor",

    coordinatorName: "ArkABA Coordinator",

    bacbNumber: "AB1000001",
    providerNumber: "TBD",
    isPublic: false,

  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [responses, setResponses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);

  const [coursesLoading, setCoursesLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(null);



  const handleChange = (e) => {

    const { name, value, files } = e.target;

    setFormData({

      ...formData,

      [name]: files ? files[0] : value,

    });

  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const requiredFields = {
        title: formData.title,
        description: formData.description,
        contentUrl: formData.contentUrl,
        contentType: formData.contentType,
        quizFile: formData.quizFile,
        totalCEUs: formData.totalCEUs,
        ethicsCEUs: formData.ethicsCEUs,
        supervisionCEUs: formData.supervisionCEUs,
        instructorName: formData.instructorName,
        coordinatorName: formData.coordinatorName,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        setMessage(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      // First, upload the CSV file to get a file URL
      let csvFileUrl = null;
      if (formData.quizFile) {
        try {
          console.log('Starting CSV upload for file:', formData.quizFile.name);
          
          const uploadForm = new FormData();
          uploadForm.append('file', formData.quizFile);
          
          console.log('FormData created, sending to /api/upload...');
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadForm,
          });
          
          console.log('Upload response status:', uploadRes.status);
          console.log('Upload response headers:', uploadRes.headers);
          
          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error('Upload failed with status:', uploadRes.status, 'Response:', errorText);
            throw new Error(`Upload failed with status ${uploadRes.status}: ${errorText}`);
          }
          
          const uploadData = await uploadRes.json();
          console.log('Upload response data:', uploadData);
          
          if (uploadData.success) {
            csvFileUrl = uploadData.fileUrl;
            console.log('CSV file uploaded successfully:', csvFileUrl);
          } else {
            throw new Error(uploadData.error || 'Upload failed');
          }
        } catch (uploadError) {
          console.error('CSV upload error:', uploadError);
          setMessage(`❌ Failed to upload CSV file: ${uploadError.message}`);
          return;
        }
      }

      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("contentUrl", formData.contentUrl);
      form.append("contentType", formData.contentType);
      form.append("expirationDate", formData.expirationDate);
      form.append("quizFile", formData.quizFile);
      form.append("csvFileUrl", csvFileUrl); // Add the uploaded file URL
      form.append("totalCEUs", formData.totalCEUs);
      form.append("ethicsCEUs", formData.ethicsCEUs);
      form.append("supervisionCEUs", formData.supervisionCEUs);
      form.append("instructorName", formData.instructorName);
      form.append("coordinatorName", formData.coordinatorName);
      form.append("bacbNumber", formData.bacbNumber);
      form.append("providerNumber", formData.providerNumber);
      form.append("isPublic", formData.isPublic.toString());

      const res = await fetch("/api/course-platform/courses", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Course created successfully!");
        setFormData({
          title: "",
          description: "",
          contentUrl: "",
          contentType: "video",
          expirationDate: "",
          quizFile: null,
          totalCEUs: "1.0",
          ethicsCEUs: "0.0",
          supervisionCEUs: "0.0",
          instructorName: "Course Instructor",
          coordinatorName: "ArkABA Coordinator",
          bacbNumber: "AB1000001",
          providerNumber: "TBD",
        });
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to create course"}`);
      }
    } catch (err) {
      console.error("Error submitting course:", err);
      setMessage("❌ An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };



  const fetchResponses = async () => {

    setLoading(true);

    setError("");

    try {

      const res = await fetch("/api/course-platform/responses");

      const data = await res.json();



      if (!res.ok) {

        throw new Error(data.error || "Failed to fetch responses");

      }



      // Ensure data is an array; if not, set to empty array

      const responseData = Array.isArray(data) ? data : [];

      setResponses(responseData);

    } catch (err) {

      console.error("Error fetching responses:", err);

      setError("Failed to load quiz responses. Please try again.");

      setResponses([]);

    } finally {

      setLoading(false);

    }

  };



  const fetchCourses = async () => {

    setCoursesLoading(true);

    setError("");

    try {

      const res = await fetch("/api/course-platform/courses");

      const data = await res.json();



      if (!res.ok) {

        throw new Error(data.error || "Failed to fetch courses");

      }



      // Ensure data is an array; if not, set to empty array

      const coursesData = Array.isArray(data) ? data : [];

      setCourses(coursesData);

    } catch (err) {

      console.error("Error fetching courses:", err);

      setError("Failed to load courses. Please try again.");

      setCourses([]);

    } finally {

      setCoursesLoading(false);

    }

  };



  const deleteCourse = async (courseId) => {

    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {

      return;

    }



    setDeleteLoading(courseId);

    try {

      const res = await fetch(`/api/course-platform/courses/${courseId}`, {

        method: "DELETE",

      });



      if (!res.ok) {

        const data = await res.json();

        throw new Error(data.error || "Failed to delete course");

      }



      // Remove the course from the local state

      setCourses(courses.filter(course => course._id !== courseId));

      setMessage("✅ Course deleted successfully!");

    } catch (err) {

      console.error("Error deleting course:", err);

      setError("Failed to delete course. Please try again.");

    } finally {

      setDeleteLoading(null);

    }

  };



  const togglePublic = async (courseId, currentPublicStatus) => {

    try {

      const res = await fetch(`/api/course-platform/courses/${courseId}/toggle-public`, {

        method: "PATCH",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({ isPublic: !currentPublicStatus }),

      });

      if (res.ok) {

        setMessage(`✅ Course ${!currentPublicStatus ? 'made public' : 'made private'} successfully!`);

        fetchCourses();

      } else {

        setError("Failed to update course public status");

      }

    } catch (error) {

      setError("Error updating course public status");

    }

  };



  useEffect(() => {

    if (tab === "responses") {

      fetchResponses();

    }

    if (tab === "courses") {

      fetchCourses();

    }

  }, [tab]);







  return (

    <div className="min-h-screen bg-gray-50">

      <div className="bg-red-600 text-white">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">

            Course Administration Dashboard

          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-100 max-w-3xl mx-auto">

            Manage courses and review quiz responses

          </p>

        </div>

      </div>



      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">

        <nav className="flex" aria-label="Breadcrumb">

          <ol className="flex items-center space-x-2 text-sm">

            <li>

              <a href="/" className="text-red-600 hover:text-red-800">

                Home

              </a>

            </li>

            <li>

              <svg

                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"

                xmlns="http://www.w3.org/2000/svg"

                viewBox="0 0 20 20"

                fill="currentColor"

                aria-hidden="true"

              >

                <path

                  fillRule="evenodd"

                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"

                  clipRule="evenodd"

                />

              </svg>

            </li>

            <li className="text-gray-500">Course Admin Dashboard</li>

          </ol>

        </nav>

      </div>



      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border border-gray-200">

          <nav className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">

            <button

              onClick={() => setTab("create")}

              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${

                tab === "create"

                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"

                  : "text-gray-500 hover:text-gray-700"

              }`}

            >

              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />

              Create Course

            </button>

            <button

              onClick={() => setTab("courses")}

              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${

                tab === "courses"

                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"

                  : "text-gray-500 hover:text-gray-700"

              }`}

            >

              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />

              All Courses

            </button>

            <button

              onClick={() => setTab("responses")}

              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${

                tab === "responses"

                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"

                  : "text-gray-500 hover:text-gray-700"

              }`}

            >

              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />

              Quiz Responses

            </button>

          </nav>

        </div>



        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">

          {tab === "create" && (

            <div className="p-4 sm:p-6 md:p-8">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">

                <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />

                Create New Course

              </h2>

              {message && (

                <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-red-500 flex items-center gap-2">

                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />

                  {message}

                </p>

              )}

              <div onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                <div className="space-y-1">

                  <label

                    htmlFor="title"

                    className="block text-xs sm:text-sm font-medium text-gray-700"

                  >

                    Course Title *

                  </label>

                  <div className="relative rounded-md shadow-sm">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                    </div>

                    <input

                      type="text"

                      id="title"

                      name="title"

                      value={formData.title}

                      onChange={handleChange}

                      placeholder="Course Title"

                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      required

                    />

                  </div>

                </div>



                <div className="space-y-1">

                  <label

                    htmlFor="description"

                    className="block text-xs sm:text-sm font-medium text-gray-700"

                  >

                    Description *

                  </label>

                  <div className="relative rounded-md shadow-sm">

                    <div className="absolute inset-y-0 left-0 pl-3 pt-2 sm:pt-3 flex items-start pointer-events-none">

                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                    </div>

                    <textarea

                      id="description"

                      name="description"

                      value={formData.description}

                      onChange={handleChange}

                      rows={4}

                      placeholder="Course description and objectives..."

                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      required

                    />

                  </div>

                </div>



                <div className="space-y-1">

                  <label

                    htmlFor="contentType"

                    className="block text-xs sm:text-sm font-medium text-gray-700"

                  >

                    Content Type *

                  </label>

                  <div className="relative rounded-md shadow-sm">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                      <Video className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                    </div>

                    <select

                      id="contentType"

                      name="contentType"

                      value={formData.contentType}

                      onChange={handleChange}

                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm appearance-none"

                      required

                    >

                      <option value="video">Video</option>

                      <option value="podcast">Podcast</option>

                      <option value="course">Course</option>

                    </select>

                  </div>

                </div>



                <div className="space-y-1">

                  <label

                    htmlFor="contentUrl"

                    className="block text-xs sm:text-sm font-medium text-gray-700"

                  >

                    Content URL *

                  </label>

                  <div className="relative rounded-md shadow-sm">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                    </div>

                    <input

                      type="url"

                      id="contentUrl"

                      name="contentUrl"

                      value={formData.contentUrl}

                      onChange={handleChange}

                      placeholder="https://example.com/course-content"

                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      required

                    />

                  </div>

                </div>



                <div className="space-y-1">

                  <label

                    htmlFor="expirationDate"

                    className="block text-xs sm:text-sm font-medium text-gray-700"

                  >

                    Expiration Date (Optional)

                  </label>

                  <div className="relative rounded-md shadow-sm">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                    </div>

                    <input

                      type="date"

                      id="expirationDate"

                      name="expirationDate"

                      value={formData.expirationDate}

                      onChange={handleChange}

                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                    />

                  </div>

                </div>



                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                  <div className="space-y-1">

                    <label

                      htmlFor="totalCEUs"

                      className="block text-xs sm:text-sm font-medium text-gray-700"

                    >

                      Total CEUs *

                    </label>

                    <div className="relative rounded-md shadow-sm">

                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                      </div>

                      <input

                        type="number"

                        id="totalCEUs"

                        name="totalCEUs"

                        value={formData.totalCEUs}

                        onChange={handleChange}

                        step="0.1"

                        min="0"

                        placeholder="1.0"

                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                        required

                      />

                    </div>

                  </div>



                  <div className="space-y-1">

                    <label

                      htmlFor="ethicsCEUs"

                      className="block text-xs sm:text-sm font-medium text-gray-700"

                    >

                      Ethics CEUs

                    </label>

                    <div className="relative rounded-md shadow-sm">

                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                      </div>

                      <input

                        type="number"

                        id="ethicsCEUs"

                        name="ethicsCEUs"

                        value={formData.ethicsCEUs}

                        onChange={handleChange}

                        step="0.1"

                        min="0"

                        placeholder="0.0"

                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      />

                    </div>

                  </div>



                  <div className="space-y-1">

                    <label

                      htmlFor="supervisionCEUs"

                      className="block text-xs sm:text-sm font-medium text-gray-700"

                    >

                      Supervision CEUs

                    </label>

                    <div className="relative rounded-md shadow-sm">

                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                      </div>

                      <input

                        type="number"

                        id="supervisionCEUs"

                        name="supervisionCEUs"

                        value={formData.supervisionCEUs}

                        onChange={handleChange}

                        step="0.1"

                        min="0"

                        placeholder="0.0"

                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      />

                    </div>

                  </div>

                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                  <div className="space-y-1">

                    <label

                      htmlFor="instructorName"

                      className="block text-xs sm:text-sm font-medium text-gray-700"

                    >

                      Instructor Name

                    </label>

                    <div className="relative rounded-md shadow-sm">

                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                      </div>

                      <input

                        type="text"

                        id="instructorName"

                        name="instructorName"

                        value={formData.instructorName}

                        onChange={handleChange}

                        placeholder="Course Instructor"

                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      />

                    </div>

                  </div>



                  <div className="space-y-1">

                    <label

                      htmlFor="coordinatorName"

                      className="block text-xs sm:text-sm font-medium text-gray-700"

                    >

                      Coordinator Name

                    </label>

                    <div className="relative rounded-md shadow-sm">

                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                      </div>

                      <input

                        type="text"

                        id="coordinatorName"

                        name="coordinatorName"

                        value={formData.coordinatorName}

                        onChange={handleChange}

                        placeholder="ArkABA Coordinator"

                        className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      />

                    </div>

                  </div>

                </div>


                <div className="space-y-1">
                  <label
                    htmlFor="bacbNumber"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    BACB Certification Number (Optional)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="bacbNumber"
                      name="bacbNumber"
                      value={formData.bacbNumber}
                      onChange={handleChange}
                      placeholder="AB1000001"
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="providerNumber"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    ACE Provider Number (Optional)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="providerNumber"
                      name="providerNumber"
                      value={formData.providerNumber}
                      onChange={handleChange}
                      placeholder="TBD"
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>


                <div className="space-y-1">

                  <label className="block text-xs sm:text-sm font-medium text-gray-700">

                    Public Access

                  </label>

                  <div className="flex items-center">

                    <input

                      type="checkbox"

                      id="isPublic"

                      name="isPublic"

                      checked={formData.isPublic}

                      onChange={(e) => setFormData({

                        ...formData,

                        isPublic: e.target.checked

                      })}

                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"

                    />

                    <label htmlFor="isPublic" className="ml-2 text-xs sm:text-sm text-gray-700">

                      Make this course available to the public (non-members can watch)

                    </label>

                  </div>

                </div>



                <div className="space-y-1">

                  <label

                    htmlFor="quizFile"

                    className="block text-xs sm:text-sm font-medium text-gray-700"

                  >

                    Quiz CSV File *

                  </label>

                  <div className="relative rounded-md shadow-sm">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                      <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />

                    </div>

                    <input

                      type="file"

                      id="quizFile"

                      name="quizFile"

                      accept=".csv"

                      onChange={handleChange}

                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"

                      required

                    />

                  </div>
                  
                  {formData.quizFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs sm:text-sm text-green-700">
                        📁 File selected: {formData.quizFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Size: {(formData.quizFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>



                <div className="flex justify-end pt-2 sm:pt-4">

                  <button

                    type="button"

                    onClick={handleSubmit}

                    disabled={isSubmitting}

                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"

                  >

                    {isSubmitting ? (

                      <>

                        <svg

                          className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"

                          xmlns="http://www.w3.org/2000/svg"

                          fill="none"

                          viewBox="0 0 24 24"

                        >

                          <circle

                            className="opacity-25"

                            cx="12"

                            cy="12"

                            r="10"

                            stroke="currentColor"

                            strokeWidth="4"

                          ></circle>

                          <path

                            className="opacity-75"

                            fill="currentColor"

                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"

                          ></path>

                        </svg>

                        Creating Course...

                      </>

                    ) : (

                      <>

                        <PlusCircle className="-ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />

                        Create Course

                      </>

                    )}

                  </button>

                </div>

              </div>

            </div>

          )}



          {tab === "responses" && (

            <div className="p-4 sm:p-6 md:p-8">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">

                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />

                Quiz Responses

              </h2>

              {loading ? (

                <div className="p-4 sm:p-8 text-center text-gray-500">

                  <svg

                    className="animate-spin mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"

                    xmlns="http://www.w3.org/2000/svg"

                    fill="none"

                    viewBox="0 0 24 24"

                  >

                    <circle

                      className="opacity-25"

                      cx="12"

                      cy="12"

                      r="10"

                      stroke="currentColor"

                      strokeWidth="4"

                    ></circle>

                    <path

                      className="opacity-75"

                      fill="currentColor"

                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"

                    ></path>

                  </svg>

                  <h3 className="mt-2 text-sm font-medium">

                    Loading responses...

                  </h3>

                </div>

              ) : error ? (

                <div className="p-4 sm:p-8 text-center text-gray-500">

                  <XCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />

                  <h3 className="mt-2 text-sm font-medium">Error</h3>

                  <p className="mt-1 text-xs sm:text-sm text-gray-500">

                    {error}

                  </p>

                </div>

              ) : responses.length === 0 ? (

                <div className="p-4 sm:p-8 text-center text-gray-500">

                  <XCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />

                  <h3 className="mt-2 text-sm font-medium">No responses yet</h3>

                  <p className="mt-1 text-xs sm:text-sm text-gray-500">

                    No quiz responses have been submitted yet.

                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full table-auto border divide-y divide-gray-200">

                    <thead>

                      <tr className="bg-gray-50">

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Student Name

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Course Title

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Score

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Percentage

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Status

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Date

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Certificate

                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      {Array.isArray(responses) &&

                        responses.map((res, idx) => (

                          <tr key={idx} className="hover:bg-gray-50">

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              <div className="font-medium">{res.studentName || "N/A"}</div>

                            </td>

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              <div>

                                <div className="font-medium">{res.courseTitle || "N/A"}</div>

                                {res.courseDescription && (

                                  <div className="text-gray-500 text-xs mt-1">

                                    {res.courseDescription.length > 50 

                                      ? `${res.courseDescription.substring(0, 50)}...` 

                                      : res.courseDescription}

                                  </div>

                                )}

                              </div>

                            </td>

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              <div className="font-medium">{res.score}/{res.total}</div>

                            </td>

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${

                                res.percentage >= 70 

                                  ? 'bg-green-100 text-green-800' 

                                  : res.percentage >= 50 

                                  ? 'bg-yellow-100 text-yellow-800' 

                                  : 'bg-red-100 text-red-800'

                              }`}>

                                {res.percentage}%

                              </span>

                            </td>

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${

                                res.passed 

                                  ? 'bg-green-100 text-green-800' 

                                  : 'bg-red-100 text-red-800'

                              }`}>

                                {res.passed ? 'Passed' : 'Failed'}

                              </span>

                            </td>

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              {new Date(res.createdAt).toLocaleDateString()}

                            </td>

                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                              {res.certificateUrl ? (

                                <a

                                  href={res.certificateUrl}

                                  target="_blank"

                                  rel="noopener noreferrer"

                                  className="text-blue-600 hover:text-blue-800 underline text-xs"

                                >

                                  Download

                                </a>

                              ) : (

                                <span className="text-gray-400 text-xs">N/A</span>

                              )}

                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}



          {tab === "courses" && (

            <div className="p-4 sm:p-6 md:p-8">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">

                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />

                All Courses

              </h2>

              {message && (

                <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-green-600 flex items-center gap-2">

                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />

                  {message}

                </p>

              )}

              {error && (

                <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-red-600 flex items-center gap-2">

                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />

                  {error}

                </p>

              )}

              {coursesLoading ? (

                <div className="p-4 sm:p-8 text-center text-gray-500">

                  <svg

                    className="animate-spin mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"

                    xmlns="http://www.w3.org/2000/svg"

                    fill="none"

                    viewBox="0 0 24 24"

                  >

                    <circle

                      className="opacity-25"

                      cx="12"

                      cy="12"

                      r="10"

                      stroke="currentColor"

                      strokeWidth="4"

                    ></circle>

                    <path

                      className="opacity-75"

                      fill="currentColor"

                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"

                    ></path>

                  </svg>

                  <h3 className="mt-2 text-sm font-medium">

                    Loading courses...

                  </h3>

                </div>

              ) : courses.length === 0 ? (

                <div className="p-4 sm:p-8 text-center text-gray-500">

                  <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />

                  <h3 className="mt-2 text-sm font-medium">No courses yet</h3>

                  <p className="mt-1 text-xs sm:text-sm text-gray-500">

                    No courses have been created yet.

                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full table-auto border divide-y divide-gray-200">

                    <thead>

                      <tr className="bg-gray-50">

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Course Title

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Content Type

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Created Date

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Expiration Date

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Public

                        </th>

                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Actions

                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      {courses.map((course) => (

                        <tr key={course._id} className="hover:bg-gray-50">

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                            <div>

                              <div className="font-medium">{course.title}</div>

                              <div className="text-gray-500 text-xs mt-1">

                                {course.description.length > 100

                                  ? `${course.description.substring(0, 100)}...`

                                  : course.description}

                              </div>

                            </div>

                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">

                              {course.contentType}

                            </span>

                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                            {new Date(course.createdAt).toLocaleDateString()}

                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                            {course.expirationDate

                              ? new Date(course.expirationDate).toLocaleDateString()

                              : "No expiration"}

                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                            <button

                              onClick={() => togglePublic(course._id, course.isPublic)}

                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${

                                course.isPublic

                                  ? "text-green-700 bg-green-100 hover:bg-green-200"

                                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"

                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}

                            >

                              {course.isPublic ? "Public" : "Private"}

                            </button>

                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                            <button

                              onClick={() => deleteCourse(course._id)}

                              disabled={deleteLoading === course._id}

                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"

                            >

                              {deleteLoading === course._id ? (

                                <>

                                  <svg

                                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-red-700"

                                    xmlns="http://www.w3.org/2000/svg"

                                    fill="none"

                                    viewBox="0 0 24 24"

                                  >

                                    <circle

                                      className="opacity-25"

                                      cx="12"

                                      cy="12"

                                      r="10"

                                      stroke="currentColor"

                                      strokeWidth="4"

                                    ></circle>

                                    <path

                                      className="opacity-75"

                                      fill="currentColor"

                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"

                                    ></path>

                                  </svg>

                                  Deleting...

                                </>

                              ) : (

                                <>

                                  <Trash2 className="-ml-1 mr-2 h-3 w-3" />

                                  Delete

                                </>

                              )}

                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

