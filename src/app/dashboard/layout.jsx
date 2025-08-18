"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Mail,
  Users,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Event Management",
      href: "/dashboard/event-management",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Event Registrations",
      href: "/dashboard/event-registrations",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Job Board",
      href: "/dashboard/job-board",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: "Blog Management",
      href: "/dashboard/blog-management",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Contact Submissions",
      href: "/dashboard/Contact-Forms",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      name: "Member Management",
      href: "/dashboard/members",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "CEU library",
      href: "/dashboard/ceu",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Chat Management",
      href: "/dashboard/chat",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Members Portal",
      href: "/members-portal",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const renderNav = () => (
    <nav className="flex-1 p-2 overflow-y-auto">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMobileMenuOpen(false)} // close menu on click
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <ProtectedAdminRoute>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50">
        {/* Sidebar - Desktop */}
        <div
          className={`hidden md:flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out 
          ${isCollapsed ? "w-20" : "w-64"}`}
        >
          {/* Top section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-red-600">ARKABA Admin</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          {renderNav()}

          {/* User profile */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-medium">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">admin@arkaba.org</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar (Drawer style) */}
        <div
          className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`w-64 h-full bg-white p-4 transition-transform duration-300 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-red-600">ARKABA Admin</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            {renderNav()}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-600 p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-red-600">Dashboard</h2>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
