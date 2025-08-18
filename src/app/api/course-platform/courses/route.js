import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Course from "@/lib/models/course";
import csvToJSON from "@/lib/csvToJson";

export async function POST(req) {
  try {
    await connect();
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    let contentUrl = formData.get("contentUrl");
    const contentType = formData.get("contentType");
    const expirationDate = formData.get("expirationDate");
    const csvFile = formData.get("quizFile");
    const csvFileUrl = formData.get("csvFileUrl"); // Get the uploaded CSV file URL
    const totalCEUs = formData.get("totalCEUs") || "1.0";
    const ethicsCEUs = formData.get("ethicsCEUs") || "0.0";
    const supervisionCEUs = formData.get("supervisionCEUs") || "0.0";
    const instructorName = formData.get("instructorName") || "Course Instructor";
    const coordinatorName = formData.get("coordinatorName") || "ArkABA Coordinator";
    const bacbNumber = formData.get("bacbNumber") || "AB1000001";
    const providerNumber = formData.get("providerNumber") || "TBD";
    const isPublic = formData.get("isPublic") === "true";

    if (!title || !description || !contentUrl || !contentType || !csvFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert YouTube URLs to embed format regardless of content type
    if (contentUrl.includes("/watch?v=")) {
      const videoId = contentUrl.split("v=")[1].split("&")[0];
      contentUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (contentUrl.includes("youtu.be/")) {
      const videoId = contentUrl.split("youtu.be/")[1]?.split("?")[0];
      contentUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const csvText = await csvFile.text();
    console.log("Raw CSV text:", csvText); // Debugging

    let quiz;
    try {
      quiz = csvToJSON(csvText);
      console.log("Parsed quiz data:", quiz); // Debugging
    } catch (error) {
      console.error("CSV parsing failed:", error);
      return NextResponse.json(
        { error: `Invalid CSV format: ${error.message}` },
        { status: 400 }
      );
    }

    // Validate quiz data
    if (!Array.isArray(quiz) || quiz.length === 0) {
      return NextResponse.json(
        { error: "Quiz data is empty or invalid" },
        { status: 400 }
      );
    }

    for (let i = 0; i < quiz.length; i++) {
      const item = quiz[i];
      if (!item.question || !item.correctAnswer) {
        return NextResponse.json(
          {
            error: `Invalid quiz data at row ${
              i + 1
            }: 'question' and 'correctAnswer' are required`,
          },
          { status: 400 }
        );
      }
      if (!Array.isArray(item.options) || item.options.length < 2) {
        return NextResponse.json(
          {
            error: `Invalid quiz data at row ${
              i + 1
            }: At least two options are required`,
          },
          { status: 400 }
        );
      }
    }

    const newCourse = await Course.create({
      title,
      description,
      contentUrl,
      contentType,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      quiz, // Store the parsed quiz data
      csvFileUrl, // Store the uploaded CSV file URL
      totalCEUs,
      ethicsCEUs,
      supervisionCEUs,
      instructorName,
      coordinatorName,
      bacbNumber,
      providerNumber,
      isPublic,
    });

    console.log("Course created successfully:", {
      id: newCourse._id,
      title: newCourse.title,
      quizLength: newCourse.quiz.length,
      csvFileUrl: newCourse.csvFileUrl
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connect();
    const currentDate = new Date();
    const courses = await Course.find({
      $or: [
        { expirationDate: { $gte: currentDate } },
        { expirationDate: null },
      ],
    }).sort({ createdAt: -1 }); // Sort by newest first
    return NextResponse.json(courses || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
