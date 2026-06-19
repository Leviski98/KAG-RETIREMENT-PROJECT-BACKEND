"use client";

import { MapPin, Phone, Mail, Building2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Left Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white text-blue-700 p-2 rounded">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold">KAG Retirement</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Empowering the Kenya Assemblies of God with a streamlined retirement management system for pastors and church leaders.
            </p>
          </div>

          {/* Middle Section */}
          <div>
            <h4 className="font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm text-blue-100">
              <li>
                <a href="#" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Right Section */}
          <div>
            <h4 className="font-bold mb-6 text-white">Contact</h4>
            <ul className="space-y-4 text-sm text-blue-100">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="flex-shrink-0" />
                <span>Laikipia, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="flex-shrink-0" />
                <a href="tel:+254723078990" className="hover:text-white transition">
                  +254 723 078 990
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-shrink-0" />
                <a href="mailto:kagretirement@gmail.com" className="hover:text-white transition">
                  kagretirement@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-700 pt-8 text-center text-sm text-blue-100">
          <p>&copy; 2026 Kenya Assemblies of God. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
