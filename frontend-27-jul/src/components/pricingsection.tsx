'use client';
import React from 'react';
import { FaInbox, FaRocket } from 'react-icons/fa';
import { HiCheckCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';

const PricingSection = () => {
    return (
        <section className="w-full py-24 px-6 md:px-12 bg-gradient-to-b from-white via-blue-100 to-blue-200">
            <div className="max-w-5xl mx-auto text-center mb-16">
                <h2 className="text-5xl font-bold mb-4">
                    Choose Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                        Plan
                    </span>
                </h2>
                <p className="text-xl text-gray-700">Flexible pricing for teams of all sizes</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                {/* Free Plan */}
                <motion.div

                    className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl hover:shadow-blue-200/60 transition-all"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <FaInbox className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-6">
                        $0<span className="text-lg text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-4 text-gray-700 mb-8">
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-blue-500" /> 10 Quick Scans / day
                        </li>
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-blue-500" /> Monitor 5 Products
                        </li>
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-blue-500" /> Email Notifications
                        </li>
                    </ul>
                    <button className=" mt-20 w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white py-3 rounded-xl hover:from-blue-400 hover:to-sky-400 transition-all duration-300 hover:scale-105 shadow-md">
                        Get Started Free
                    </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div

                    className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl hover:shadow-pink-200/60 transition-all relative"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <FaRocket className="text-purple-500" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-6">
                        $29<span className="text-lg text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-4 text-gray-700 mb-8">
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-purple-500" /> Unlimited Quick Scans
                        </li>
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-purple-500" /> Monitor 50 Products
                        </li>
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-purple-500" /> Real-time Alerts
                        </li>
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-purple-500" /> Advanced Analytics
                        </li>
                        <li className="flex items-center gap-3">
                            <HiCheckCircle className="text-purple-500" /> Priority Support
                        </li>
                    </ul>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 hover:scale-105 shadow-md">
                        Start Pro Trial
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
export default PricingSection;
