import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImages } from '../contexts/ImageContext';
import { Camera, Upload, GalleryHorizontal, Shield, Users, Clock, CheckCircle, Search, Bell, User } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';

const Home = () => {
  const { images, fetchImages } = useImages();
  const [featuredImages, setFeaturedImages] = useState([]);
  const [latestImages, setLatestImages] = useState([]);

  useEffect(() => {
    fetchImages('approved');
  }, [fetchImages]);

  useEffect(() => {
    if (images.length > 0) {
      // Get featured images (first 4 approved images)
      setFeaturedImages(images.slice(0, 4));
      // Get latest images (last 4 approved images)
      setLatestImages(images.slice(-4).reverse());
    }
  }, [images]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Single Navigation Bar - Full Width */}
      <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Academic Gallery</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium border-b-2 border-blue-600 pb-1">Home</Link>
              <Link to="/gallery" className="text-gray-700 hover:text-blue-600 font-medium">Gallery</Link>
              <Link to="/upload" className="text-gray-700 hover:text-blue-600 font-medium">Upload</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Contained */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full relative min-h-[60vh] h-[500px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?w=1440&h=800&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Showcase Your Academic Achievements
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-gray-100"
            >
              Share your research, projects, and creative works with the college community
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Upload Your Work
              </Link>
              <Link
                to="/gallery"
                className="bg-white text-gray-900 px-10 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-gray-200"
              >
                Explore Gallery
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Student Work - Contained */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Featured Student Work</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover outstanding projects and creative works from our talented students
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    filename={image.filename}
                    alt={image.caption}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{image.caption}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">by {image.uploader_name}</p>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                      Approved
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Approved Uploads - Contained */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Latest Approved Uploads</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Recent submissions that have been approved and published
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    filename={image.filename}
                    alt={image.caption}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{image.caption}</h3>
                  <p className="text-sm text-gray-600 mb-3">by {image.uploader_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                      Approved
                    </span>
                    <span className="text-xs text-gray-500">{new Date(image.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Contained */}
      <footer className="w-full bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">© 2023 Academic Gallery. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
