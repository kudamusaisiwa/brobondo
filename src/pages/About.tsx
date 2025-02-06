import React from 'react';
import PublicHeader from '../components/PublicHeader';
import { FaHandshake, FaLightbulb, FaUsers, FaChartLine, FaCog, FaHome, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function About(): JSX.Element {
  return (
    <>
      <SEO
        title="About Brobondo Real Estate - Building Trust Through Excellence"
        description="Learn about Brobondo Real Estate, a dynamic and forward-thinking real estate firm founded in 2024. We are committed to transparency, integrity, and community engagement in all our real estate services."
        pathname="/about"
      />
 estate company, property management, zimbabwe real estate, real estate services" />
        <meta name="author" content="Brobondo Real Estate" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:site_name" content="Brobondo Real Estate" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={url} />

        {/* Schema.org markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'Brobondo Real Estate',
            'description': description,
            'url': url,
            'logo': imageUrl,
            'foundingDate': '2024',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': '2 Allenby Road',
              'addressLocality': 'Highlands',
              'addressRegion': 'Harare',
              'addressCountry': 'Zimbabwe'
            },
            'contactPoint': {
              '@type': 'ContactPoint',
              'telephone': '+263 (242) 752781-3',
              'contactType': 'customer service',
              'areaServed': 'Zimbabwe',
              'availableLanguage': ['English', 'Shona', 'Ndebele']
            },
            'sameAs': [
              'https://www.facebook.com/brobondo',
              'https://www.instagram.com/brobondo',
              'https://www.linkedin.com/company/brobondo'
            ]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-gray-900">

      <PublicHeader />

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 -z-10"></div>
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6">
              About Brobondo Properties
            </h1>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Brobondo Real Estate is a dynamic and forward-thinking real estate firm committed to revolutionizing the property buying, selling, and investment landscape.
                Founded in 2024, we are grounded in the values of transparency, integrity, and community engagement, striving to provide clients with a smooth and transparent
                journey through the real estate market.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Led by a dedicated team of professionals, we are committed to fulfilling our obligations to clients in the most timely and efficient manner.
                Our successful track record and client appreciation reflect our strategy, which is based on sustainable business practices and balancing
                responsibility alongside growth and productivity.
              </p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative overflow-hidden rounded-xl shadow-lg aspect-[16/9] my-12 group"
              >
                <img 
                  src="https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/nvmi6vchohhlszzbdhna.jpg" 
                  alt="Brobondo Properties Showcase 1"
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 my-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <FaLightbulb className="text-3xl text-blue-600 dark:text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To be the market leader in Real Estate Market in Zimbabwe by 2030.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <FaChartLine className="text-3xl text-blue-600 dark:text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To provide world class sustainable infrastructural development services in an ethical & environmentally friendly manner
                    whilst ensuring that all our employees & stakeholders best interests are protected & enhanced.
                  </p>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative overflow-hidden rounded-xl shadow-lg aspect-[16/9] my-12 group"
              >
                <img 
                  src="https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/ioy2pqsvch4sytocaztq.jpg" 
                  alt="Brobondo Properties Showcase 2"
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Our Values</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <FaChartLine className="text-3xl text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Excellence</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    We strive for excellence in every aspect of our service, from property management to client relationships.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <FaHandshake className="text-3xl text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Integrity</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    We conduct our business with the highest standards of professionalism, honesty, and transparency.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <FaLightbulb className="text-3xl text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Innovation</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    We embrace innovative solutions and modern technologies to enhance our services and client experience.
                  </p>
                </motion.div>
              </div>


              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative overflow-hidden rounded-xl shadow-lg aspect-[16/9] my-12 group"
              >
                <img 
                  src="https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/krqpdzrbux26bewfalml.jpg" 
                  alt="Brobondo Properties Showcase 3"
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-8 text-center">Why Choose Brobondo?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <FaChartLine className="text-2xl text-blue-600 dark:text-blue-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Market Experience</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Extensive experience in the Zimbabwean real estate market, providing unmatched local expertise
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <FaUsers className="text-2xl text-blue-600 dark:text-blue-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Expert Team</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Professional and dedicated team of real estate experts committed to your success
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <FaHome className="text-2xl text-blue-600 dark:text-blue-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Complete Solutions</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Comprehensive property solutions under one roof for all your real estate needs
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <FaHandshake className="text-2xl text-blue-600 dark:text-blue-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Client Focus</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Strong focus on client satisfaction and building long-term relationships
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <FaCog className="text-2xl text-blue-600 dark:text-blue-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quality Commitment</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Unwavering commitment to quality and sustainable development practices
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <FaBuilding className="text-2xl text-blue-600 dark:text-blue-400 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Continuously innovating to provide modern solutions in real estate
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Contact Information */}
              <div className="mt-16 p-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Contact Us</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Office Address</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      2 Allenby Road<br />
                      Highlands, Harare
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Details</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Phone: +263 (242) 752781-3<br />
                      Mobile: +263 717 017 379
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Working Hours</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday – Friday<br />
                      08:00 AM – 16:30 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
}