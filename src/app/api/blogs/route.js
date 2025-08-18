// this is blog functionality
import { connect } from "@/lib/mongodb/mongoose";
import Blog from "@/lib/models/blog";

export async function GET(req) {
  try {
    await connect();
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    
    return new Response(JSON.stringify(blogs), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch blogs" }), {
      status: 500,
    });
  }
} 