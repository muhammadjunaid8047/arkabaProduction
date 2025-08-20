"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaUsers, 
  FaRegCalendarCheck, 
  FaGraduationCap,
  FaChalkboardTeacher,
  FaBookOpen,
  FaHandshake,
  FaAward,
  FaPlay,
  FaExternalLinkAlt,
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaSearch,
  FaCheck,
  FaFacebookSquare,
  FaInstagram
} from "react-icons/fa";

// Counter Component for animated numbers
function Counter({ from, to, suffix = "", duration = 2, delay = 0 }) {
  const [count, setCount] = useState(from);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        
        const currentCount = Math.floor(from + (to - from) * progress);
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, from, to, duration, delay]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Utility function to limit text to specified words
function truncateWords(text, limit) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > limit
    ? words.slice(0, limit).join(" ") + "..."
    : text;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);

  const controls = useAnimation();
  const sliderRef = useRef(null);



  useEffect(() => {
    setMounted(true);
    
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/events?bannerOnly=true&upcoming=true");
        const data = await res.json();
        const eventSlides = Array.isArray(data.events)
          ? data.events.map((event) => ({
              image: event.backgroundImage || "/images/event-2.jpg",
              title: event.title,
              subtitle: truncateWords(event.description, 15),
              cta: "View Event",
              link: `/events/${event._id}`,
              overlay: "rgba(0, 0, 0, 0.5)"
            }))
          : [];

        setSlides(eventSlides);
      } catch (error) {
        console.error("Error loading slides:", error);
        setSlides([]);
      }
    };

    const fetchUpcomingEvents = async () => {
      try {
        const res = await fetch("/api/events?upcoming=true&limit=3");
        const data = await res.json();
        setUpcomingEvents(data.events || []);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };



    const fetchRecentJobs = async () => {
      try {
        const res = await fetch("/api/jobs?limit=3");
        const data = await res.json();
        console.log("Jobs API response:", data); // Debug log
        // Jobs API returns array directly
        const jobsArray = Array.isArray(data) ? data : [];
        console.log("Jobs array:", jobsArray); // Debug log
        setRecentJobs(jobsArray); // API already limits to 3
      } catch (error) {
        console.error("Error loading jobs:", error);
        setRecentJobs([]);
      }
    };

    const fetchRecentBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        console.log("Blogs API response:", data); // Debug log
        // Blogs API returns array directly
        const blogsArray = Array.isArray(data) ? data : [];
        setRecentBlogs(blogsArray.slice(0, 3)); // Show latest 3 blogs
      } catch (error) {
        console.error("Error loading blogs:", error);
        setRecentBlogs([]);
      }
    };

    fetchSlides();
    fetchUpcomingEvents();
    fetchRecentJobs();
    fetchRecentBlogs();
  }, []);

  useEffect(() => {
    if (slides.length > 0 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [slides, isAutoPlaying]);



  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };



  const stats = [
    { icon: FaUsers, value: 513, label: "RBTs in Arkansas", suffix: "" },
    { icon: FaRegCalendarCheck, value: 10, label: "BCaBAs in Arkansas", suffix: "" },
    { icon: FaGraduationCap, value: 150, label: "BCBAs in Arkansas", suffix: "" },
    { icon: FaAward, value: 13, label: "BCBA-Ds in Arkansas", suffix: "" }
  ];

  const features = [
    {
      icon: FaChalkboardTeacher,
      title: "Professional Development",
      description: "Access cutting-edge CEU courses and workshops led by industry experts",
      color: "from-red-500 to-red-600"
    },
    {
      icon: FaBookOpen,
      title: "Resource Library",
      description: "Exclusive access to research, protocols, and professional materials",
      color: "from-red-600 to-red-700"
    },
    {
      icon: FaHandshake,
      title: "Networking",
      description: "Connect with peers through events, committees, and special interest groups",
      color: "from-red-700 to-red-800"
    },
    {
      icon: FaAward,
      title: "Recognition",
      description: "Get recognized for your contributions and leadership in the field",
      color: "from-red-800 to-red-900"
    }
  ];

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
  return (
      <main className="bg-white text-gray-900 overflow-x-hidden">
        <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-red-50 to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      {/* Enhanced Hero Slider - Only Events */}
              {slides.length > 0 ? (
          <section ref={sliderRef} className="relative h-screen w-full overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={slides[currentSlide]?.image}
                alt={slides[currentSlide]?.title}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Fallback to default image if external image fails
                  e.target.src = "/images/event-2.jpg";
                }}
              />
              <div 
                className="absolute inset-0"
                style={{ backgroundColor: slides[currentSlide]?.overlay || "rgba(0, 0, 0, 0.5)" }}
              />
            </div>

                     {/* Content Overlay */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
              <div className="max-w-5xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
                  {slides[currentSlide]?.title}
                </h1>
                <p className="mt-6 text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto text-white/90 drop-shadow-lg">
                  {slides[currentSlide]?.subtitle}
                </p>
                {slides[currentSlide]?.cta && (
                  <div className="mt-8">
                    <Link
                      href={slides[currentSlide]?.link || "#"}
                      className="inline-block bg-red-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:bg-red-700"
                  >
                    {slides[currentSlide]?.cta}
                    </Link>
                  </div>
                )}
              </div>

                         {/* Slider Indicators */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3">
              {slides.map((_, index) => (
            <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-red-500 w-8 shadow-lg' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
              onClick={prevSlide}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-4 rounded-full z-30 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <FaArrowLeft size={24} />
          </button>
          <button
              onClick={nextSlide}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-4 rounded-full z-30 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <FaArrowRight size={24} />
          </button>
      </section>
      ) : (
        // Default slider for faster loading when no events are loaded yet
        <section className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-1.jpg"
              alt="Welcome to ArkABA"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Default Content Overlay */}
          <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
            <div className="max-w-5xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
                Welcome to ArkABA
              </h1>
              <p className="mt-6 text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto text-white/90 drop-shadow-lg">
                Arkansas Association of Behavior Analysis
              </p>
              <div className="mt-8">
                <Link
                  href="/membership"
                  className="inline-block bg-red-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:bg-red-700"
                >
                  Become a Member
                </Link>
              </div>
            </div>

            {/* Loading indicator */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <div className="flex items-center space-x-2 text-white/80">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Loading events...</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Access Icons Section - Similar to Old Site */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href="https://www.bacb.com/services/o.php?page=101135" target="_blank" className="block text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaSearch className="text-white text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">Find a Certificant</h3>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href="/arkaba-board" className="block text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-white text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">ARKABA Board</h3>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href="/jobs" className="block text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaBriefcase className="text-white text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">Job Board</h3>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href="/events" className="block text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaRegCalendarCheck className="text-white text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">Annual Conference</h3>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href="/video" className="block text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaBookOpen className="text-white text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">Free CEUs</h3>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href="/resources" className="block text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaBriefcase className="text-white text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">Resources</h3>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Membership Benefits Section - Similar to Old Site */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your <span className="text-red-600">Membership</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-lg">
              Join Arkansas' most vibrant community of behavior analysis professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Student Plan - Modern Card Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}gap-8
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FaGraduationCap className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Student/BT</h3>
                  <p className="text-gray-600 text-sm">Perfect for students and paraprofessionals</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    <span className="text-2xl text-gray-500">$</span>10
                  </div>
                  <p className="text-gray-500 text-sm">per year</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-blue-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Networking Opportunities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-blue-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Reduced Conference Fees</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-blue-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Exam Prep Discounts</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/membership"
                  className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-2xl text-center hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Full Membership - Premium Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative lg:transform lg:scale-110"
            >
              {/* Premium Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Most Popular
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-red-200">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FaAward className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Full Membership</h3>
                  <p className="text-gray-600 text-sm">Complete access to all benefits</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    <span className="text-2xl text-gray-500">$</span>50
                  </div>
                  <p className="text-gray-500 text-sm">per year</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-red-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Free CEU Events</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-red-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Networking Opportunities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-red-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Reduced Conference Fees</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-red-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Voting Privileges</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/membership"
                  className="block w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 px-6 rounded-2xl text-center hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Join Now
                </Link>
              </div>
            </motion.div>

            {/* Affiliate Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FaHandshake className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Affiliate</h3>
                  <p className="text-gray-600 text-sm">For allied professionals</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    <span className="text-2xl text-gray-500">$</span>25
                  </div>
                  <p className="text-gray-500 text-sm">per year</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-green-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Networking Opportunities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-green-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Reduced Conference Fees</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-green-600 text-sm" />
                    </div>
                    <span className="text-gray-700">Professional Resources</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/membership"
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-2xl text-center hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-3xl p-8 border border-red-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Join Our Community?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                All memberships include access to our professional community, resources, and networking opportunities. 
                Start your journey with ArkABA today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center bg-red-600 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-red-700 transition-colors transform hover:scale-105 shadow-lg"
                >
                  View All Benefits <FaArrowRight className="ml-2" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-white text-red-600 font-semibold px-8 py-4 rounded-2xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors transform hover:scale-105"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section - Similar to Old Site */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
               FREE CEUs Library!
            </h2>
           
            <Link
              href="/video"
              className="inline-block bg-white text-red-600 font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ArkABA by the Numbers
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join Arkansas' most vibrant community of behavior analysis professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <motion.div
                  className="text-red-600 mb-4 flex justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon size={48} />
                </motion.div>
                <motion.h3
                  className="text-4xl md:text-5xl font-bold text-gray-800 mb-2"
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Counter 
                    from={0} 
                    to={stat.value} 
                    suffix={stat.suffix}
                    duration={2}
                    delay={index * 0.2}
                  />
                </motion.h3>
                <p className="text-gray-600 text-lg font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ArkABA?
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive support for behavior analysis professionals at every career stage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-white text-center h-full`}>
                  <motion.div
                    className="mb-6 flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon size={48} />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/90 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Upcoming Events Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our professional development events and earn CEUs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <motion.div
                  key={event._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48">
                                      <Image
                    src={event.backgroundImage || "/images/event-2.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      // Fallback to default image if external image fails
                      e.target.src = "/images/event-2.jpg";
                    }}
                  />

                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateWords(event.description, 20)}
                    </p>
                    <Link
                      href={`/events/${event._id}`}
                      className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      View Details <FaExternalLinkAlt className="ml-2" size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              // Fallback content when no events
              [1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                    <FaRegCalendarCheck size={64} className="text-white/80" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      Professional Development Event {i}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Join us for cutting-edge workshops and earn valuable CEUs
                    </p>
                    <Link
                      href="/events"
                      className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors"
                    >
                      View All Events <FaExternalLinkAlt className="ml-2" size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/events"
              className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors transform hover:scale-105"
            >
              View All Events <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest from Our Blog
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with insights, research, and updates from the behavior analysis community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentBlogs.length > 0 ? (
              recentBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={blog.image || "/images/hero-1.jpg"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        // Fallback to default image if external image fails
                        e.target.src = "/images/hero-1.jpg";
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Blog
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt || truncateWords(blog.content, 20)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>By {blog.author}</span>
                      <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Recent'}</span>
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/blogs/${blog._id}`}
                      className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors"
                    >
                      Read More <FaExternalLinkAlt className="ml-2" size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FaBookOpen className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No blog posts available</h3>
                <p className="text-gray-500">Check back soon for new insights and updates!</p>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/blogs"
              className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors transform hover:scale-105"
            >
              View All Blogs <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>





      {/* Latest Job Opportunities - Moved to Last */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Job Opportunities
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find your next career opportunity in behavior analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentJobs.length > 0 ? (
              recentJobs.map((job, index) => (
                <motion.div
                  key={job._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1">
                        {job.title}
                      </h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        job.jobType === 'Full-time' ? 'bg-green-100 text-green-800' :
                        job.jobType === 'Part-time' ? 'bg-blue-100 text-blue-800' :
                        job.jobType === 'Contract' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {job.jobType}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaBuilding className="w-4 h-4 mr-2 text-red-500" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <FaDollarSign className="w-4 h-4 mr-2 text-red-500" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      {job.applicationDeadline && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <FaClock className="w-4 h-4 mr-2 text-red-500" />
                          <span>Apply by: {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateWords(job.description, 20)}
                    </p>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors"
                    >
                      View Details <FaExternalLinkAlt className="ml-2" size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              // Fallback when no jobs
              <div className="col-span-full text-center py-12">
                <FaBriefcase className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No job postings available</h3>
                <p className="text-gray-500 mb-6">Check back soon for new opportunities!</p>
                <Link
                  href="/create-job"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
                >
                  Post a Job <FaArrowRight className="ml-2" />
                </Link>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              href="/jobs"
              className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors transform hover:scale-105"
            >
              View All Jobs <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Have questions or want to get involved? Contact us today!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <FaEnvelope className="text-red-600 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">info@arkaba.org</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <FaPhone className="text-red-600 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">(501) 555-0123</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <FaBuilding className="text-red-600 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-600">Little Rock, Arkansas</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Links Section - Similar to Old Site */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-6">Connect with us</h3>
            <div className="flex justify-center space-x-6">
              <motion.a
                href="https://www.facebook.com/ArkansasABA/?eid=ARC3lBNlVaP5L_aQMpftg7lR10DX8BezIxO86kTyeelrGE6bVSDn__Nw_XGZ9t4ZH5RLnyImsL3wvKF-"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl text-white hover:text-red-400 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Facebook"
              >
                <FaFacebookSquare />
              </motion.a>
              <motion.a
                href="http://instagram.com/arkansasaba"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl text-white hover:text-red-400 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Instagram"
              >
                <FaInstagram />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Ready to Elevate Your Practice?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-10 max-w-2xl mx-auto"
          >
            Join Arkansas' most vibrant community of behavior analysis professionals today
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/membership"
                className="inline-block bg-white text-red-600 font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Become a Member
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/events"
                className="inline-block bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-red-600 transition-all duration-300"
              >
                Attend an Event
              </Link>
            </motion.div>
          </motion.div>
        </div>
    </section>
    </main>
  );
}
