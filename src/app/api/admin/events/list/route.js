import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event";

export async function GET(request) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const bannerOnly = searchParams.get('bannerOnly') === 'true';
    
    let query = { isActive: true };
    if (bannerOnly) {
      query.isBannerEvent = true;
    }
    
    const events = await Event.find(query).sort({ date: 1 });
    
    return NextResponse.json({ 
      success: true, 
      events 
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ 
      success: false,
      error: error.message || "Failed to fetch events" 
    }, { status: 500 });
  }
} 