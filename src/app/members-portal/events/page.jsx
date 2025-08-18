"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events?upcoming=true");
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || 
                           (event.location && event.location.toLowerCase().includes(filterLocation.toLowerCase()));
    return matchesSearch && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-red-600 flex items-center justify-center gap-2">
            <Calendar className="h-8 w-8" />
            Upcoming Events
          </CardTitle>
          <p className="text-muted-foreground">
            Join us for professional development, networking, and continuing education opportunities
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-200"
                >
                  {/* Event Image */}
                  <div className="h-48 relative">
                    <img
                      src={event.backgroundImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {event.isBannerEvent ? "Featured" : "Event"}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(event.date)}
                      </div>

                      {event.location && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/events/${event._id}`}
                      className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterLocation ? "No events found" : "No upcoming events"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterLocation 
                  ? "Try adjusting your search criteria" 
                  : "Check back soon for new events"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-red-800 text-white">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Stay Updated with Our Events
          </h2>
          
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join our community to receive notifications about upcoming events, workshops, and professional development opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              className="bg-white text-red-700 hover:bg-gray-100"
            >
              Become a Member
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-red-700"
            >
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
