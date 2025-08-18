
"use client";

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  UserPlus, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Clock
} from "lucide-react"

// Enhanced DashboardCard component with animations and better styling
function DashboardCard({ title, value, icon: Icon, trend, trendValue, description, bgGradient = "from-blue-50 to-indigo-50" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = parseInt(value) || 0;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(counter);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br ${bgGradient} border-0 shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{displayValue.toLocaleString()}</div>
          {description && (
            <p className="text-xs text-gray-600">{description}</p>
          )}
          {trend && (
            <div className="flex items-center space-x-1">
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 text-red-300" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}% from last week
              </span>
            </div>
          )}
        </div>
      </CardContent>
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
    </Card>
  )
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { name: "Add New Job", href: "/dashboard/job-board", icon: Briefcase, color: "bg-blue-500 hover:bg-blue-600" },
    { name: "Manage Events", href: "/dashboard/event-management", icon: Calendar, color: "bg-green-500 hover:bg-green-600" },
    { name: "View Messages", href: "/dashboard/chat", icon: MessageSquare, color: "bg-purple-500 hover:bg-purple-600" },
    { name: "Member Management", href: "/dashboard/members", icon: Users, color: "bg-orange-500 hover:bg-orange-600" },
  ];

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{action.name}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Component
function RecentActivity() {
  const activities = [
    { action: "New member joined", time: "2 minutes ago", icon: UserPlus, color: "text-green-600" },
    { action: "Job posting published", time: "1 hour ago", icon: Briefcase, color: "text-blue-600" },
    { action: "New message received", time: "3 hours ago", icon: MessageSquare, color: "text-purple-600" },
    { action: "Event scheduled", time: "5 hours ago", icon: Calendar, color: "text-orange-600" },
  ];

  return (
    <Card className="bg-white border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalMessages: 0,
    messagesToday: 0,
    messagesThisWeek: 0,
    totalMembers: 0,
    signupsToday: 0,
    signupsThisWeek: 0,
  })

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard-stats")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Optionally set some default or error state for stats
      } finally {
        setLoading(false);
      }
    }
    fetchStats()
  }, [])

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-400 text-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to ArkABA Dashboard</h1>
            <p className="text-blue-100 text-base md:text-lg">Manage your community with powerful tools and insights</p>
            <p className="text-blue-200 text-sm mt-2">{currentTime}</p>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="h-20 w-20 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Jobs" 
          value={stats.totalJobs} 
          icon={Briefcase} 
          description="Active job postings"
          bgGradient="from-blue-50 to-blue-100"
          trend="up"
          trendValue="12"
        />
        <DashboardCard 
          title="Total Messages" 
          value={stats.totalMessages} 
          icon={MessageSquare} 
          description="Community messages"
          bgGradient="from-purple-50 to-purple-100"
          trend="up"
          trendValue="8"
        />
        <DashboardCard 
          title="Messages Today" 
          value={stats.messagesToday} 
          icon={TrendingUp} 
          description="Today's activity"
          bgGradient="from-green-50 to-green-100"
          trend="up"
          trendValue="25"
        />
        <DashboardCard 
          title="Messages This Week" 
          value={stats.messagesThisWeek} 
          icon={Activity} 
          description="Weekly engagement"
          bgGradient="from-orange-50 to-orange-100"
          trend="up"
          trendValue="15"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Total Members" 
          value={stats.totalMembers} 
          icon={Users} 
          description="Registered community members"
          bgGradient="from-indigo-50 to-indigo-100"
          trend="up"
          trendValue="5"
        />
        <DashboardCard 
          title="Signups Today" 
          value={stats.signupsToday} 
          icon={UserPlus} 
          description="New registrations today"
          bgGradient="from-teal-50 to-teal-100"
          trend="up"
          trendValue="20"
        />
        <DashboardCard 
          title="Signups This Week" 
          value={stats.signupsThisWeek} 
          icon={TrendingUp} 
          description="Weekly new members"
          bgGradient="from-pink-50 to-pink-100"
          trend="up"
          trendValue="18"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Engagement Chart */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Engagement
            </CardTitle>
            <CardDescription>Messages and signups over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Messages</span>
                <span className="text-sm font-bold text-gray-900">{stats.messagesThisWeek}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.messagesThisWeek / 100) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">New Signups</span>
                <span className="text-sm font-bold text-gray-900">{stats.signupsThisWeek}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.signupsThisWeek / 50) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Active Jobs</span>
                <span className="text-sm font-bold text-gray-900">{stats.totalJobs}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.totalJobs / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>Key metrics and growth indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{((stats.messagesToday / Math.max(stats.messagesThisWeek, 1)) * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">Daily Message Rate</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{((stats.signupsToday / Math.max(stats.signupsThisWeek, 1)) * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-600 mt-1">Daily Signup Rate</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{(stats.totalMessages / Math.max(stats.totalMembers, 1)).toFixed(1)}</div>
                <div className="text-xs text-gray-600 mt-1">Messages per Member</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.totalMembers > 0 ? ((stats.totalJobs / stats.totalMembers) * 100).toFixed(1) : '0'}%</div>
                <div className="text-xs text-gray-600 mt-1">Job to Member Ratio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
            <span className="text-gray-700">Loading dashboard data...</span>
          </div>
        </div>
      )}
    </main>
  )
}
