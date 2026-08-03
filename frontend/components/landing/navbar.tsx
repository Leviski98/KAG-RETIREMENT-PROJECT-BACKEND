"use client";

import Link from "next/link";

export default function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-blue-600 to-blue-500">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          KAG Retirement
        </Link>
        <div className="flex items-center gap-8">
          <nav className="flex gap-8">
            <a href="#about" className="text-white hover:text-blue-100 transition">
              About
            </a>
            <a href="#features" className="text-white hover:text-blue-100 transition">
              Features
            </a>
            <a href="#" className="text-white hover:text-blue-100 transition">
              Contact
            </a>
          </nav>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
