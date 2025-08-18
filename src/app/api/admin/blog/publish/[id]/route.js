// this is blog functionality
import { connect } from "@/lib/mongodb/mongoose";
import Blog from "@/lib/models/blog";

export async function PATCH(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const body = await req.json();
    const { published } = body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { published, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedBlog) {
      return new Response(JSON.stringify({ error: "Blog post not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ 
        message: `Blog post ${published ? 'published' : 'unpublished'}`, 
        blog: updatedBlog 
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to update blog post status" }), {
      status: 500,
    });
  }
} 