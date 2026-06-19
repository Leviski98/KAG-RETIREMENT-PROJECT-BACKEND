export default function About() {
  const features = [
    {
      title: "Hierarchical Organization Management",
      description: "Organize your church structures with districts, sections, and local churches in a clear hierarchy.",
      icon: "🏛️",
    },
    {
      title: "Pastor Management",
      description: "Track pastor information, assignments, and retirement status across your organization.",
      icon: "👨‍💼",
    },
    {
      title: "Retirement Coordination",
      description: "Coordinate retirement benefits and planning for pastors with comprehensive tracking.",
      icon: "📋",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-center">
            About KAG Retirement System
          </h2>
          <p className="text-gray-600 text-center mb-4">
            The KAG Retirement Management System is designed to streamline the coordination and tracking of pastor retirement information across districts, sections, and local churches.
          </p>
          <p className="text-gray-600 text-center">
            Manage your church organization with confidence using our comprehensive tools for organization management, pastor tracking, and retirement coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
