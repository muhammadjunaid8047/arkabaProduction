"use client";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  ArrowRight,
  BookOpen,
  Shield,
  Users,
  Award
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const byLawsSections = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Mission & Purpose",
    description: "Advancing the science and application of behavior analysis in Arkansas",
    color: "bg-red-500"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Membership",
    description: "Guidelines for membership and participation in ArkABA",
    color: "bg-red-600"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Governance",
    description: "Board structure and organizational leadership",
    color: "bg-red-700"
  }
];

export default function ByLawsPage() {
  const handleOpenPDF = () => {
    window.open("/by-laws.pdf", "_blank");
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = "/by-laws.pdf";
    link.download = "ArkABA-ByLaws-2020.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-800/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              By-Laws
            </h1>
            
            <p className="text-lg sm:text-xl text-red-100 max-w-3xl mx-auto mb-6 leading-relaxed">
              The Arkansas Association for Behavior Analysis is dedicated to the advancement of the science and application of behavior analysis.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenPDF}
                className="inline-flex items-center px-6 py-3 bg-white text-red-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                View By-Laws PDF
                <Download className="ml-2 h-4 w-4" />
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#mission"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-700 transition-all"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section id="mission" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Mission Statement
            </h2>
            
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
          The Arkansas Association for Behavior Analysis is dedicated to the
          advancement of the science and application of behavior analysis. We
          are committed to promoting research, education, and practice based on
          the principles of behavior analysis. ArkABA strives to disseminate
          knowledge from the science of behavior analysis to the public and to
          professional behavior analysts.
        </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenPDF}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all"
            >
              Download By-Laws
              <Download className="ml-2 h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* By-Laws Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Key Sections
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto"></div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {byLawsSections.map((section, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${section.color} text-white rounded-full mb-4`}>
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{section.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PDF Download Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full mb-6"
              >
                <FileText className="h-8 w-8" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Complete By-Laws Document
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Access our complete by-laws document to understand our organization's structure, 
                governance, and operational guidelines. This document was last updated in July 2020.
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenPDF}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all"
                >
                  View PDF Document
                  <FileText className="ml-2 h-4 w-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all"
                >
                  Download PDF
                  <Download className="ml-2 h-4 w-4" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Stay Informed About Our Organization
            </h2>
            
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Understanding our by-laws helps you stay informed about ArkABA's mission, 
              governance, and how we serve the behavior analysis community in Arkansas.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
          onClick={handleOpenPDF}
                className="inline-flex items-center px-6 py-3 bg-white text-red-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Read By-Laws
                <BookOpen className="ml-2 h-4 w-4" />
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/membership"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-700 transition-all"
              >
                Join ArkABA
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
            </motion.div>
          </motion.div>
      </div>
      </section>
    </div>
  );
}
