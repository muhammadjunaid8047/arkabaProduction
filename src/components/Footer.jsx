"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ExternalLink,
  Award,
  Users,
  BookOpen,
  Shield
} from "lucide-react";

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Don't show footer on admin or dashboard pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  const footerSections = [
    {
      title: "About ArkABA",
      icon: Award,
      links: [
        { label: "ARKABA Board", href: "/arkaba-board" },
        { label: "By-Laws", href: "/by-laws" },
        { label: "Inclusion & Diversity", href: "/inclusion-and-diversity" },
      ]
    },
    {
      title: "Membership",
      icon: Shield,
      links: [
        { label: "Join ArkABA", href: "/membership" },
        { label: "Member Login", href: "/members-login" },
      ]
    },
    {
      title: "Resources",
      icon: BookOpen,
      links: [
        { label: "Resources", href: "/resources" },
        { label: "Blog", href: "/blogs" },
        { label: "CEU", href: "/video" },
        { label: "Job Board", href: "/jobs" },
        { label: "Post a Job", href: "/create-job" },
        { label: "ARKABA Swag", href: "https://www.redbubble.com/people/ArkABA/explore?page=1&sortOrder=recent", external: true },
      ]
    },
    {
      title: "Events & Learning",
      icon: Award,
      links: [
        { label: "Events", href: "/events" },
        // { label: "Courses", href: "/courses" },
      ]
    },
    {
      title: "Get Involved",
      icon: Users,
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "Get Involved", href: "/get-involved" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/ArkansasABA/?eid=ARC3lBNlVaP5L_aQMpftg7lR10DX8BezIxO86kTyeelrGE6bVSDn__Nw_XGZ9t4ZH5RLnyImsL3wvKF-", label: "Facebook" },
    // { icon: Twitter, href: "#", label: "Twitter" },
    // { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/arkansasaba", label: "Instagram" },
  ];

  return (
    <footer className="bg-white text-black border-t-4 border-red-600">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Logo and Description Section */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 mr-3">
                <Image
                  src="/logo.png"
                  alt="ArkABA Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">ArkABA</h3>
                <p className="text-xs text-gray-600">Arkansas Association of Behavior Analysis</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Professional organization dedicated to advancing the science and practice of behavior analysis in Arkansas. 
              Supporting practitioners, researchers, and students in the field.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 text-sm">
                <Mail className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                <span>info@arkaba.org</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <Phone className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                <span>(501) 555-0123</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                <span>Little Rock, Arkansas</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.slice(0, 4).map((section, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center space-x-2">
                <section.icon className="w-4 h-4 text-red-600" />
                <h4 className="text-black font-semibold text-sm uppercase tracking-wider">
                  {section.title}
                </h4>
              </div>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-red-600 text-sm transition-colors duration-200 flex items-center group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-700 hover:text-red-600 text-sm transition-colors duration-200 hover:translate-x-1 transform transition-all duration-200 inline-block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright and Accreditation */}
            <div className="text-center lg:text-left">
              <div className="text-gray-600 text-sm mb-1">
                © {currentYear} Arkansas Association of Behavior Analysis. All rights reserved.
              </div>
              <div className="text-gray-500 text-xs">
                                {/* Hidden credits positioned ahead of Emergitech */}
                <span className="opacity-0 absolute -left-full pointer-events-none" aria-hidden="true">
                  Original Development by Waqas Khalid, Muhammad Junaid and Faraz Alam🤍
                </span>

                Designed and Developed by <a href="https://www.emergitechsolutions.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">Emergitech Solutions</a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-gray-700 hover:text-red-600 transition-all duration-200 p-2 hover:bg-red-100 rounded-full hover:scale-110"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

