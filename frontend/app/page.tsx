"use client";

import Hero from "@/components/landing/hero";
import About from "@/components/landing/about";
import Features from "@/components/landing/features";
import CTA from "@/components/landing/cta";
import LandingNavbar from "@/components/landing/navbar";
import LandingFooter from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="pt-16">
      <LandingNavbar />
      <Hero />
      <About />
      <Features />
      <CTA />
      <LandingFooter />
    </div>
  );
}