// import { connect } from "@/lib/mongodb/mongoose"; // Your provided DB connection file
// import Job from "@/lib/models/job";

// export async function POST(req) {
//   try {
//     await connect();
//     const body = await req.json();

//     const { title, description, company, location } = body;

//     if (!title || !description || !company || !location) {
//       return new Response(
//         JSON.stringify({ error: "All fields are required" }),
//         {
//           status: 400,
//         }
//       );
//     }

//     const newJob = new Job({
//       title,
//       description,
//       company,
//       location,
//       approved: true, // not approved yet
//     });

//     await newJob.save();

//     return new Response(
//       JSON.stringify({ message: "Job created", job: newJob }),
//       {
//         status: 201,
//       }
//     );
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "Failed to create job" }), {
//       status: 500,
//     });
//   }
// }
import { connect } from "@/lib/mongodb/mongoose";
import Job from "@/lib/models/job";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();

    const {
      title,
      description,
      company,
      location,
      salary,
      jobType,
      applicationDeadline,
      contactEmail,
    } = body;

    if (!title || !description || !company || !location) {
      return new Response(
        JSON.stringify({
          error: "Title, description, company, and location are required",
        }),
        { status: 400 }
      );
    }

    const newJob = new Job({
      title,
      description,
      company,
      location,
      salary,
      jobType,
      applicationDeadline,
      contactEmail,
      approved: true,
    });

    await newJob.save();

    return new Response(
      JSON.stringify({ message: "Job created", job: newJob }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to create job" }), {
      status: 500,
    });
  }
}
