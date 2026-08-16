import { Network, Users, ClipboardList } from "lucide-react";

export default function About() {
  const features = [
    {
      title: "Hierarchical Organization Management",
      description: "Organize your church structures with districts, sections, and local churches in a clear hierarchy.",
      icon: Network,
    },
    {
      title: "Pastor Management",
      description: "Track pastor information, assignments, and retirement status across your organization.",
      icon: Users,
    },
    {
      title: "Retirement Coordination",
      description: "Coordinate retirement benefits and planning for pastors with comprehensive tracking.",
      icon: ClipboardList,
    },
  ];

  return (
    <section id="about" className="scroll-mt-16 bg-gray-50 py-20">
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
          {features.map(({ title, description, icon: Icon }, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <Icon className="size-9 mb-4 text-blue-600" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold mb-3">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
