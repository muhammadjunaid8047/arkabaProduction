// this is blog functionality
import { connect } from "@/lib/mongodb/mongoose";
import Blog from "@/lib/models/blog";

export async function PUT(req, { params }) {
  try {
    await connect();
    const { id } = params;
    const body = await req.json();

    const { title, content, excerpt, author, image, tags, published } = body;

    if (!title || !content || !excerpt || !author || !image) {
      return new Response(
        JSON.stringify({ error: "Title, content, excerpt, author, and image are required" }),
        {
          status: 400,
        }
      );
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        content,
        excerpt,
        author,
        image,
        tags: tags || [],
        published: published || false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedBlog) {
      return new Response(JSON.stringify({ error: "Blog post not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Blog post updated", blog: updatedBlog }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to update blog post" }), {
      status: 500,
    });
  }
} 