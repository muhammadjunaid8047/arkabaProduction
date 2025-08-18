import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Event from "@/lib/models/event";

export async function GET(request) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const bannerOnly = searchParams.get('bannerOnly') === 'true';
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = searchParams.get('limit');
    
    let query = { isActive: true };
    
    if (bannerOnly) {
      query.isBannerEvent = true;
    }
    
    if (upcoming) {
      query.date = { $gte: new Date() };
    }
    
    let eventsQuery = Event.find(query).sort({ date: 1 });
    
    if (limit) {
      eventsQuery = eventsQuery.limit(parseInt(limit));
    }
    
    const events = await eventsQuery;
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
} 