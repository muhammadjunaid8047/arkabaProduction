"use client";
import { useEffect, useState } from "react";
import { Mail, Users, ClipboardList, Search, Reply, Trash2 } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const [involvements, setInvolvements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactRes = await fetch("/api/contact/get");
        const contactData = await contactRes.json();
        setContacts(contactData);

        const involvedRes = await fetch("/api/getinvolved/get");
        const involvedData = await involvedRes.json();
        setInvolvements(involvedData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  const sortedData = [...(activeTab === "contacts" ? contacts : involvements)].sort((a, b) => {
    if (!sortConfig.key) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter((item) => {
    const values = Object.values(item).join(" ").toLowerCase();
    return values.includes(searchTerm.toLowerCase());
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleReply = (email, firstName, lastName) => {
    const subject = `Re: Your ${activeTab === "contacts" ? "contact form submission" : "get involved request"} to ArkABA`;
    const body = `Dear ${firstName} ${lastName},\n\nThank you for reaching out to ArkABA. We appreciate your ${activeTab === "contacts" ? "message" : "interest in getting involved"}.\n\nBest regards,\nArkABA Team`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const endpoint = type === "contact" ? "/api/contact/delete" : "/api/getinvolved/delete";
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        if (type === "contact") {
          setContacts((prev) => prev.filter((entry) => entry._id !== id));
        } else {
          setInvolvements((prev) => prev.filter((entry) => entry._id !== id));
        }
      } else {
        console.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">ArkABA Admin Portal</h1>
          <p className="text-xl sm:text-2xl text-red-100 max-w-3xl mx-auto">
            Manage contact forms and member involvement submissions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8 border border-gray-200">
          <nav className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 py-4 px-4 sm:px-6 text-center font-medium text-sm flex items-center justify-center gap-2 ${
                activeTab === "contacts" ? "text-red-700 border-b-2 border-red-700 font-semibold bg-red-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Mail className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Contact Submissions</span>
              <span className="sm:hidden">Contacts</span>
              {contacts.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {contacts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("involvements")}
              className={`flex-1 py-4 px-4 sm:px-6 text-center font-medium text-sm flex items-center justify-center gap-2 ${
                activeTab === "involvements" ? "text-red-700 border-b-2 border-red-700 font-semibold bg-red-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Get Involved</span>
              <span className="sm:hidden">Involved</span>
              {involvements.length > 0 && (
                <span className="ml-1 sm:ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {involvements.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="mb-6">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab === "contacts" ? "contacts" : "involvements"}...`}
              className="block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 text-base sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {activeTab === "contacts" ? (
            <div className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No contact submissions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {contacts.length === 0 ? "No submissions yet" : "No matching submissions found"}
                  </p>
                </div>
              ) : (
                filteredData.map((contact) => (
                  <div key={contact._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 break-words">
                          {contact.firstName} {contact.lastName}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 break-all">{contact.email}</p>
                        <p className="mt-2 text-sm text-gray-500 break-words">{contact.message}</p>
                        
                        {/* Date on mobile - shown under content */}
                        <div className="mt-3 sm:hidden">
                          <span className="text-xs text-gray-500">
                            {new Date(contact.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="sm:ml-4 flex-shrink-0 flex flex-col">
                        {/* Date on desktop - shown at top right */}
                        <span className="hidden sm:block text-xs text-gray-500 mb-2 text-right">
                          {new Date(contact.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        
                        {/* Action buttons */}
                        <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleReply(contact.email, contact.firstName, contact.lastName)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[44px]"
                          >
                            <Reply className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Reply</span>
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id, "contact")}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[44px]"
                          >
                            <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium">No involvement submissions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {involvements.length === 0 ? "No responses yet" : "No matching responses found"}
                  </p>
                </div>
              ) : (
                filteredData.map((involved) => (
                  <div key={involved._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 break-words">
                          {involved.firstName} {involved.lastName}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 break-all">{involved.email}</p>
                        
                        {/* Interest grid - responsive layout */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-2 sm:gap-y-2 sm:flex-col">
                            <p><span className="font-medium">Committee:</span> {involved.joinCommittee ? "Yes" : "No"}</p>
                            <p><span className="font-medium">Events:</span> {involved.planEvents ? "Yes" : "No"}</p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-2 sm:gap-y-2 sm:flex-col">
                            <p><span className="font-medium">CEU:</span> {involved.offerCEU ? "Yes" : "No"}</p>
                            <p><span className="font-medium">Advocacy:</span> {involved.supportAdvocacy ? "Yes" : "No"}</p>
                          </div>
                          {involved.otherInterest && (
                            <div className="sm:col-span-2 mt-2">
                              <p className="break-words">
                                <span className="font-medium">Other interests:</span> {involved.otherInterest}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Date on mobile - shown under content */}
                        <div className="mt-3 sm:hidden">
                          <span className="text-xs text-gray-500">
                            {new Date(involved.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="sm:ml-4 flex-shrink-0 flex flex-col">
                        {/* Date on desktop - shown at top right */}
                        <span className="hidden sm:block text-xs text-gray-500 mb-2 text-right">
                          {new Date(involved.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        
                        {/* Action buttons */}
                        <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleReply(involved.email, involved.firstName, involved.lastName)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[44px]"
                          >
                            <Reply className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Reply</span>
                          </button>
                          <button
                            onClick={() => handleDelete(involved._id, "involvement")}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[44px]"
                          >
                            <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
