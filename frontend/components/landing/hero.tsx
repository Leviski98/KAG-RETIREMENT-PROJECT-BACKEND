"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-linear-to-b from-blue-600 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Welcome to KAG Retirement
          </h1>
          <p className="text-lg lg:text-xl mb-2 opacity-95">
            Empowering Retiring Pastors with Confidence
          </p>
          <p className="text-base opacity-90 mb-10 max-w-2xl mx-auto">
            A comprehensive solution to manage pastors, districts, and retirement planning for Kenya Assemblies of God
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-auto">
          <path d="M0,30 Q300,0 600,30 T1200,30 L1200,60 L0,60 Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
