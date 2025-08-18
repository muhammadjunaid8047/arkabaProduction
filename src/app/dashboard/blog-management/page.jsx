"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileText,
  Check,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

export default function BlogManagementPage() {
  const [tab, setTab] = useState("published");
  const [blogs, setBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    image: "",
    tags: "",
    published: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlogs = async () => {
    const res = await fetch("/api/admin/blog/blogs");
    const data = await res.json();
    setBlogs(data);
    setPublishedBlogs(data.filter((blog) => blog.published));
    setDraftBlogs(data.filter((blog) => !blog.published));
  };

  const publishBlog = async (id, published) => {
    await fetch(`/api/admin/blog/publish/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    fetchBlogs();
  };

  const deleteBlog = async (id) => {
    await fetch(`/api/admin/blog/delete/${id}`, { method: "DELETE" });
    fetchBlogs();
  };

  const createBlog = async () => {
    setIsSubmitting(true);
    try {
      const tagsArray = newBlog.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await fetch("/api/admin/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBlog,
          tags: tagsArray,
        }),
      });
      setNewBlog({
        title: "",
        content: "",
        excerpt: "",
        author: "",
        image: "",
        tags: "",
        published: false,
      });
      setTab("published");
      fetchBlogs();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBlog = async () => {
    setIsSubmitting(true);
    try {
      const tagsArray = editingBlog.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await fetch(`/api/admin/blog/update/${editingBlog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingBlog,
          tags: tagsArray,
        }),
      });
      setEditingBlog(null);
      fetchBlogs();
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (blog) => {
    setEditingBlog({
      ...blog,
      tags: blog.tags.join(", "),
    });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Blog Management
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-100 max-w-3xl mx-auto">
            Manage and publish blog posts for the ArkABA community
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm">
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
            <li className="text-gray-500">Blog Management</li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border border-gray-200">
          <nav className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <button
              onClick={() => setTab("published")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "published"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              Published
              {publishedBlogs.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {publishedBlogs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("drafts")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "drafts"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Drafts
              {draftBlogs.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {draftBlogs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                tab === "create"
                  ? "text-red-700 border-b-2 sm:border-b-0 sm:border-t-2 border-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Create New
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* Published Blogs */}
          {tab === "published" && (
            <div className="divide-y divide-gray-200">
              {publishedBlogs.length === 0 ? (
                <div className="p-4 sm:p-8 text-center text-gray-500">
                  <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">
                    No published blogs
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Get started by creating and publishing new blog posts.
                  </p>
                </div>
              ) : (
                publishedBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {blog.title}
                          </h2>
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {blog.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          {blog.tags.length > 0 && (
                            <span className="flex items-center">
                              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {blog.tags.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-wrap gap-2">
                        <button
                          onClick={() => publishBlog(blog._id, false)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Unpublish
                        </button>
                        <button
                          onClick={() => startEdit(blog)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBlog(blog._id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Draft Blogs */}
          {tab === "drafts" && (
            <div className="divide-y divide-gray-200">
              {draftBlogs.length === 0 ? (
                <div className="p-4 sm:p-8 text-center text-gray-500">
                  <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No draft blogs</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Create new blog posts to see them here as drafts.
                  </p>
                </div>
              ) : (
                draftBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {blog.title}
                          </h2>
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {blog.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          {blog.tags.length > 0 && (
                            <span className="flex items-center">
                              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {blog.tags.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-wrap gap-2">
                        <button
                          onClick={() => publishBlog(blog._id, true)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Publish
                        </button>
                        <button
                          onClick={() => startEdit(blog)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBlog(blog._id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create/Edit Blog Form */}
          {(tab === "create" || editingBlog) && (
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                {editingBlog ? (
                  <>
                    <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    Edit Blog Post
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    Create New Blog Post
                  </>
                )}
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {/* Blog Title Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="title"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Blog Title *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="title"
                      placeholder="Enter blog title"
                      value={editingBlog ? editingBlog.title : newBlog.title}
                      onChange={(e) =>
                        editingBlog
                          ? setEditingBlog({
                              ...editingBlog,
                              title: e.target.value,
                            })
                          : setNewBlog({ ...newBlog, title: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Author Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="author"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Author *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="author"
                      placeholder="Author name"
                      value={editingBlog ? editingBlog.author : newBlog.author}
                      onChange={(e) =>
                        editingBlog
                          ? setEditingBlog({
                              ...editingBlog,
                              author: e.target.value,
                            })
                          : setNewBlog({ ...newBlog, author: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Image URL Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="image"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Image URL *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={editingBlog ? editingBlog.image : newBlog.image}
                      onChange={(e) =>
                        editingBlog
                          ? setEditingBlog({
                              ...editingBlog,
                              image: e.target.value,
                            })
                          : setNewBlog({ ...newBlog, image: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Tags Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="tags"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Tags
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      value={editingBlog ? editingBlog.tags : newBlog.tags}
                      onChange={(e) =>
                        editingBlog
                          ? setEditingBlog({
                              ...editingBlog,
                              tags: e.target.value,
                            })
                          : setNewBlog({ ...newBlog, tags: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Excerpt Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="excerpt"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Excerpt *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-2 sm:pt-3 flex items-start pointer-events-none">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="excerpt"
                      rows={3}
                      placeholder="Brief summary of the blog post..."
                      value={
                        editingBlog ? editingBlog.excerpt : newBlog.excerpt
                      }
                      onChange={(e) =>
                        editingBlog
                          ? setEditingBlog({
                              ...editingBlog,
                              excerpt: e.target.value,
                            })
                          : setNewBlog({ ...newBlog, excerpt: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Content Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="content"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Content *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-2 sm:pt-3 flex items-start pointer-events-none">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="content"
                      rows={8}
                      placeholder="Write your blog post content here..."
                      value={
                        editingBlog ? editingBlog.content : newBlog.content
                      }
                      onChange={(e) =>
                        editingBlog
                          ? setEditingBlog({
                              ...editingBlog,
                              content: e.target.value,
                            })
                          : setNewBlog({ ...newBlog, content: e.target.value })
                      }
                      className="block w-full pl-9 sm:pl-10 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Published Checkbox */}
                <div className="flex items-center">
                  <input
                    id="published"
                    type="checkbox"
                    checked={
                      editingBlog ? editingBlog.published : newBlog.published
                    }
                    onChange={(e) =>
                      editingBlog
                        ? setEditingBlog({
                            ...editingBlog,
                            published: e.target.checked,
                          })
                        : setNewBlog({
                            ...newBlog,
                            published: e.target.checked,
                          })
                    }
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="published"
                    className="ml-2 block text-xs sm:text-sm text-gray-900"
                  >
                    Publish immediately
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-2 sm:pt-4">
                  {editingBlog && (
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={editingBlog ? updateBlog : createBlog}
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
                        {editingBlog ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {editingBlog ? (
                          <>
                            <Edit3 className="-ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                            Update Blog
                          </>
                        ) : (
                          <>
                            <PlusCircle className="-ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                            Create Blog
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
