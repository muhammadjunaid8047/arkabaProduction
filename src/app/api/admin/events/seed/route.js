import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event";

export async function POST(request) {
  try {
    await connect();
    
    // Clear existing events
    await Event.deleteMany({});
    
    const sampleEvents = [
      {
        title: "Annual ABA Conference 2024",
        description: "Join us for our biggest event of the year featuring keynote speakers, workshops, and networking opportunities.",
        backgroundImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        date: new Date("2024-06-15"),
        location: "Little Rock Convention Center",
        isBannerEvent: true,
        isActive: true
      },
      {
        title: "CEU Workshop: Advanced Behavior Analysis",
        description: "Earn 3 CEUs while learning advanced techniques in behavior analysis from industry experts.",
        backgroundImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        date: new Date("2024-05-20"),
        location: "Fayetteville, AR",
        isBannerEvent: true,
        isActive: true
      },
      {
        title: "Student Networking Event",
        description: "Connect with fellow students and professionals in the field of behavior analysis.",
        backgroundImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        date: new Date("2024-07-10"),
        location: "University of Arkansas",
        isBannerEvent: false,
        isActive: true
      },
      {
        title: "Professional Development Seminar",
        description: "Enhance your skills with our comprehensive professional development seminar.",
        backgroundImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        date: new Date("2024-08-05"),
        location: "Springdale, AR",
        isBannerEvent: false,
        isActive: true
      }
    ];
    
    const createdEvents = await Event.insertMany(sampleEvents);
    
    return NextResponse.json({ 
      message: "Sample events created successfully", 
      count: createdEvents.length 
    });
  } catch (error) {
    console.error("Error seeding events:", error);
    return NextResponse.json({ error: "Failed to seed events" }, { status: 500 });
  }
} 