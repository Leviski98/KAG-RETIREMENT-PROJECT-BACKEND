"use client";

export default function Features() {
  const features = [
    {
      title: "Hierarchical Organization Management",
      description: "Efficiently organize and manage your church structure across districts, sections, and local churches.",
      icon: "🏛️",
      hasImage: true,
      imagePosition: "left",
    },
    {
      title: "Faster Assignment & Role Tracking",
      description: "Quickly assign roles and track pastor positions across your entire organization with real-time updates.",
      icon: "👥",
      hasImage: true,
      imagePosition: "right",
    },
    {
      title: "Statistics & Reporting Dashboard",
      description: "Get comprehensive insights with detailed analytics and customizable reports for better decision making.",
      icon: "📊",
      hasImage: true,
      imagePosition: "left",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
          Powerful Features
        </h2>
        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Streamline your church management with our comprehensive feature set
        </p>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {feature.imagePosition === "left" ? (
                <>
                  {/* Image */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 lg:h-80 flex items-center justify-center">
                    <div className="text-6xl">{feature.icon}</div>
                  </div>
                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <button className="text-blue-600 font-semibold hover:text-blue-800 transition">
                      Learn more →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <button className="text-blue-600 font-semibold hover:text-blue-800 transition">
                      Learn more →
                    </button>
                  </div>
                  {/* Image */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 lg:h-80 flex items-center justify-center">
                    <div className="text-6xl">{feature.icon}</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
