"use client";

import { Network, UserCheck, BarChart3 } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Hierarchical Organization Management",
      description: "Efficiently organize and manage your church structure across districts, sections, and local churches.",
      icon: Network,
      hasImage: true,
      imagePosition: "left",
    },
    {
      title: "Faster Assignment & Role Tracking",
      description: "Quickly assign roles and track pastor positions across your entire organization with real-time updates.",
      icon: UserCheck,
      hasImage: true,
      imagePosition: "right",
    },
    {
      title: "Statistics & Reporting Dashboard",
      description: "Get comprehensive insights with detailed analytics and customizable reports for better decision making.",
      icon: BarChart3,
      hasImage: true,
      imagePosition: "left",
    },
  ];

  return (
    <section id="features" className="scroll-mt-16 py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
          Powerful Features
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Streamline your church management with our comprehensive feature set
        </p>

        <div className="space-y-16">
          {features.map(({ title, description, icon: Icon, imagePosition }, index) => {
            const art = (
              <div className="bg-linear-to-br from-brand-100 to-brand-50 rounded-lg h-64 lg:h-80 flex items-center justify-center">
                <Icon className="size-20 text-primary" strokeWidth={1.25} />
              </div>
            );
            const content = (
              <div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
                <button className="text-primary font-semibold hover:text-brand-700 transition">
                  Learn more →
                </button>
              </div>
            );

            return (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {imagePosition === "left" ? (
                  <>
                    {art}
                    {content}
                  </>
                ) : (
                  <>
                    {content}
                    {art}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
