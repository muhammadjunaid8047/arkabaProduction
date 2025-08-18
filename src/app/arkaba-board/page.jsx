"use client";
import React, { useState } from "react";
import { Users, ClipboardList, Award } from "lucide-react";

const boardData = {
  executive: {
    title: "2025 ArkABA Executive Board",
    members: [
      { title: "PRESIDENT", name: "Charles Burd, MA, BCBA" },
      { title: "PAST PRESIDENT", name: "Nicolette Caldwell, PhD, BCBA-D" },
      { title: "PRESIDENT-ELECT", name: "Everly Cole, M.Ed., BCBA" },
      { title: "SECRETARY", name: "Elizabeth Lorah, Ph.D., BCBA-D" },
      { title: "TREASURER", name: "Brandon Thurman, MA, BCBA" },
    ],
    icon: <Award className="w-5 h-5" />,
  },
  committees: {
    title: "2025 ArkABA Committee Chairs",
    members: [
      { title: "FACULTY ADVISOR", name: "Robin Arnall, PhD., BCBA-D" },
      { title: "STUDENT REPRESENTATIVE", name: "Madison Maddox, M.Ed, BCBA" },
      {
        title: "MARKETING AND MEMBERSHIP COMMITTEE",
        name: "Robin Arnall, PhD., BCBA-D",
      },
      {
        title: "ETHICS AND LEGISLATIVE COMMITTEE",
        name: "Elizabeth Lorah, Ph.D., BCBA-D & Rocky Haynes, PhD., BCBA-D",
      },
      {
        title: "DIVERSITY, EQUITY, AND INCLUSION COMMITTEE",
        name: "Robin Arnall, PhD., BCBA-D",
      },
      {
        title: "STUDENT ENGAGEMENT COMMITTEE",
        name: "Madison Maddox, M.Ed, BCBA",
      },
      {
        title: "RESEARCH REVIEW COMMITTEE",
        name: "Elizabeth Lorah, PhD, BCBA-D",
      },
      { title: "EVENTS COMMITTEE", name: "Nicolette Caldwell, Ph.D., BCBA-D" },
    ],
    icon: <ClipboardList className="w-5 h-5" />,
  },
};

export default function ArkabaBoard() {
  const [activeTab, setActiveTab] = useState("executive");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Meet Our Leadership
            </h1>
            <p className="text-xl sm:text-2xl text-red-100 max-w-3xl mx-auto">
              Dedicated professionals guiding ArkABA's mission and vision
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-red-600 hover:text-red-800">
                Home
              </a>
            </li>
            <li>
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-500">ArkABA Board</li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-10">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(boardData).map(([key, group]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${
                  activeTab === key
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                {group.icon}
                <span>{group.title.split(" ")[2]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Board Members Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {boardData[activeTab].members.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {member.title}
                    </h3>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {member.name.split(",")[0]}
                </p>
                <p className="text-sm text-gray-500">
                  {member.name.split(",").slice(1).join(",").trim()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-red-50 rounded-xl p-6 sm:p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-lg font-medium text-red-800 mb-4">
              Interested in joining our leadership team?
            </h3>
            <p className="text-gray-600 mb-6">
              ArkABA is always looking for passionate professionals to contribute
              to our mission. Committee positions open annually and we welcome
              expressions of interest.
            </p>
            <a
              href="/get-involved"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Get Involved
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
