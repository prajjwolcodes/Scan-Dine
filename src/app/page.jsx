"use client";

import { motion } from "framer-motion";
import {
  AlarmClock,
  Armchair,
  BarChart3,
  CircleDollarSign,
  Clock,
  Code,
  DollarSign,
  Mail,
  MapPin,
  Menu,
  Phone,
  Pizza,
  Rocket,
  Sparkles,
  Target,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ScanAndDineLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    restaurant: "",
    message: "",
  });
  // State to store window dimensions, initialized to null for SSR safety
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 1. Scroll handler
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // 2. Initial window dimensions for animation
    // This code only runs on the client side
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // 3. Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const staggerContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.15 },
    },
  };

  // Condition to prevent render of animation particles during SSR
  const isClient = typeof window !== "undefined";

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-[#1E1E1E] shadow-lg" : "bg-none"
        }`}
      >
        <nav className="max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => scrollToSection("hero")}
            >
              <span className="text-xl font-bold text-white">Scan & Dine</span>
            </motion.div>

            <div className="hidden text-base md:flex items-center gap-8">
              {["features", "about", "contact"].map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.1 }}
                  className="text-white cursor-pointer hover:text-gray-300 hover:underline font-medium transition-colors"
                  onClick={() => scrollToSection(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </motion.button>
              ))}

              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-white text-black cursor-pointer px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-all"
                >
                  Login
                </motion.button>
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-4 pb-4 space-y-4"
            >
              {["features", "about", "contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block text-white hover:text-gray-300 font-medium"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
              <button className="bg-white text-black px-6 py-2 rounded-full font-semibold w-full">
                Login
              </button>
            </motion.div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative pt-32 pb-20 px-6 bg-[#1E1E1E] text-white min-h-screen 
             flex items-center 
             bg-cover bg-center"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0"></div>

        {/* Floating light particles (Client-side render only) */}
        {isClient && windowDimensions.width > 0 && (
          <motion.div
            className="absolute inset-0 z-5 pointer-events-none"
            initial="hidden"
            animate="show"
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                initial={{
                  // Use windowDimensions state which is only set on the client
                  x: Math.random() * windowDimensions.width,
                  y: windowDimensions.height + 10,
                  scale: 0.5,
                }}
                animate={{
                  y: -50,
                  x: Math.random() * windowDimensions.width,
                  scale: 1,
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 8 + Math.random() * 4,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Content layer */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Text Content */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold leading-tight text-white"
            >
              Dining Reimagined for the{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Digital Age
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 leading-relaxed"
            >
              Transform your restaurant experience with QR-powered digital
              menus. Faster service, happier customers, seamless operations.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 shadow-lg"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => scrollToSection("features")}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Menu Card */}
          {/* Right Modern Glass Menu Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative h-[500px]"
          >
            {/* Floating Cards Design */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Main QR Card - Center */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative z-30 bg-white rounded-3xl shadow-2xl p-8 w-72 cursor-pointer"
              >
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Scan to Order
                  </div>
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-black via-gray-800 to-black rounded-2xl p-2">
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center p-4">
                      <QRCodeSVG value="https://www.instagram.com/prajzwolslimsulek/" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-black">Table 7</div>
                </div>
              </motion.div>

              {/* Floating Menu Card - Top Left */}
              <motion.div
                initial={{ opacity: 0, x: -50, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.05, rotate: -3 }}
                className="absolute top-0 left-0 z-20 border border-gray-700 rounded-2xl shadow-xl p-6 w-56 cursor-pointer"
              >
                <div className="text-white space-y-3">
                  <div className="text-3xl">🍔</div>
                  <div className="font-bold text-lg">Ham Burger</div>
                  <div className="text-gray-400 text-sm">
                    Fresh mozzarella, spicy
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold">$12.99</span>
                    <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all">
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Floating Order Card - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: -50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="absolute bottom-0 right-0 z-20 bg-white rounded-2xl shadow-xl p-6 w-56 cursor-pointer border-2 border-black"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-black">
                      Your Order
                    </span>
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { name: "Pizza", price: 1199 },
                      { name: "Burger", price: 499 },
                      { name: "Salad", price: 199 },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1.2 + idx * 0.1 }}
                        className="flex justify-between text-gray-600"
                      >
                        <span>1x {item.name}</span>
                        <span className="font-semibold text-black">
                          Rs. {item.price}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="pt-3 border-t-2 border-black">
                    <div className="flex justify-between items-center font-bold text-black">
                      <span>Total</span>
                      <span className="text-xl">Rs. 1999</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Stats Card - Top Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ scale: 1.1 }}
                className="absolute top-10 right-10 z-10 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg p-4 w-32 cursor-pointer border border-gray-200"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">⚡</div>
                  <div className="text-2xl font-bold text-black mt-2">5m</div>
                  <div className="text-xs text-gray-600 font-semibold">
                    Avg Order
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-20 px-6 bg-white"
      >
        <motion.div
          variants={fadeInUp}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Why Choose Scan and Dine?
          </h2>
          <p className="text-xl text-gray-600">
            Modern solutions for modern restaurants
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Instant Access",
              desc: "Customers scan and browse immediately. No app downloads, no waiting for staff.",
            },
            {
              icon: Target,
              title: "Zero Errors",
              desc: "Digital orders mean accuracy — what’s shown is what’s served.",
            },
            {
              icon: DollarSign,
              title: "Cost Efficient",
              desc: "No more reprinting menus. Update items instantly with ease.",
            },
            {
              icon: Sparkles,
              title: "Hygienic Solution",
              desc: "Contactless menus for a safer, cleaner dining experience.",
            },
            {
              icon: BarChart3,
              title: "Smart Analytics",
              desc: "Track customer trends and menu performance effortlessly.",
            },
            {
              icon: Rocket,
              title: "Easy Setup",
              desc: "Generate QR codes and start serving smarter instantly.",
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="group bg-gray-50 p-8 rounded-2xl hover:bg-[#1E1E1E] hover:text-white transition-all border border-gray-200"
            >
              <div className="w-16 h-16 bg-[#1E1E1E] group-hover:bg-white rounded-xl flex items-center justify-center mb-6 transition-colors">
                <f.icon className="w-8 h-8 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-600 group-hover:text-gray-300 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                Revolutionizing Restaurant Service
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Scan and Dine was born from a simple observation: dining should
                be enjoyable, not frustrating. We've eliminated the wait times,
                the errors, and the inefficiencies that plague traditional
                restaurant service.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our QR-based digital menu system empowers restaurants to operate
                smarter while giving customers the control and convenience they
                deserve. It's not just technology—it's hospitality reimagined.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-8">
                {[
                  { number: "50%", label: "Faster Service" },
                  { number: "90%", label: "Error Reduction" },
                  { number: "100%", label: "Customer Satisfaction" },
                  { number: "24/7", label: "Menu Updates" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-center cursor-pointer"
                  >
                    <div className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-96"
            >
              {/* Modern Dashboard Preview */}
              <div className="relative w-full h-full">
                {/* Main Dashboard Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border border-gray-700 overflow-hidden"
                >
                  <div className="p-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          Dashboard
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Real-time insights
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-gray-400">Live</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        {
                          label: "Orders Today",
                          value: "247",
                          icon: <Pizza />,
                          iconColor: "text-yellow-400",
                        },
                        {
                          label: "Active Tables",
                          value: "18",
                          icon: <Armchair />,
                          iconColor: "text-blue-400",
                        },
                        {
                          label: "Revenue",
                          value: "$3.2K",
                          icon: <CircleDollarSign />,
                          iconColor: "text-green-400",
                        },
                        {
                          label: "Avg Time",
                          value: "12m",
                          icon: <AlarmClock />,
                          iconColor: "text-red-400",
                        },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className={`border border-gray-500 rounded-xl p-4 cursor-pointer`}
                        >
                          <div className={`text-2xl mb-2 ${stat.iconColor}`}>
                            {stat.icon}
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {stat.value}
                          </div>
                          <div className="text-xs text-white/80">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Live Orders */}
                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-white">
                          Recent Orders
                        </span>
                        <span className="text-xs text-gray-400">
                          Last 5 mins
                        </span>
                      </div>
                      <div className="space-y-2">
                        {[
                          {
                            table: "Table 12",
                            items: "3 items",
                            time: "2m ago",
                          },
                          {
                            table: "Table 5",
                            items: "5 items",
                            time: "4m ago",
                          },
                        ].map((order, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.3,
                              delay: 0.8 + idx * 0.1,
                            }}
                            className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-white font-medium">
                                {order.table}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {order.items}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {order.time}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Success Notification */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -top-4 -right-4 bg-gray-100 rounded-2xl shadow-2xl p-4 w-56 border-2 border-green-500"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <div>
                      <div className="font-bold text-black text-sm">
                        Order Completed!
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Table 8 paid Rs. 499
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Just now</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-20 px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Ready to transform your restaurant? Let’s talk.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
            >
              <form
                action="https://formsubmit.co/shresthaprajjwol444@gmail.com"
                method="POST"
                className="space-y-6"
              >
                {["name", "email", "restaurant", "message"].map(
                  (field, idx) => (
                    <motion.div key={idx} variants={fadeInUp}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                        {field === "restaurant" ? "Restaurant Name" : field}
                      </label>
                      {field !== "message" ? (
                        <input
                          type={field === "email" ? "email" : "text"}
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          placeholder={`Your ${field}`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none"
                        />
                      ) : (
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us about your needs..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none resize-none"
                        />
                      )}
                    </motion.div>
                  )
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="submit"
                  className="w-full bg-[#1E1E1E] text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-6">
              <h3 className="text-3xl font-bold text-black mb-8">
                Let’s Connect
              </h3>
              {[
                {
                  icon: Mail,
                  title: "Email",
                  content: "shresthaprajjwol4@gmail.com",
                },
                { icon: Phone, title: "Phone", content: "9746509973" },
                {
                  icon: MapPin,
                  title: "Location",
                  content: "Lainchour, Kathmandu, Nepal",
                },
                {
                  icon: Clock,
                  title: "Business Hours",
                  content: "Mon-Fri: 9 AM - 6 PM\nSat-Sun: Closed",
                },
                {
                  icon: User,
                  title: "Support",
                  content: "Available 24/7 to assist you with any inquiries.",
                },
                {
                  icon: Code,
                  title: "Creators",
                  content:
                    "Nineytika Shrestha - Kripesh Adhikari - Prajjwol Shrestha",
                },
              ].map((info, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ x: 5 }}
                  className="flex gap-4"
                >
                  <div className="w-14 h-14 bg-[#1E1E1E] rounded-xl flex items-center justify-center">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1">{info.title}</h4>
                    <p className="text-gray-600 whitespace-pre-line">
                      {info.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#1E1E1E] text-white py-12 px-6 border-t border-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-7xl mx-auto text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {["features", "about", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
            <button className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </button>
          </div>
          <p className="text-gray-500">
            © 2025 Scan and Dine. All rights reserved.
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
