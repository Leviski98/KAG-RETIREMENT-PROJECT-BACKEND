"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-brand-600 to-brand-500">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* The mark is deep blue on transparent, so it needs a light chip to
              stay legible against the blue header. */}
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <Image
              src="/images/logo.png"
              alt=""
              width={40}
              height={40}
              className="size-full object-contain"
              priority
            />
          </span>
          <span className="text-2xl font-bold text-white">KAG Retirement</span>
        </Link>
        <div className="flex items-center gap-8">
          <nav className="flex gap-8">
            <a href="#about" className="text-white hover:text-primary-foreground/80 transition">
              About
            </a>
            <a href="#features" className="text-white hover:text-primary-foreground/80 transition">
              Features
            </a>
            <a href="#contact" className="text-white hover:text-primary-foreground/80 transition">
              Contact
            </a>
          </nav>
          <Link
            href="/login"
            className="bg-white text-primary px-6 py-2 rounded-lg hover:bg-brand-50 transition font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
