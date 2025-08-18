// this is blog functionality
import { connect } from "@/lib/mongodb/mongoose";
import Blog from "@/lib/models/blog";

export async function DELETE(req, { params }) {
  try {
    await connect();
    const { id } = params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return new Response(JSON.stringify({ error: "Blog post not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Blog post deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to delete blog post" }), {
      status: 500,
    });
  }
} 