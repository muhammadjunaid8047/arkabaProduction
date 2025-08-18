"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Shield,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Briefcase,
  MessageSquare,
  Heart,
  Award,
  GraduationCap,
  Home,
  ArrowRight,
  Bell,
} from "lucide-react";

const navigationItems = [
  {
    title: "About",
    // icon: "Users",
    items: [
      { label: "ARKABA Board", href: "/arkaba-board", icon: "Award" },
      { label: "By-Laws", href: "/by-laws", icon: "FileText" },
      {
        label: "Inclusion & Diversity",
        href: "/inclusion-and-diversity",
        icon: "Heart",
      },
    ],
  },
  {
    title: "Events",
    // icon: "Calendar",
    items: [
      { label: "All Events", href: "/events", icon: "Calendar" },
      // { label: "Annual Conference", href: "/upcoming_events", icon: "Award" },
    ],
  },
  {
    title: "Membership",
    // icon: "Shield",
    items: [
      { label: "Join ArkABA", href: "/membership", icon: "Users" },
      { label: "Member Login", href: "/members-login", icon: "Shield" },
    ],
    tray: ["Membership", "Membership Login"],
    links: ["/membership", "/membership_login"],
  },
  {
    title: "Resources",
    // icon: "BookOpen",
    items: [
      { label: "Resources", href: "/resources", icon: "BookOpen" },
      { label: "Blog", href: "/blogs", icon: "FileText" },
      {
        label: "ARKABA Swag",
        href: "https://www.redbubble.com/people/ArkABA/explore?page=1&sortOrder=recent",
        icon: "Award",
        external: true,
      },
      { label: "Job Board", href: "/jobs", icon: "Briefcase" },
      { label: "Post a Job", href: "/create-job", icon: "Briefcase" },
      { label: "CEU Library", href: "/video", icon: "FileText" },
    ],
  },
  {
    title: "Contact",
    // icon: "MessageSquare",
    items: [
      { label: "Contact Us", href: "/contact", icon: "MessageSquare" },
      { label: "Get Involved", href: "/get-involved", icon: "Heart" },
    ],
  },
];

const memberOnlyItems = [
  { label: "CEU Library", href: "/members-portal/course-platform/courses", icon: "BookOpen" },
  { label: "Chat", href: "/members-portal/chat", icon: "MessageSquare" },
];

// Icon mapping
const iconMap = {
  Users: Users,
  Calendar: Calendar,
  FileText: FileText,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  MessageSquare: MessageSquare,
  Heart: Heart,
  Award: Award,
  Shield: Shield,
  Settings: Settings,
  GraduationCap: GraduationCap,
  User: User,
  LogOut: LogOut,
  ArrowRight: ArrowRight,
  Menu: Menu,
  X: X,
  ChevronDown: ChevronDown,
};

const Navbar = () => {
  const { data: session, status } = useSession();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    setUserMenuOpen(false);
  };

  const closeAllMenus = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <nav
      className={` z-50 sticky top-0 transition-all duration-300  ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-white"
      }`}
    >
      <div className=" w-full">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 mr-4 sm:mr-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-14 h-14 lg:w-16 lg:h-16">
                <Image
                  src="/logo.png"
                  alt="ArkABA Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold text-gray-900">
                  ArkABA
                </span>
                <span className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                  Arkansas Association of Behavior Analysis
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center  justify-center">
            {navigationItems.map((item) => (
              <div key={item.title} className="relative group">
                <button
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
                  onMouseEnter={() => setOpenDropdown(item.title)}
                >
                  {getIcon(item.icon)}
                  <span>{item.title}</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {openDropdown === item.title && (
                  <div
                    className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50"
                    onMouseEnter={() => setOpenDropdown(item.title)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        target={subItem.external ? "_blank" : undefined}
                        rel={
                          subItem.external ? "noopener noreferrer" : undefined
                        }
                        className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        onClick={closeAllMenus}
                      >
                        {getIcon(subItem.icon)}
                        <span>{subItem.label}</span>
                        {subItem.external && (
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Member Only Section - Desktop */}
            {session && (
              <div className="relative group ml-3">
                <button
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 rounded-lg hover:bg-red-50"
                  onMouseEnter={() => setOpenDropdown("member")}
                  onMouseLeave={() => {
                    // Only close if we're not hovering over the dropdown
                    if (openDropdown !== "member") {
                      setOpenDropdown(null);
                    }
                  }}
                >
                  <Shield className="h-4 w-4" />
                  <span>Member Area</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {openDropdown === "member" && (
                  <div
                    className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50"
                    onMouseEnter={() => setOpenDropdown("member")}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div className="px-5 py-3 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Member Only
                      </p>
                    </div>
                    {memberOnlyItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        onClick={closeAllMenus}
                      >
                        {getIcon(item.icon)}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Auth Section */}
            {status === "loading" ? (
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name || "Member"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/members-portal"
                        className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        onClick={closeAllMenus}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Member Portal</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Join ArkABA visible on small screens and up */}
                <Link href="/membership">
                  <button className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 whitespace-nowrap">
                    Join ArkABA
                  </button>
                </Link>
                {/* Sign In button - only visible on large screens and up */}
                <Link href="/members-login" className="hidden lg:block">
                  <button className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Show on all screens below xl */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Show on all screens below xl */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-200 shadow-lg max-h-screen overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Items */}
            {navigationItems.map((item) => (
              <div key={item.title} className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                    {getIcon(item.icon)}
                    <span>{item.title}</span>
                  </span>
                </div>
                <div className="pl-6 space-y-2">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      target={subItem.external ? "_blank" : undefined}
                      rel={subItem.external ? "noopener noreferrer" : undefined}
                      className="flex items-center space-x-2 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                      onClick={closeAllMenus}
                    >
                      {getIcon(subItem.icon)}
                      <span>{subItem.label}</span>
                      {subItem.external && (
                        <ArrowRight className="h-3 w-3 ml-auto" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Mobile Member Only Section */}
            {session && (
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Member Area</span>
                  </span>
                </div>
                <div className="pl-6 space-y-2">
                  {memberOnlyItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center space-x-2 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                      onClick={closeAllMenus}
                    >
                      {getIcon(item.icon)}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Auth Section */}
            {!session && (
              <div className="pt-4 space-y-3">
                <Link href="/members-login">
                  <button
                    className="w-full px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/membership">
                  <button
                    className="w-full px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Join ArkABA
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile User Menu for Logged In Users */}
            {session && (
              <div className="pt-4 space-y-3">
                <div className="px-3 py-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user?.name || "Member"}
                  </p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
