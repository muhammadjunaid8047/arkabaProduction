"use client";
import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  Globe, 
  BookOpen, 
  Calendar, 
  ExternalLink, 
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Lightbulb,
  Shield
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

const commitmentAreas = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Anti-Racism",
    description: "Committed to ending systemic racism in behavior analysis",
    color: "bg-red-500"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Inclusive Practices",
    description: "Promoting diversity in our professional community",
    color: "bg-red-600"
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Cultural Competency",
    description: "Supporting culturally responsive behavior analysis",
    color: "bg-red-700"
  }
];

const resources = [
  {
    title: "An Antiracist Reading List",
    description: "Essential readings for understanding and combating racism",
    link: "https://www.nytimes.com/2019/05/29/books/review/antiracist-reading-list-ibram-x-kendi.html",
    category: "Education"
  },
  {
    title: "20 Essential Black Anti-Racist Reading List",
    description: "Comprehensive reading list for anti-racist education",
    link: "https://www.elle.com/culture/books/g32687973/black-history-books-reading-list/",
    category: "Education"
  },
  {
    title: "Anti-Racism Resources Document",
    description: "Comprehensive collection of anti-racism resources",
    link: "https://docs.google.com/document/d/1BRlF2_zhNe86SGgHa6-VlBO-QgirITwCTugSfKie5Fs/preview?pru=AAABcprtDfM*fVMUlAYrBTjVoOdfwuj-LA",
    category: "Resources"
  },
  {
    title: "Beautiful Humans Podcast",
    description: "Podcast focused on diversity and inclusion in behavior analysis",
    link: "https://anchor.fm/beautiful-humans",
    category: "Podcast"
  },
  {
    title: "Shades of ABA Podcast",
    description: "Podcast exploring diversity in applied behavior analysis",
    link: "https://anchor.fm/shadesofaba",
    category: "Podcast"
  },
  {
    title: "ABA Task Force",
    description: "Working group dedicated to diversity initiatives in ABA",
    link: "https://abataskforce.ck.page/0204ecd661?fbclid=IwAR0MoRn5mJEokNpfGuazKLQDrbJfkafstpWsgmrEZs4zbCLWg7UunOLdG_o",
    category: "Community"
  }
];

const events = [
  {
    title: "BABA 1st Annual Conference",
    date: "Upcoming",
    location: "BABA Events",
    description: "Black Applied Behavior Analysis annual conference",
    link: "https://www.babainfo.org/events"
  },
  {
    title: "ABA Task Force",
    date: "Ongoing",
    location: "Virtual",
    description: "ABA Task Force initiatives and events",
    link: "https://abataskforce.ck.page/0204ecd661?fbclid=IwAR0MoRn5mJEokNpfGuazKLQDrbJfkafstpWsgmrEZs4zbCLWg7UunOLdG_o"
  },
  {
    title: "Culturo - Behavior Science for a Better World Conference",
    date: "Upcoming",
    location: "International",
    description: "Conference on cultural behavior science",
    link: "https://www.abainternational.org/events/culturo-behavior-science-for-a-better-world/registration.aspx"
  }
];

const articles = [
  {
    title: "Can Behavior Analysis Help Us Understand and Reduce Racism?",
    author: "Research Article",
    year: "2020",
    description: "Scientific exploration of behavior analysis in addressing racism",
    link: "https://link.springer.com/article/10.1007/s40617-020-00411-4"
  },
  {
    title: "Implicit Bias is Behavior",
    author: "Research Article",
    year: "2019",
    description: "Functional-cognitive perspective on implicit bias",
    link: "https://www.researchgate.net/publication/334906424_Implicit_Bias_Is_Behavior_A_Functional-Cognitive_Perspective_on_Implicit_Bias"
  }
];

const organizations = [
  {
    name: "Black Applied Behavior Analysis (BABA)",
    description: "Supporting Black professionals in behavior analysis",
    link: "https://www.babainfo.org/donate-index-impact",
    focus: "Professional Development"
  },
  {
    name: "NAACP",
    description: "Advancing civil rights and social justice",
    link: "https://secure.actblue.com/donate/naacp-1",
    focus: "Civil Rights"
  }
];

export default function InclusionDiversity() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - More Compact */}
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
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Inclusion, Equity, & Diversity
            </h1>
            
            <p className="text-lg sm:text-xl text-red-100 max-w-3xl mx-auto mb-6 leading-relaxed">
              Responses from this optionally anonymous needs assessment will be used to develop the next steps in our commitment to ending systemic racism and racial biases in the behavior analytic community in Arkansas.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://docs.google.com/forms/d/1S2fB-9xT6Qw3GXWHLnhUezucGPW17Rzmc_mX_WhJeUM/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-red-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Needs Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#resources"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-700 transition-all"
              >
                Explore Resources
                <BookOpen className="ml-2 h-4 w-4" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Our Commitment to Change
            </h2>
            
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
            
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              Responses from this optionally anonymous needs assessment will be used to develop the next steps 
              in our commitment to ending systemic racism and racial biases in the behavior analytic 
              community in Arkansas. We believe that diversity strengthens our field and improves outcomes 
              for all individuals we serve.
            </p>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://docs.google.com/forms/d/1S2fB-9xT6Qw3GXWHLnhUezucGPW17Rzmc_mX_WhJeUM/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all"
            >
              Participate in Needs Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Commitment Areas */}
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
              Areas of Focus
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
            {commitmentAreas.map((area, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${area.color} text-white rounded-full mb-4`}>
                  {area.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{area.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{area.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Where To Donate Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Where To Donate
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Support organizations that align with our mission of diversity and inclusion
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {organizations.map((org, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {org.name}
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm">
                      {org.description}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {org.focus}
                    </span>
                  </div>
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                
                <a
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm group"
                >
                  Donate Now
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Resources
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Curated resources to support your learning and growth in diversity, equity, and inclusion
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl p-5 hover:shadow-lg transition-all border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {resource.category}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">
                  {resource.description}
                </p>
                
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm group"
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Upcoming Events
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join us for events focused on diversity, inclusion, and cultural competency
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {events.map((event, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                className="bg-gray-50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {event.location}
                    </span>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 text-sm">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm group"
                    >
                      Learn More
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Articles Section */}
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
              Articles
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Research and insights on diversity and inclusion in behavior analysis
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {articles.map((article, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <BookOpen className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-gray-500">{article.year}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-3 text-sm">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {article.author}</span>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm group"
                  >
                    Read Article
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
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
              Join Us in Building a More Inclusive Future
            </h2>
            
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Your voice matters. Participate in our needs assessment to help shape our diversity and inclusion initiatives.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://docs.google.com/forms/d/1S2fB-9xT6Qw3GXWHLnhUezucGPW17Rzmc_mX_WhJeUM/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-red-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Take Needs Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#resources"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-700 transition-all"
              >
                Explore Resources
                <BookOpen className="ml-2 h-4 w-4" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
