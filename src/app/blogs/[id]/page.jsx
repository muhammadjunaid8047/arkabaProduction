// this is blog functionality
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogImage from "@/components/BlogImage";

async function getBlog(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://emergitechdev.in/'}/api/blogs/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function BlogPostPage({ params }) {
  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = await params;
  const blog = await getBlog(unwrappedParams.id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="mb-6">
            <Link
              href="/blogs"
              className="inline-flex items-center text-red-100 hover:text-white font-medium text-sm group"
            >
              <ArrowLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blogs
            </Link>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            {blog.title}
          </h1>
          
          <div className="flex items-center text-red-100 space-x-6">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {blog.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-red-600 hover:text-red-800">
                Home
              </a>
            </li>
            <li>
              <svg
                className="h-5 w-5 text-gray-400"
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
            <li>
              <a href="/blogs" className="text-red-600 hover:text-red-800">
                Blog
              </a>
            </li>
            <li>
              <svg
                className="h-5 w-5 text-gray-400"
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
            <li className="text-gray-500 truncate">{blog.title}</li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          <div className="w-full">
            <BlogImage
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover"
              fallbackSrc="https://via.placeholder.com/800x400?text=Blog+Image"
            />
          </div>

          {/* Article Content */}
          <div className="p-8">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Excerpt */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                {blog.excerpt}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: blog.content.replace(/\n/g, '<br />') 
                }}
              />
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  By {blog.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Published on {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Back to Blogs Button */}
        <div className="mt-8 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to All Blogs
          </Link>
        </div>
      </div>
    </div>
  );
} 