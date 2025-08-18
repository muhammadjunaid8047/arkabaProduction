// this is blog functionality
import { connect } from "@/lib/mongodb/mongoose";
import Blog from "@/lib/models/blog";

export async function POST(req) {
  try {
    await connect();
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

    const newBlog = new Blog({
      title,
      content,
      excerpt,
      author,
      image,
      tags: tags || [],
      published: published || false,
    });

    await newBlog.save();

    return new Response(
      JSON.stringify({ message: "Blog post created", blog: newBlog }),
      {
        status: 201,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to create blog post" }), {
      status: 500,
    });
  }
} 