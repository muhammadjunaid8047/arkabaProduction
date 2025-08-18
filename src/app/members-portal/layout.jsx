"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  LogOut,
  Home,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  Calendar,
  MessageCircle,
  Receipt,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function MembersPage({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items for the member portal
  const navItems = [
    {
      name: "Dashboard",
      href: "/members-portal",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "CEU Library",
      href: "/members-portal/course-platform/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Events",
      href: "/members-portal/events",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Chat",
      href: "/members-portal/chat",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      name: "Directory",
      href: "/members-portal/directory",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Event Payments",
      href: "/members-portal/event-payments",
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      name: "Payment History",
      href: "/members-portal/payment-history/",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  // Render navigation for both desktop and mobile
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
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </Link>
          </li>
        ))}

        {/* Admin Dashboard Button - Only show if user is admin */}
        {session?.user?.isAdmin && (
          <li>
            <Link
              href="/dashboard"
              className="flex items-center p-3 rounded-lg transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600 border-t border-gray-200 mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex-shrink-0">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              {!isCollapsed && (
                <span className="ml-3 font-medium">Admin Dashboard</span>
              )}
            </Link>
          </li>
        )}

        <li>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center p-3 w-full text-left rounded-lg transition-colors text-gray-600 hover:bg-red-600 hover:text-white`}
            variant="ghost"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </Button>
        </li>
      </ul>
    </nav>
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-lg text-muted-foreground">
            Loading user session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              You need to be logged in to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/members-login")}
              className="w-full py-2 text-lg"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar - Desktop */}
      <div
        className={`hidden md:flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Top section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-red-600">ArkABA Portal</h1>
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
                <span className="text-red-600 font-medium">
                  {session.user.name ? session.user.name[0] : "U"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="mt-2 px-4 py-2 text-sm w-full text-center"
            >
              {session.user.role}
            </Badge>
            {/* Show admin badge if user is admin */}
            {session.user.isAdmin && (
              <Badge
                variant="destructive"
                className="mt-2 px-4 py-2 text-sm w-full text-center bg-red-600"
              >
                Admin User
              </Badge>
            )}
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
            <h1 className="text-xl font-bold text-red-600">ArkABA Portal</h1>
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
          <h2 className="text-lg font-semibold text-red-600">Member Portal</h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4">
          {children || (
            <Card className="w-full shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-red-600">
                  Welcome, {session.user.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Explore the members-only content and features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Welcome to the ArkABA Member Portal. Use the sidebar to
                  navigate to the CEU Library, upcoming events, community
                  features, or manage your profile settings.
                </p>
                {/* Show admin dashboard link if user is admin */}
                {session.user.isAdmin && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      You have admin privileges. Access the admin dashboard to
                      manage:
                    </p>
                    <Link href="/dashboard">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Go to Admin Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
