// this is blog functionality
import { connect } from "@/lib/mongodb/mongoose";
import Blog from "@/lib/models/blog";

export async function GET(req, { params }) {
  try {
    await connect();
    const { id } = params;
    
    const blog = await Blog.findOne({ _id: id, published: true });
    
    if (!blog) {
      return new Response(JSON.stringify({ error: "Blog post not found" }), {
        status: 404,
      });
    }
    
    return new Response(JSON.stringify(blog), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch blog post" }), {
      status: 500,
    });
  }
} 