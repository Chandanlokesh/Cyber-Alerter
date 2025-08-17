'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaEye, FaBell, FaGithub, FaLinkedin } from 'react-icons/fa';
import '../styles/App.css';
import PricingSection from '../components/pricingsection.tsx';
import security from '../images/security.png'
import { Link } from 'react-router-dom';
import logo from '../images/logo-basic.png';

const features = [
    {
        title: 'Quick Scan',
        description: 'Run rapid scans for vulnerabilities and get instant insights.',
        icon: <FaSearch size={28} className="text-[#0273E6]" />,
    },
    {
        title: 'Monitor Scan',
        description: 'Continuously monitor your systems and get automatic updates.',
        icon: <FaEye size={28} className="text-[#0273E6]" />,
    },
    {
        title: 'Notification',
        description: 'Get real-time alerts when new threats are detected.',
        icon: <FaBell size={28} className="text-[#0273E6]" />,
    },
];

const LandingPage = () => {
    return (

        <div className="w-full overflow-hidden bg-white">
            {/* Header */}
            <header className="w-full flex justify-between items-center px-12 py-6 absolute top-0 left-0 z-10">
<div className="flex items-center text-center">
    <img src={logo} alt="Dashboard Icon" className="w-12 h-12" />
    <span className="text-2xl font-bold text-[#0273E6]">Cyber Alerter</span>
  </div>                <nav className="space-x-6">
                    {/* <button className="text-gray-700 hover:text-[#0273E6] transition">About</button> */}
                    <a href="#contact" className="text-gray-700 hover:text-[#0273E6] transition">Contact</a>

                    <Link to="/login" className="bg-[#0273E6] text-white px-4 py-2 rounded-md hover:bg-[#025ac0] transition">
                        Sign In
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <div className="relative w-full h-screen flex items-center justify-start pl-12 pr-0">
                <div className="z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="z-10"
                    >
                        <h1 className="text-5xl font-extrabold leading-tight mb-6">
                            Vulnerability Monitoring<br />
                            Made Simple with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8cc6ff] via-[#0273E6] to-[#003A80]">
                                Cyber Alerter
                            </span>
                        </h1>

                        <p className="text-lg text-gray-700 mb-8 max-w-xl">
                            Scan, monitor, and get notified about vulnerabilities — all in one place.
                            Fast, simple, and powerful monitoring at your fingertips.
                        </p>

                        <button className="animated-button">
                            <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
                                <path
                                    d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                                ></path>
                            </svg>
                            <Link to="/login" className="text">Get Started</Link>
                            <span className="circle"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
                                <path
                                    d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                                ></path>
                            </svg>
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Hero Image */}
            <img
                src={security}
                alt="Cyber Security Illustration"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 h-[700px] bigscreen:h-[1000px] h-auto z-0"
            />
            <section className="w-full pb-24 px-6">
                <h2 className="text-4xl text-gray-900 font-bold mb-12 text-center">Powerful Features</h2>
                <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className=""
                        >

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.1, delay: index * 0.15 }}
                                viewport={{ once: true, amount: 0.5 }}
                                className=""
                            >
                                <div
                                    className="bg-gradient-to-br from-white to-blue-100 border-2 border-transparent 
                                       hover:border-[3px] hover:from-white hover:to-blue-200 
                                       hover:border-[conic-gradient(from_180deg_at_50%_50%,#0273E6,#003A80)] 
                                       p-6 rounded-2xl text-gray-800 transition duration-300 
                                       shadow-xl group hover:shadow-2xl relative overflow-hidden"
                                >
                                    <div className="mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                                    <p className="text-gray-700">{feature.description}</p>
                                </div>
                            </motion.div>

                        </div>
                    ))}
                </div>
            </section>
            {/* Contact Section */}
            <section className="w-full bg-gray-900 text-white text-center py-20 px-6" id="contact">
                <h2 className="text-3xl font-bold mb-4">Want more features?</h2>
                <p className="text-lg mb-6">Contact us and let's discuss how Cyber Alerter can help your organization.</p>
                <button className="bg-white text-[#0273E6] px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition">
                    Contact Us
                </button>
            </section>

            {/* Pricing Section */}
            <PricingSection />

            {/* Footer */}
            <footer className="w-full bg-gray-900 text-white px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                <div className="text-sm">&copy; {new Date().getFullYear()} Cyber Alerter. All rights reserved.</div>
                <div className="flex space-x-4">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <FaGithub size={20} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin size={20} />
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;


