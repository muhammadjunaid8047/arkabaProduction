"use client";
import {
  Globe,
  BookOpen,
  GraduationCap,
  LifeBuoy,
  Users,
  Search,
  Mail,
  ArrowUpRight,
  Bookmark,
  Share2,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("Professional Organizations");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = JSON.parse(
        localStorage.getItem("resourceFavorites") || "[]"
      );
      setFavorites(savedFavorites);
    }
  }, []);

  const toggleFavorite = (url) => {
    const newFavorites = favorites.includes(url)
      ? favorites.filter((fav) => fav !== url)
      : [...favorites, url];
    setFavorites(newFavorites);
    localStorage.setItem("resourceFavorites", JSON.stringify(newFavorites));
  };

  const shareResource = async (title, url) => {
    try {
      await navigator.share({
        title: `${title} - ArkABA Resource`,
        text: `Check out this resource from ArkABA: ${title}`,
        url: url,
      });
    } catch (err) {
      navigator.clipboard.writeText(`${title}: ${url}`);
      alert("Link copied to clipboard!");
    }
  };

  const iconMap = {
    "Professional Organizations": Globe,
    Journals: BookOpen,
    "ABAI SIGs": Users,
    "Approved Course Sequence": GraduationCap,
    "Special Education": LifeBuoy,
    "Parent Resources": LifeBuoy,
    Other: Globe,
  };

  const rawCategories = {
    "Professional Organizations": [
      { title: "Behavior Analyst Certification Board", url: "https://www.bacb.com" },
      { title: "Association for Science in Autism Treatment", url: "https://asatonline.org" },
      { title: "Association for Behavior Analysis International", url: "https://www.abainternational.org" },
      { title: "Association for Professional Behavior Analysis", url: "https://www.apbahome.net" },
      { title: "Behavior Analyst Leadership Council", url: "https://www.bacb.com/balc/" },
      { title: "Behavior Analysis Advocacy Network", url: "https://www.ba-advocacy.org" },
      { title: "Standard Celeration Society", url: "https://celeration.org" },
      { title: "Association for Contextual Behavioral Science", url: "https://contextualscience.org" },
    ],
    Journals: [
      { title: "Journal of Applied Behavior Analysis", url: "https://onlinelibrary.wiley.com/journal/19383703" },
      { title: "The Behavior Analyst", url: "https://link.springer.com/journal/40614" },
      { title: "The Analysis of Verbal Behavior", url: "https://link.springer.com/journal/40616" },
      { title: "Journal of Early and Intensive Behavior Intervention", url: "https://www.bacb.com/journals/" },
    ],
    "ABAI SIGs": [
      { title: "ABAI SIG List", url: "https://www.abainternational.org/constituents/special-interest-groups.aspx" },
      { title: "Experimental Analysis of Human Behavior SIG", url: "https://eaohb.org" },
    ],
    "Approved Course Sequence": [
      { title: "BACB Approved Course Sequence", url: "https://www.bacb.com/verified-course-sequences/" },
      { title: "ABAI Accredited Programs", url: "https://accreditation.abainternational.org/accredited-programs.aspx" },
      { title: "BACB Certificant Data", url: "https://www.bacb.com/about-us/certificant-data/" },
      { title: "University Pass Rates", url: "https://www.bacb.com/university-pass-rates/" },
      { title: "University of Arkansas Graduate Certificate", url: "https://spare.uark.edu/programs/graduate-certificate/" },
      { title: "Ouachita Baptist University: MS in ABA", url: "https://obu.edu/grad/aba.php" },
    ],
    "Special Education": [
      { title: "Wrightslaw", url: "https://wrightslaw.com" },
      { title: "Division of Elementary & Secondary Education", url: "https://dese.ade.arkansas.gov" },
      { title: "Arkansas Behavior Support Specialists", url: "https://arksped.ade.arkansas.gov/behaviorsupport/" },
    ],
    "Parent Resources": [
      { title: "Autism Involves Me (AIM)", url: "https://www.aimnwa.org/" },
      { title: "Project Connect Autism Guide", url: "https://autism.uark.edu/project-connect-2/" },
    ],
    Other: [
      { title: "B.F. Skinner Foundation", url: "https://www.bfskinner.org" },
      { title: "Cambridge Center for Behavioral Studies", url: "https://www.behavior.org" },
      { title: "The Council of Autism Service Providers", url: "https://casproviders.org" },
      { title: "Punishment on Trial by Ennio Cipani", url: "https://www.amazon.com/Punishment-Trial-Ennio-Cipani/dp/0966852814" },
      { title: "Professional and Ethical Compliance Code", url: "https://www.bacb.com/wp-content/uploads/2020/05/190501-compliance-code-english.pdf" },
      { title: "Operants Magazine", url: "https://www.abainternational.org/constituents/operants.aspx" },
    ],
  };

  const categories = Object.entries(rawCategories).reduce((acc, [category, items]) => {
    const Icon = iconMap[category] || Globe;
    acc[category] = items.map((item) => ({
      ...item,
      icon: <Icon className="h-5 w-5 text-red-600" />,
    }));
    return acc;
  }, {});

  const filteredItems = categories[activeTab].filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 mt-15">
      {/* Scrollbar Hide Style */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Professional Resources</h1>
          <p className="text-lg sm:text-xl text-red-100 max-w-3xl mx-auto">
            Curated tools and references for behavior analysis professionals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-center">
          <a
            href="https://www.bacb.com/services/o.php?page=101155"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Users className="mr-2 h-5 w-5" />
            Find a Certificant
          </a>
        </div>

        {/* 👇 Mobile-Friendly Scrollable Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto no-scrollbar space-x-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  activeTab === category
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Resource Cards */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {filteredItems.length > 0 ? (
    filteredItems.map((item, index) => (
      <div
        key={index}
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col"
      >
        <div className="p-6 flex-grow">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
                {item.icon}
              </div>
              <div className="ml-4 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 break-words">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {new URL(item.url).hostname.replace("www.", "")}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(item.url)}
              className={`ml-2 p-1 rounded-full ${
                favorites.includes(item.url)
                  ? "text-red-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              aria-label={
                favorites.includes(item.url)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <Bookmark
                className="h-5 w-5"
                fill={favorites.includes(item.url) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <div className="mt-6 flex justify-between space-x-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 group transition-colors"
            >
              <span>Visit Resource</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
            </a>
            <button
              onClick={() => shareResource(item.title, item.url)}
              className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Share resource"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full text-center py-12">
      <Search className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">
        No resources found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search or select a different category
      </p>
    </div>
  )}
</div>

{/* Favorites Section */}
{favorites.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <Bookmark className="h-6 w-6 text-red-600 mr-2" fill="currentColor" />
      Your Saved Resources
    </h2>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.values(categories)
        .flat()
        .filter((item) => favorites.includes(item.url))
        .map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="p-6 flex-grow">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
                    {item.icon}
                  </div>
                  <div className="ml-4 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {new URL(item.url).hostname.replace("www.", "")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(item.url)}
                  className="ml-2 p-1 rounded-full text-red-600"
                  aria-label="Remove from favorites"
                >
                  <Bookmark className="h-5 w-5" fill="currentColor" />
                </button>
              </div>
              <div className="mt-6">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 group transition-colors"
                >
                  <span>Visit Resource</span>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                </a>
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
)}

{/* Suggestions Section */}
<div className="mt-12 bg-red-50 rounded-xl p-8 border border-red-100">
  <div className="max-w-3xl mx-auto text-center">
    <Mail className="mx-auto h-10 w-10 text-red-600" />
    <h3 className="mt-4 text-xl font-bold text-gray-900">
      Have resources to add?
    </h3>
    <p className="mt-2 text-gray-600">
      Help us expand our collection by suggesting new resources
    </p>
    <a
      href="mailto:info@arkaba.org"
      className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <Mail className="mr-2 h-5 w-5" />
      Email Your Suggestions
    </a>
  </div>
</div>

      </div>
    </div>
  );
}
